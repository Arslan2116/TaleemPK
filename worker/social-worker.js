/**
 * ══════════════════════════════════════════════════════════════
 *  TaleemPK — Social Media Auto-Poster (Cloudflare Worker)
 *  Runs daily at 9:00 AM PKT (04:00 UTC)
 *
 *  Platforms : Facebook Page · Instagram Business · Twitter/X
 *  Content   : University Cards · Scholarships · Deadlines · Tips
 *  Images    : Custom branded PNG generated per post (SVG → PNG via resvg)
 *  Storage   : Supabase Storage (social-images bucket)
 *  AI        : Gemini 2.0 Flash
 *
 *  Deploy via Wrangler CLI (see SOCIAL-SETUP.md)
 *
 *  Required secrets:
 *    GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
 *    SUPABASE_SERVICE_KEY, FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN,
 *    IG_USER_ID, TWITTER_API_KEY, TWITTER_API_SECRET,
 *    TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 * ══════════════════════════════════════════════════════════════
 */

import initResvg, { Resvg } from '@resvg/resvg-wasm';

// One-time WASM initialisation (cached after first call)
let wasmReady = false;
async function ensureWasm() {
  if (wasmReady) return;
  const wasmRes = await fetch(
    'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
  );
  await initResvg(wasmRes);
  wasmReady = true;
}

// ── Constants ────────────────────────────────────────────────────
const POST_TYPES = ['university', 'tips', 'scholarship', 'deadline'];
const SITE_URL   = 'https://taleempk.pk';
const OG_STATIC  = 'https://taleempk.pk/og-image.png'; // fallback

// Brand colours
const C = {
  navy      : '#0A1628',
  navyMid   : '#112240',
  green     : '#00C853',
  greenDark : '#00A040',
  white     : '#FFFFFF',
  gray      : '#9BA5B5',
  gold      : '#FFB800',
};

// ── Entry Points ─────────────────────────────────────────────────
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailyPost(env));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    // Gate sensitive endpoints behind a shared secret header
    const isProtected = url.pathname === '/run-now' || url.pathname === '/preview-image';
    if (isProtected) {
      const secret = request.headers.get('X-Trigger-Secret') || url.searchParams.get('key') || '';
      if (!env.TRIGGER_SECRET || secret !== env.TRIGGER_SECRET) {
        return new Response('Forbidden', { status: 403 });
      }
    }
    if (url.pathname === '/run-now') {
      const result = await runDailyPost(env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Preview a card image directly in browser
    if (url.pathname === '/preview-image') {
      try {
        await ensureWasm();
        const svg = buildUniversityCard({
          name: 'NUST', full_name: 'National University of Sciences & Technology',
          city: 'Islamabad', sector: 'public', rank: 1,
          fee: 'Rs. 1.2–1.4L/sem', merit: '140+/200 NET',
          entry: 'NUST NET', programs: ['Engineering','CS','Business','Architecture']
        });
        const png = svgToPng(svg);
        return new Response(png, { headers: { 'Content-Type': 'image/png' } });
      } catch(e) {
        return new Response(`Error: ${e.message}`, { status: 500 });
      }
    }
    return new Response(
      JSON.stringify({ status: 'TaleemPK Social Worker OK', time: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ── Main Orchestrator ─────────────────────────────────────────────
async function runDailyPost(env) {
  const log = [];
  try {
    // Initialise WASM renderer
    await ensureWasm();

    const dayOfYear = getDayOfYear();
    const postType  = POST_TYPES[dayOfYear % POST_TYPES.length];
    log.push({ step: 'start', postType, utc: new Date().toISOString() });

    // Pull data from Supabase
    const data = await fetchData(env, postType, dayOfYear);
    log.push({ step: 'data_fetched', count: data.length });

    // Generate branded PNG image
    const imageUrl = await generateAndUploadImage(env, postType, data);
    log.push({ step: 'image_ready', imageUrl });

    // If image generation fell back to the static OG image, skip the post
    // (avoids posting identical content every day if the WASM/Storage pipeline breaks)
    if (imageUrl === OG_STATIC) {
      log.push({ step: 'skipped', reason: 'image fallback — not posting duplicate static OG' });
      return { success: false, skipped: true, log };
    }

    // Generate post text via Gemini
    const content = await generateContent(env, postType, data, imageUrl);
    log.push({ step: 'content_ready', twitter_preview: content.twitter });

    // Post to all platforms in parallel
    const [fbRes, igRes, twRes] = await Promise.allSettled([
      env.FB_PAGE_ID && env.FB_PAGE_ACCESS_TOKEN
        ? postToFacebook(env, content.facebook, imageUrl)
        : Promise.resolve({ skipped: true }),

      env.IG_USER_ID && env.FB_PAGE_ACCESS_TOKEN
        ? postToInstagram(env, content.instagram, imageUrl)
        : Promise.resolve({ skipped: true }),

      env.TWITTER_API_KEY
        ? postToTwitter(env, content.twitter, imageUrl)
        : Promise.resolve({ skipped: true })
    ]);

    const results = {
      facebook  : fbRes.status === 'fulfilled' ? fbRes.value : { error: fbRes.reason?.message },
      instagram : igRes.status === 'fulfilled' ? igRes.value : { error: igRes.reason?.message },
      twitter   : twRes.status === 'fulfilled' ? twRes.value : { error: twRes.reason?.message }
    };

    log.push({ step: 'done', results });
    return { success: true, log };

  } catch (err) {
    log.push({ step: 'fatal_error', message: err.message });
    return { success: false, log };
  }
}

// ══════════════════════════════════════════════════════════════
//  IMAGE GENERATION
// ══════════════════════════════════════════════════════════════

async function generateAndUploadImage(env, postType, data) {
  try {
    // Build SVG based on content type
    let svg;
    if      (postType === 'university'  && data[0]) svg = buildUniversityCard(data[0]);
    else if (postType === 'scholarship' && data.length) svg = buildScholarshipCard(data);
    else if (postType === 'deadline'    && data.length) svg = buildDeadlineCard(data);
    else                                               svg = buildTipsCard(postType, getDayOfYear());

    // Convert SVG → PNG bytes
    const pngBytes = svgToPng(svg);

    // Upload to Supabase Storage and get public URL
    const filename = `post_${Date.now()}.png`;
    const url = await uploadToSupabase(env, pngBytes, filename);
    return url || OG_STATIC;

  } catch (err) {
    console.error('Image generation failed:', err.message);
    return OG_STATIC; // fallback to static image
  }
}

function svgToPng(svgStr) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: 1080 }
  });
  const rendered = resvg.render();
  return rendered.asPng();
}

async function uploadToSupabase(env, pngBytes, filename) {
  const bucket = 'social-images';
  const res = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`,
    {
      method  : 'POST',
      headers : {
        apikey         : env.SUPABASE_SERVICE_KEY,
        Authorization  : `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type' : 'image/png',
        'x-upsert'     : 'true'
      },
      body: pngBytes
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload failed: ${err}`);
  }
  // Return public URL
  return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
}

// ══════════════════════════════════════════════════════════════
//  SVG CARD TEMPLATES  (1080 × 1080)
// ══════════════════════════════════════════════════════════════

/** University Spotlight Card */
function buildUniversityCard(u) {
  const sector     = u.sector || 'private';
  const rankLabel  = u.rank ? `#${u.rank}` : '';
  const programs   = (u.programs || []).slice(0, 4).join('  ·  ');
  const sectorIcon = sector === 'public' ? '🏛️' : sector === 'military' ? '⚔️' : '🏢';
  const rankColor  = (u.rank && u.rank <= 3) ? C.gold : C.green;
  const tagBg      = sector === 'public' ? '#1a3a5c' : '#3a1a2e';
  const tagColor   = sector === 'public' ? '#60a8f8' : '#f06090';

  return svg1080(`
    <!-- Top green accent bar -->
    <rect x="0" y="0" width="1080" height="10" fill="${C.green}" rx="0"/>

    <!-- Header area -->
    <rect x="60" y="48" width="960" height="180" rx="20" fill="${C.navyMid}" opacity="0.6"/>

    <!-- University icon placeholder -->
    <rect x="84" y="68" width="120" height="120" rx="18" fill="${C.white}" opacity="0.08"/>
    <text x="144" y="152" font-size="72" text-anchor="middle" dominant-baseline="middle">${sectorIcon}</text>

    <!-- Rank badge -->
    ${rankLabel ? `
    <rect x="860" y="80" width="140" height="54" rx="27" fill="${rankColor}" opacity="0.18"/>
    <text x="930" y="112" font-size="30" font-weight="700" fill="${rankColor}" text-anchor="middle" font-family="Arial">${rankLabel} in PK</text>
    ` : ''}

    <!-- University short name -->
    <text x="226" y="120" font-size="58" font-weight="700" fill="${C.white}" font-family="Arial, sans-serif">${esc(u.name)}</text>

    <!-- Sector tag -->
    <rect x="226" y="142" width="${sector.length * 14 + 30}" height="36" rx="18" fill="${tagBg}"/>
    <text x="${226 + (sector.length * 7 + 15)}" y="165" font-size="20" fill="${tagColor}" text-anchor="middle" font-family="Arial">${cap(sector)}</text>

    <!-- Full name -->
    <text x="60" y="272" font-size="28" fill="rgba(255,255,255,0.55)" font-family="Arial, sans-serif">${esc((u.full_name || '').slice(0, 55))}${(u.full_name||'').length > 55 ? '…' : ''}</text>

    <!-- Divider -->
    <line x1="60" y1="300" x2="1020" y2="300" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>

    <!-- Data boxes row 1 -->
    ${dataBox(60,  330, 460, 'LOCATION', `${u.city}, ${u.province||'Pakistan'}`)}
    ${dataBox(560, 330, 460, 'SEMESTER FEE', u.fee || '—')}

    <!-- Data boxes row 2 -->
    ${dataBox(60,  500, 460, 'ENTRY TEST', u.entry || '—')}
    ${dataBox(560, 500, 460, 'MERIT', u.merit || '—')}

    <!-- Programs section -->
    <text x="60" y="680" font-size="22" fill="${C.green}" font-weight="700" font-family="Arial">PROGRAMS</text>
    <text x="60" y="720" font-size="28" fill="rgba(255,255,255,0.75)" font-family="Arial">${esc(programs || '—')}</text>

    <!-- Highlights -->
    ${buildHighlightPills(u.highlights || [], 60, 780)}

    <!-- Bottom branding bar -->
    <rect x="0" y="980" width="1080" height="100" fill="${C.green}"/>
    <text x="60" y="1042" font-size="38" font-weight="800" fill="${C.navy}" font-family="Arial">taleempk.pk</text>
    <text x="1020" y="1042" font-size="30" fill="${C.navy}" text-anchor="end" font-family="Arial">Pakistan's #1 University Guide</text>
  `);
}

/** Scholarship Card */
function buildScholarshipCard(scholarships) {
  const items = scholarships.slice(0, 3);
  const rows  = items.map((s, i) => scholarshipRow(s, 280 + i * 200)).join('');
  return svg1080(`
    <rect x="0" y="0" width="1080" height="10" fill="${C.gold}" rx="0"/>
    <text x="540" y="120" font-size="56" font-weight="800" fill="${C.white}" text-anchor="middle" font-family="Arial">🎓 Scholarships</text>
    <text x="540" y="175" font-size="30" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="Arial">Available for Pakistani Students</text>
    <line x1="60" y1="210" x2="1020" y2="210" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    ${rows}
    <rect x="0" y="980" width="1080" height="100" fill="${C.gold}"/>
    <text x="60" y="1042" font-size="38" font-weight="800" fill="${C.navy}" font-family="Arial">taleempk.pk</text>
    <text x="1020" y="1042" font-size="28" fill="${C.navy}" text-anchor="end" font-family="Arial">Find More Scholarships</text>
  `);
}

function scholarshipRow(s, y) {
  return `
    <rect x="60" y="${y}" width="960" height="160" rx="16" fill="${C.navyMid}" opacity="0.7"/>
    <rect x="60" y="${y}" width="8"   height="160" rx="4" fill="${C.gold}"/>
    <text x="100" y="${y + 52}" font-size="30" font-weight="700" fill="${C.white}" font-family="Arial">${esc((s.title||'').slice(0,46))}</text>
    <text x="100" y="${y + 90}" font-size="24" fill="${C.gray}" font-family="Arial">${esc(s.provider||'')}  ·  ${esc(s.coverage||'')}</text>
    ${s.deadline ? `<text x="100" y="${y+130}" font-size="22" fill="${C.gold}" font-family="Arial">Deadline: ${esc(s.deadline)}</text>` : ''}
  `;
}

/** Admission Deadline Card */
function buildDeadlineCard(unis) {
  const rows = unis.slice(0, 5).map((u, i) => deadlineRow(u, 280 + i * 130)).join('');
  return svg1080(`
    <rect x="0" y="0" width="1080" height="10" fill="#FF4757" rx="0"/>
    <text x="540" y="110" font-size="56" font-weight="800" fill="${C.white}" text-anchor="middle" font-family="Arial">Admissions Open!</text>
    <text x="540" y="165" font-size="30" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="Arial">Top Universities — Apply Now</text>
    <line x1="60" y1="200" x2="1020" y2="200" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    ${rows}
    <rect x="0" y="980" width="1080" height="100" fill="#FF4757"/>
    <text x="60" y="1042" font-size="38" font-weight="800" fill="${C.white}" font-family="Arial">taleempk.pk</text>
    <text x="1020" y="1042" font-size="28" fill="${C.white}" text-anchor="end" font-family="Arial">Check All Deadlines</text>
  `);
}

function deadlineRow(u, y) {
  return `
    <rect x="60" y="${y}" width="960" height="110" rx="14" fill="${C.navyMid}" opacity="0.6"/>
    <rect x="60" y="${y}" width="6"   height="110" rx="3" fill="#FF4757"/>
    <text x="100" y="${y + 44}" font-size="32" font-weight="700" fill="${C.white}" font-family="Arial">${esc(u.name)}</text>
    <text x="100" y="${y + 82}" font-size="24" fill="${C.gray}" font-family="Arial">${esc(u.city||'')}  ·  ${esc(u.entry||'')}</text>
    <text x="990" y="${y + 64}" font-size="28" fill="${C.green}" text-anchor="end" font-family="Arial">${esc(u.merit||'')}</text>
  `;
}

/** Tips Card */
function buildTipsCard(type, dayOfYear) {
  const allTips = [
    { title: 'ECAT Preparation',      icon: '📝', tips: ['Start 3 months before the test', 'Focus on FSc Part 1 & 2 syllabus', 'Solve 5 past papers per week', 'Physics & Maths need most attention'] },
    { title: 'MDCAT Strategy',        icon: '🏥', tips: ['Biology carries highest weightage', 'Practice MCQs daily — minimum 50', 'PMC official guide is your best resource', 'Take full mock tests every 2 weeks'] },
    { title: 'Choosing Your Field',   icon: '🎯', tips: ['CS & Engineering have best job market', 'Research average salaries first', 'Visit campuses before deciding', 'Talk to seniors in that field'] },
    { title: 'Scholarship Tips',      icon: '🎓', tips: ['Apply to HEC Need-Based scholarship first', 'Keep your marks above 70%', 'Collect all documents early', 'Never miss the deadline — no exceptions'] },
  ];
  const tip  = allTips[dayOfYear % allTips.length];
  const rows = tip.tips.map((t, i) => tipRow(t, i, 440 + i * 110)).join('');
  return svg1080(`
    <rect x="0" y="0" width="1080" height="10" fill="${C.green}" rx="0"/>
    <text x="540" y="130" font-size="90" text-anchor="middle" dominant-baseline="middle">${tip.icon}</text>
    <text x="540" y="240" font-size="52" font-weight="800" fill="${C.white}" text-anchor="middle" font-family="Arial">${tip.title}</text>
    <text x="540" y="295" font-size="28" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Arial">Study Tips for Pakistani Students</text>
    <line x1="60" y1="330" x2="1020" y2="330" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    ${rows}
    <rect x="0" y="980" width="1080" height="100" fill="${C.green}"/>
    <text x="60" y="1042" font-size="38" font-weight="800" fill="${C.navy}" font-family="Arial">taleempk.pk</text>
    <text x="1020" y="1042" font-size="28" fill="${C.navy}" text-anchor="end" font-family="Arial">More Tips & Guides</text>
  `);
}

function tipRow(text, idx, y) {
  return `
    <rect x="60" y="${y}" width="960" height="90" rx="14" fill="${C.navyMid}" opacity="0.6"/>
    <rect x="60" y="${y}" width="72"  height="90" rx="14" fill="${C.green}" opacity="0.15"/>
    <text x="96" y="${y + 55}" font-size="34" font-weight="800" fill="${C.green}" text-anchor="middle" font-family="Arial">${idx + 1}</text>
    <text x="160" y="${y + 55}" font-size="28" fill="${C.white}" font-family="Arial" dominant-baseline="middle">${esc(text)}</text>
  `;
}

// ── SVG Helpers ───────────────────────────────────────────────────
function svg1080(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <style>
      text { font-family: Arial, Helvetica, sans-serif; }
    </style>
  </defs>
  <!-- Background -->
  <rect width="1080" height="1080" fill="${C.navy}"/>
  <!-- Subtle dot grid -->
  <defs>
    <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.04)"/>
    </pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#dots)"/>
  <!-- Green glow top-center -->
  <radialGradient id="glow" cx="50%" cy="0%" r="60%">
    <stop offset="0%"   stop-color="${C.green}" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="${C.green}" stop-opacity="0"/>
  </radialGradient>
  <rect width="1080" height="600" fill="url(#glow)"/>
  ${inner}
</svg>`;
}

function dataBox(x, y, w, label, value) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="140" rx="16" fill="${C.navyMid}" opacity="0.7"/>
    <text x="${x + 24}" y="${y + 42}" font-size="20" fill="${C.green}" font-weight="700" font-family="Arial">${label}</text>
    <text x="${x + 24}" y="${y + 92}" font-size="30" fill="${C.white}" font-weight="700" font-family="Arial">${esc(String(value).slice(0, 28))}</text>
  `;
}

function buildHighlightPills(highlights, x, y) {
  let out = '';
  let cx  = x;
  highlights.slice(0, 3).forEach(h => {
    const w = Math.min(h.length * 14 + 40, 400);
    out += `
      <rect x="${cx}" y="${y}" width="${w}" height="46" rx="23" fill="rgba(0,200,83,0.12)" stroke="rgba(0,200,83,0.3)" stroke-width="1"/>
      <text x="${cx + w / 2}" y="${y + 29}" font-size="20" fill="${C.green}" text-anchor="middle" font-family="Arial">${esc(h.slice(0, 28))}</text>
    `;
    cx += w + 18;
  });
  return out;
}

function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ══════════════════════════════════════════════════════════════
//  AI CONTENT GENERATION (Gemini)
// ══════════════════════════════════════════════════════════════

async function generateContent(env, postType, data, imageUrl) {
  const prompt = buildPrompt(postType, data, imageUrl);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        contents         : [{ parts: [{ text: prompt }] }],
        generationConfig : { maxOutputTokens: 700, temperature: 0.85 }
      })
    }
  );
  const json = await res.json();
  const raw  = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseContent(raw);
}

function buildPrompt(type, data, imageUrl) {
  const base = `You are TaleemPK's social media manager — Pakistan's #1 university platform.
Audience: Pakistani students 16–22. Language: mix of English and Roman Urdu.
Image has already been created for this post. Just write text captions.
Website: ${SITE_URL}

RESPOND ONLY in this exact format:
===FACEBOOK===
[content]
===INSTAGRAM===
[content]
===TWITTER===
[max 268 chars including link]
===END===
`;

  if (type === 'university' && data[0]) {
    const u = data[0];
    return base + `
University: ${u.full_name || u.name} — Rank #${u.rank}
Fee: ${u.fee} | Entry: ${u.entry} | Merit: ${u.merit} | City: ${u.city}

FACEBOOK: 3–4 engaging sentences about this university. Why apply? What makes it special? End with ${SITE_URL} and hashtags #TaleemPK #Pakistan #Admissions2026
INSTAGRAM: Bullet-point key facts with emojis. Hype it up! 12 relevant hashtags at end.
TWITTER: One punchy fact + ${SITE_URL} + 2 hashtags. Under 268 chars.`;
  }

  if (type === 'scholarship' && data.length) {
    const list = data.map(s => `${s.title}: ${s.coverage}`).join(' | ');
    return base + `
Scholarships: ${list}

FACEBOOK: Motivating post about these opportunities. Link to ${SITE_URL} scholarships. #Scholarships #Pakistan #HEC
INSTAGRAM: Emoji-rich. Each scholarship on its own line. Hashtags at end.
TWITTER: Best scholarship + ${SITE_URL} + #Scholarships. Under 268 chars.`;
  }

  if (type === 'deadline' && data.length) {
    const list = data.slice(0,3).map(u => u.name).join(', ');
    return base + `
Universities with open admissions: ${list}

FACEBOOK: Urgent reminder! Tell students to check now. ${SITE_URL} #Admissions2026 #ECAT #MDCAT
INSTAGRAM: Urgent emojis ⚡📅. Each university name visible. Hashtags at end.
TWITTER: "Admissions open!" + list + ${SITE_URL}. Under 268 chars.`;
  }

  // Tips
  return base + `
Topic: Entry test & university tips for Pakistani students

FACEBOOK: 3 practical tips. Warm friendly tone. End with ${SITE_URL} #TaleemPK #Pakistan
INSTAGRAM: Numbered tips with emojis. Motivating. Hashtags at end.
TWITTER: Single best tip + ${SITE_URL}. Under 268 chars.`;
}

function parseContent(raw) {
  const extract = tag => {
    const m = raw.match(new RegExp(`===\\s*${tag}\\s*===\\s*([\\s\\S]*?)(?====|$)`, 'i'));
    return (m?.[1] || '').trim();
  };
  const fallback = `🎓 Explore 218+ Pakistani universities — fees, merit, scholarships. ${SITE_URL} #TaleemPK`;
  return {
    facebook  : extract('FACEBOOK')  || fallback,
    instagram : extract('INSTAGRAM') || fallback,
    twitter   : (extract('TWITTER')  || fallback).slice(0, 280)
  };
}

// ══════════════════════════════════════════════════════════════
//  SOCIAL PLATFORM APIs
// ══════════════════════════════════════════════════════════════

async function postToFacebook(env, message, imageUrl) {
  // Post with photo
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${env.FB_PAGE_ID}/photos`,
    {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        url          : imageUrl,
        caption      : message,
        access_token : env.FB_PAGE_ACCESS_TOKEN
      })
    }
  );
  const json = await res.json();
  if (json.id || json.post_id) return { ok: true, id: json.post_id || json.id };
  throw new Error(`Facebook: ${json.error?.message || JSON.stringify(json)}`);
}

async function postToInstagram(env, caption, imageUrl) {
  // Step 1 — create media container
  const create = await fetch(
    `https://graph.facebook.com/v19.0/${env.IG_USER_ID}/media`,
    {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        image_url    : imageUrl,
        caption,
        access_token : env.FB_PAGE_ACCESS_TOKEN
      })
    }
  );
  const { id: creationId, error: e1 } = await create.json();
  if (!creationId) throw new Error(`IG create: ${e1?.message}`);

  // Step 2 — publish
  const pub = await fetch(
    `https://graph.facebook.com/v19.0/${env.IG_USER_ID}/media_publish`,
    {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ creation_id: creationId, access_token: env.FB_PAGE_ACCESS_TOKEN })
    }
  );
  const { id, error: e2 } = await pub.json();
  if (!id) throw new Error(`IG publish: ${e2?.message}`);
  return { ok: true, id };
}

async function postToTwitter(env, text) {
  const url     = 'https://api.twitter.com/2/tweets';
  const authHdr = await buildOAuth(env, 'POST', url);
  const res     = await fetch(url, {
    method  : 'POST',
    headers : { Authorization: authHdr, 'Content-Type': 'application/json' },
    body    : JSON.stringify({ text: text.slice(0, 280) })
  });
  const json = await res.json();
  if (json.data?.id) return { ok: true, id: json.data.id };
  throw new Error(`Twitter: ${json.detail || JSON.stringify(json.errors || json)}`);
}

// ── OAuth 1.0a (Twitter) ──────────────────────────────────────
async function buildOAuth(env, method, url) {
  const ts    = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const p     = {
    oauth_consumer_key     : env.TWITTER_API_KEY,
    oauth_nonce            : nonce,
    oauth_signature_method : 'HMAC-SHA1',
    oauth_timestamp        : ts,
    oauth_token            : env.TWITTER_ACCESS_TOKEN,
    oauth_version          : '1.0'
  };
  const sorted  = Object.keys(p).sort().map(k => `${pct(k)}=${pct(p[k])}`).join('&');
  const base    = [method, pct(url), pct(sorted)].join('&');
  const sigKey  = `${pct(env.TWITTER_API_SECRET)}&${pct(env.TWITTER_ACCESS_SECRET)}`;
  const key     = await crypto.subtle.importKey('raw', enc(sigKey), { name:'HMAC', hash:'SHA-1' }, false, ['sign']);
  const sigBuf  = await crypto.subtle.sign('HMAC', key, enc(base));
  p.oauth_signature = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return 'OAuth ' + Object.keys(p).sort().map(k => `${pct(k)}="${pct(p[k])}"`).join(', ');
}

// ── Utilities ─────────────────────────────────────────────────
function getDayOfYear() {
  // UTC-based, no DST drift; January 1 = day 1
  const d = new Date();
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d.getTime() - start) / 86_400_000) + 1;
}
function pct(s) { return encodeURIComponent(String(s)); }
function enc(s) { return new TextEncoder().encode(s); }
