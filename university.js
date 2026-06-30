/* Merit trend data (closing aggregate % over the last 3 years).
 * The years are derived dynamically from the current date so the chart
 * stops claiming "2024" forever. Values are ESTIMATES based on
 * community-reported historical merit — each chart carries a disclaimer.
 * Plan: migrate to a `merit_trends` Supabase table with per-row source_url.
 */
const _trendYear = new Date().getFullYear() - 1;                       // most recent completed admission cycle
const _TY = [String(_trendYear - 2), String(_trendYear - 1), String(_trendYear)];
const MERIT_TRENDS_RAW = {
  1:{y:['2022','2023','2024'],m:[83,84,85]}, 2:{y:['2022','2023','2024'],m:[81,82,84]},
  3:{y:['2022','2023','2024'],m:[73,74,75]}, 4:{y:['2022','2023','2024'],m:[81,83,82]},
  5:{y:['2022','2023','2024'],m:[73,74,75]}, 6:{y:['2022','2023','2024'],m:[63,64,65]},
  7:{y:['2022','2023','2024'],m:[58,59,60]}, 8:{y:['2022','2023','2024'],m:[80,81,82]},
  9:{y:['2022','2023','2024'],m:[86,86,87]},10:{y:['2022','2023','2024'],m:[70,71,72]},
  12:{y:['2022','2023','2024'],m:[85,86,87]},13:{y:['2022','2023','2024'],m:[73,74,75]},
  14:{y:['2022','2023','2024'],m:[63,64,65]},16:{y:['2022','2023','2024'],m:[70,71,72]},
  22:{y:['2022','2023','2024'],m:[68,69,70]},24:{y:['2022','2023','2024'],m:[70,71,72]},
  32:{y:['2022','2023','2024'],m:[43,44,45]},33:{y:['2022','2023','2024'],m:[43,44,45]},
  47:{y:['2022','2023','2024'],m:[80,81,82]},48:{y:['2022','2023','2024'],m:[82,83,84]},
  51:{y:['2022','2023','2024'],m:[60,61,62]},71:{y:['2022','2023','2024'],m:[75,76,77]},
  72:{y:['2022','2023','2024'],m:[80,81,82]},97:{y:['2022','2023','2024'],m:[65,66,67]},
  115:{y:['2022','2023','2024'],m:[60,61,62]},118:{y:['2022','2023','2024'],m:[78,79,80]},
  160:{y:['2022','2023','2024'],m:[63,64,65]},200:{y:['2022','2023','2024'],m:[53,54,55]},
};
// Replace hard-coded year labels with rolling-3-year labels at runtime
const MERIT_TRENDS = {};
Object.keys(MERIT_TRENDS_RAW).forEach(k => { MERIT_TRENDS[k] = { y: _TY, m: MERIT_TRENDS_RAW[k].m }; });
const MERIT_WA_NUMBER = '923353303999';   // admin WhatsApp for merit data submissions

// Prefer the centralised config (config.js sets window.TPK_CONFIG) but keep
// the literal as a fallback so rotation still works if config.js fails to load.
const SB_URL = (window.TPK_CONFIG && window.TPK_CONFIG.SUPABASE_URL) || 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const SB_KEY = (window.TPK_CONFIG && window.TPK_CONFIG.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';
const sb = supabase.createClient(SB_URL, SB_KEY);
const $ = id => document.getElementById(id);
let UNI=null, currentUser=null;
const ADMIN_EMAIL='agondal121@gmail.com';
function isAdmin(){ return currentUser && currentUser.email === ADMIN_EMAIL; }
async function adminDeleteReview(id){ if(!isAdmin()) return; if(!confirm('Delete this review?')) return; await sb.from('reviews').delete().eq('id',id); loadReviews(); }
async function adminDeleteQuestion(id){ if(!isAdmin()) return; if(!confirm('Delete this question and its answers?')) return; await sb.from('questions').delete().eq('id',id); loadQA(); }
document.getElementById('yr').textContent = new Date().getFullYear();

function toSlug(name){
  return (name||'').toLowerCase().replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function getId(){
  // Slug-based URL: /university/nust  (also tolerate a trailing .html from the
  // pre-rendered static file being hit directly at /university/nust.html)
  const pathMatch = location.pathname.match(/\/university\/([^/?#]+)/);
  if(pathMatch) return pathMatch[1].replace(/\.html$/i,''); // returns slug string
  const p = new URLSearchParams(location.search);
  if(p.get('id')) return parseInt(p.get('id'));
  const m = (location.hash||'').match(/uni-(\d+)/); if(m) return parseInt(m[1]);
  return null;
}
function stars(n){ n=Math.round(n||0); return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n); }
function progGroup(p){
  const s = (p||'').trim();
  if (/^(phd|d\.?phil|doctor(ate)? of (philosophy|engineering)|mphil\/phd)\b/i.test(s)) return 'phd';
  if (/^(ms|m\.s|mba|emba|mphil|m\.phil|ma|m\.a|msc|m\.sc|master|pgd|postgraduate diploma|llm)\b/i.test(s)) return 'grad';
  return 'ug';
}
function groupedPrograms(programs){
  if(!programs||!programs.length) return '<span class="muted">Program list coming soon.</span>';
  const g={ug:[],grad:[],phd:[]}; programs.forEach(p=>g[progGroup(p)].push(p));
  const PREVIEW = 8;
  const sec=(t,a,key)=>{
    if(!a.length) return '';
    const overflow = a.length > PREVIEW;
    const visible = overflow ? a.slice(0,PREVIEW) : a;
    // Safely store the full list in a data attribute (escape both & and ')
    const dataList = JSON.stringify(a).replace(/&/g,'&amp;').replace(/'/g,'&#39;');
    return `<div class="prog-group">
      <div class="prog-group-title">${t}<span class="prog-count">${a.length}</span></div>
      <div class="pills" id="pg-${key}">${visible.map(p=>`<span class="pill">${esc(p)}</span>`).join('')}
        ${overflow ? `<button class="pill more" data-list='${dataList}' data-key='${key}' onclick="expandFromBtn(this)">+ ${a.length-PREVIEW} more</button>` : ''}
      </div>
    </div>`;
  };
  return sec('Undergraduate',g.ug,'ug')+sec('Graduate (MS / MBA)',g.grad,'grad')+sec('PhD',g.phd,'phd');
}
function expandProgs(key, list){
  const el = document.getElementById('pg-'+key); if(!el) return;
  // Cap at 200 to prevent DOM bloat from malicious bulk-inserts
  el.innerHTML = list.slice(0,200).map(p=>`<span class="pill">${esc(p)}</span>`).join('');
}
// Read list from data attribute on button (safe — no inline JSON injection)
function expandFromBtn(btn){
  try{
    const list = JSON.parse(btn.dataset.list||'[]');
    expandProgs(btn.dataset.key, list);
  }catch(e){}
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function timeAgo(iso){
  const t = new Date(iso).getTime(); if(!t) return '';
  const s = Math.floor((Date.now()-t)/1000);
  if(s<60) return 'just now';
  if(s<3600) return Math.floor(s/60)+' min ago';
  if(s<86400) return Math.floor(s/3600)+' hr ago';
  const d = Math.floor(s/86400);
  if(d<30) return d+' day'+(d!==1?'s':'')+' ago';
  if(d<365) return Math.floor(d/30)+' month'+(d>=60?'s':'')+' ago';
  return Math.floor(d/365)+' year'+(d>=730?'s':'')+' ago';
}

// ── Nav search across institutions ──
let ALL_UNIS_CACHE = [];
let ALL_UNIS_CACHED_AT = 0;
const UNI_CACHE_TTL_MS = 15 * 60 * 1000; // 15 min — long enough to be cheap, short enough to refresh after admin edits
async function preloadUnis(){
  if(ALL_UNIS_CACHE.length && (Date.now() - ALL_UNIS_CACHED_AT) < UNI_CACHE_TTL_MS) return;
  try{
    const { data } = await sb.from('institutions').select('id,name,full_name,city,sector,website,logo_url,tags,type,programs').order('rank',{ascending:true});
    ALL_UNIS_CACHE = data || [];
    ALL_UNIS_CACHED_AT = Date.now();
  }catch(e){}
}
function toggleMobileSearch(){
  const bar = document.getElementById('mobileSearchBar');
  bar.classList.toggle('open');
  if(bar.classList.contains('open')) document.getElementById('mobileNavSearch').focus();
}
function doMobileNavSearch(){
  const q = document.getElementById('mobileNavSearch').value.trim();
  if(!q) return;
  const m = ALL_UNIS_CACHE.find(u => u.name.toLowerCase()===q.toLowerCase() || (u.full_name||'').toLowerCase()===q.toLowerCase());
  if(m){ location.href = '/university/' + toSlug(m.name); return; }
  location.href = 'index.html#search=' + encodeURIComponent(q);
}
function doMobileNavSuggest(val){
  const q = (val||'').trim().toLowerCase();
  const box = document.getElementById('mobileNavSug');
  if(q.length<1){ box.classList.remove('show'); return; }
  const matches = ALL_UNIS_CACHE
    .filter(u => u.name.toLowerCase().includes(q) || (u.full_name||'').toLowerCase().includes(q))
    .slice(0,6);
  if(!matches.length){ box.classList.remove('show'); return; }
  box.innerHTML = matches.map(u=>{
    const ic = u.logo_url ? `<img src="${u.logo_url}" alt="">` : (u.website ? `<img src="https://www.google.com/s2/favicons?domain=${u.website}&sz=64" alt="">` : '🏛️');
    return `<a href="/university/${toSlug(u.name)}">${ic}<div><div style="font-weight:700">${u.name}</div><div style="font-size:.74rem;color:var(--gray-400)">📍 ${u.city||''}</div></div></a>`;
  }).join('');
  box.classList.add('show');
}
function doNavSearch(){
  const q = document.getElementById('navSearch').value.trim();
  if(!q) return;
  // Try exact match first
  const m = ALL_UNIS_CACHE.find(u => u.name.toLowerCase()===q.toLowerCase() || (u.full_name||'').toLowerCase()===q.toLowerCase());
  if(m){ location.href = '/university/' + toSlug(m.name); return; }
  // Otherwise redirect to homepage with the query
  location.href = 'index.html#search=' + encodeURIComponent(q);
}
function navSearchInput(){
  const q = (document.getElementById('navSearch').value||'').trim().toLowerCase();
  const box = document.getElementById('navSug');
  if(q.length<1){ box.classList.remove('show'); return; }
  const matches = ALL_UNIS_CACHE
    .filter(u => u.name.toLowerCase().includes(q) || (u.full_name||'').toLowerCase().includes(q))
    .slice(0,6);
  if(!matches.length){ box.classList.remove('show'); return; }
  box.innerHTML = matches.map(u=>{
    const ic = u.logo_url ? `<img src="${u.logo_url}" alt="">` : (u.website? `<img src="https://www.google.com/s2/favicons?domain=${u.website}&sz=64" alt="">` : '🏛️');
    return `<a href="/university/${toSlug(u.name)}">${ic}<div><div style="font-weight:700">${u.name}</div><div style="font-size:.74rem;color:var(--gray-400)">📍 ${u.city||''}</div></div></a>`;
  }).join('');
  box.classList.add('show');
}

// ── Similar Universities (same type & overlapping tags/city) ──
async function loadSimilar(){
  if(!UNI) return;
  await preloadUnis();
  const tags = new Set((UNI.tags||[]).filter(t=>!['public','private','military','federal','punjab','sindh','kpk','balochistan','ajk','gilgitbaltistan'].includes(t)));
  const scored = ALL_UNIS_CACHE
    .filter(u => u.id !== UNI.id)
    .map(u=>{
      const utags = (u.tags||[]);
      const overlap = utags.filter(t => tags.has(t)).length;
      const sameCity = (u.city||'').split('/')[0].trim() === (UNI.city||'').split('/')[0].trim() ? 1 : 0;
      const sameSector = u.sector === UNI.sector ? 1 : 0;
      return { u, score: overlap*3 + sameCity*2 + sameSector };
    })
    .sort((a,b)=>b.score-a.score)
    .filter(x=>x.score>0)
    .slice(0,4);
  const box = document.getElementById('similar'); if(!box) return;
  if(!scored.length){ box.style.display='none'; return; }
  box.innerHTML = `
    <div class="sec-head"><div class="icn">🔍</div><h2>Similar Universities</h2></div>
    <div class="similar-grid">${scored.map(({u})=>{
      const ic = u.logo_url ? `<img src="${u.logo_url}" alt="">` : (u.website?`<img src="https://www.google.com/s2/favicons?domain=${u.website}&sz=128" alt="">`:`<span>${u.icon||'🏛️'}</span>`);
      const sector = u.sector==='public'?'🏛️ Public':u.sector==='military'?'⚔️ Military':'🏢 Private';
      return `<a class="sim-card" href="/university/${toSlug(u.name)}">
        <div class="sim-logo">${ic}</div>
        <div class="sim-name">${u.name}</div>
        <div class="sim-meta">📍 ${u.city?u.city.split('/')[0].trim():''}</div>
        <div class="sim-badge">${sector}</div>
      </a>`;
    }).join('')}</div>`;
}

async function load(){
  let id = getId();
  if(!id){ $('content').innerHTML='<div class="loading">University not found. <a href="/">Go back</a></div>'; return; }
  // Slug-based lookup
  if(typeof id === 'string' && isNaN(id)){
    await preloadUnis();
    const match = ALL_UNIS_CACHE.find(u => toSlug(u.name)===id || toSlug(u.full_name||'')===id);
    if(!match){ $('content').innerHTML='<div class="loading">University not found. <a href="/">Go back</a></div>'; return; }
    id = match.id;
  }
  const { data, error } = await sb.from('institutions')
    .select('id,name,full_name,city,province,sector,type,icon,rank,fee,fee_num,fee_year,fee_note,merit,entry,programs,seats,established,website,logo_url,description,highlights,scholarships,hostel,tags,data_updated,fee_details(label,value,sort_order)')
    .eq('id',id).single();
  if(error || !data){ $('content').innerHTML='<div class="loading">University not found. <a href="/">Go back</a></div>'; return; }
  UNI = data;
  render();
  setSEO();
  setTimeout(drawMeritChart, 100);
  setTimeout(buildAggCalc, 50);
  loadReviews(); loadQA();
  loadSimilar();
  // Mobile sticky action bar
  if(window.matchMedia('(max-width:780px)').matches){
    const ms = document.getElementById('mobileSticky');
    const visit = document.getElementById('msVisit');
    if(visit && UNI.website){ visit.href = 'https://www.'+UNI.website; } else if(visit){ visit.style.display='none'; }
    if(ms){ ms.classList.add('show'); document.body.classList.add('has-sticky'); }
  }
  preloadUnis().then(()=>{
    const ns=document.getElementById('navSearch');
    if(ns){ ns.addEventListener('input', navSearchInput);
      document.addEventListener('click', e=>{ const w=document.querySelector('.nav-search-wrap'); if(w && !w.contains(e.target)) document.getElementById('navSug').classList.remove('show'); });
    }
  });
}

function drawMeritChart(){
  if(!UNI || !MERIT_TRENDS[UNI.id] || typeof Chart==='undefined') return;
  const el = document.getElementById('meritChart'); if(!el) return;
  const t = MERIT_TRENDS[UNI.id];
  new Chart(el.getContext('2d'), {
    type:'line',
    data:{
      labels:t.y,
      datasets:[{
        label:'Closing Merit %', data:t.m,
        borderColor:'#00C853', backgroundColor:'rgba(0,200,83,0.12)',
        borderWidth:3, tension:0.35, fill:true,
        pointBackgroundColor:'#00C853', pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:c=>c.parsed.y+'%' } } },
      scales:{
        y:{ beginAtZero:false, ticks:{ callback:v=>v+'%', color:'#5A6478' }, grid:{ color:'rgba(0,0,0,.05)' } },
        x:{ ticks:{ color:'#5A6478' }, grid:{ display:false } }
      }
    }
  });
}

function submitMerit(){
  if(!UNI) return;
  const msg = `Hi! I want to submit closing-merit data for ${UNI.full_name||UNI.name} on TaleemPK.\n\nProgram:\nClosing Merit %:\nAvailable Seats:\nYear:\nProof (link/screenshot):`;
  window.open(`https://wa.me/${MERIT_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ── Aggregate Calculator ── */
const MERIT_FORMULAS = {
  // id: [matric_weight, fsc_weight, test_weight, test_label]
  1:  [10, 15, 75, 'NET Score'],         // NUST
  2:  [0,  0,  0,  'SAT/LCAT'],          // LUMS (special)
  3:  [10, 40, 50, 'ECAT'],              // UET Lahore
  4:  [0,  0,  0,  'IBA Test'],          // IBA (special)
  5:  [10, 15, 75, 'NU Test'],           // FAST NUCES
  6:  [10, 40, 50, 'NTS/Entry Test'],    // COMSATS
  7:  [10, 40, 50, 'Entry Test'],        // QAU
  8:  [10, 15, 75, 'GIKI Test'],         // GIKI
  9:  [10, 15, 75, 'PIEAS Test'],        // PIEAS
  10: [10, 40, 50, 'Entry Test'],        // NED
  14: [10, 40, 50, 'Entry Test'],        // Air University
  21: [20, 40, 40, 'IST Entry Test'],    // IST
  // Default for all others
  default: [10, 40, 50, 'Entry Test']
};

// Returns [matric%, fsc%, test%, testLabel] — prefers the verified dataset
// (window.TPK_MERIT, 182 internet-checked formulas) over the small hardcoded set.
// Keeps LUMS/IBA-style special (SAT/aptitude, 0/0/0) handling intact, and only
// uses clean 3-component verified formulas (skips interview/other-based ones the
// 3-input calculator can't represent accurately).
function getMeritFormula(id){
  const hard = MERIT_FORMULAS[id];
  if(hard && hard[0]===0 && hard[1]===0 && hard[2]===0) return hard; // special: LUMS/IBA
  const v = (window.TPK_MERIT||{})[id];
  if(v && (v.t>0 || v.f>0) && !v.iv && !v.o){
    return [v.m||0, v.f||0, v.t||0, v.test||'Entry Test'];
  }
  return hard || MERIT_FORMULAS.default;
}

function buildAggCalc(){
  if(!UNI) return;
  const f = getMeritFormula(UNI.id);
  const isSpecial = f[0]===0; // LUMS, IBA — test-only, can't calculate simply
  const closing = UNI.merit ? parseFloat(UNI.merit) : null;

  let html = '';
  if(isSpecial){
    html = `<div class="agg-formula-tag">⚡ ${UNI.name} uses a custom test/interview-based admission — no standard aggregate formula applies.</div>`;
  } else {
    const formulaStr = f[2] === 0
      ? `Matric ${f[0]}% + FSc/Inter ${f[1]}%`
      : `Matric ${f[0]}% + FSc/Inter ${f[1]}% + ${f[3]} ${f[2]}%`;
    html = `
      <div class="agg-formula-tag">Formula: ${formulaStr}</div>
      <div class="agg-inputs">
        <div class="agg-input-group">
          <label>Matric / O-Level %</label>
          <input type="number" id="calcMatric" min="0" max="100" placeholder="e.g. 85" oninput="calcAggregate()">
        </div>
        <div class="agg-input-group">
          <label>FSc / Inter %</label>
          <input type="number" id="calcFsc" min="0" max="100" placeholder="e.g. 80" oninput="calcAggregate()">
        </div>
        <div class="agg-input-group">
          <label>${f[3] || 'Entry Test'} Score %</label>
          <input type="number" id="calcTest" min="0" max="100" placeholder="e.g. 70" oninput="calcAggregate()">
        </div>
      </div>
      <div class="agg-result" id="aggResult">
        <div class="agg-score" id="aggScore">--%<span> aggregate</span></div>
        <div class="agg-verdict" id="aggVerdict"></div>
        <div class="agg-breakdown" id="aggBreakdown"></div>
      </div>`;
  }
  document.getElementById('aggCalcBox').innerHTML = `<div class="agg-calc">${html}</div>`;
}

function calcAggregate(){
  if(!UNI) return;
  const f = getMeritFormula(UNI.id);
  const m = parseFloat(document.getElementById('calcMatric')?.value)||0;
  const s = parseFloat(document.getElementById('calcFsc')?.value)||0;
  const t = parseFloat(document.getElementById('calcTest')?.value)||0;
  if(!m && !s && !t) return;
  const agg = ((m*f[0]) + (s*f[1]) + (t*f[2])) / 100;
  const closing = UNI.merit ? parseFloat(UNI.merit) : null;
  const res = document.getElementById('aggResult');
  const scoreEl = document.getElementById('aggScore');
  const verdictEl = document.getElementById('aggVerdict');
  const breakEl = document.getElementById('aggBreakdown');
  scoreEl.innerHTML = `${agg.toFixed(2)}%<span> aggregate</span>`;
  res.className = 'agg-result show';
  breakEl.innerHTML = `Matric: ${(m*f[0]/100).toFixed(1)} + FSc: ${(s*f[1]/100).toFixed(1)} + ${f[3]}: ${(t*f[2]/100).toFixed(1)}`;
  if(closing){
    const diff = agg - closing;
    if(diff >= 2){ res.classList.add('eligible'); verdictEl.className='agg-verdict eligible'; verdictEl.textContent=`✅ Eligible — ${diff.toFixed(1)}% above closing merit (${closing}%)`; }
    else if(diff >= -3){ res.classList.add('borderline'); verdictEl.className='agg-verdict borderline'; verdictEl.textContent=`⚠️ Borderline — ${Math.abs(diff).toFixed(1)}% ${diff>=0?'above':'below'} last closing merit (${closing}%)`; }
    else{ res.classList.add('noteligible'); verdictEl.className='agg-verdict noteligible'; verdictEl.textContent=`❌ Below closing merit (${closing}%) by ${Math.abs(diff).toFixed(1)}% — consider improving test score`; }
  } else {
    res.classList.add('eligible');
    verdictEl.className='agg-verdict';
    verdictEl.style.color='var(--navy)';
    verdictEl.textContent=`No closing merit data yet for ${UNI.name}`;
  }
}

function setSEO(){
  const u=UNI;
  const city = u.city ? u.city.split('/')[0].trim() : '';
  const yr = new Date().getFullYear(); // dynamic admission year so titles never go stale
  document.title = `${u.full_name||u.name}${city?' — '+city:''} Fee Structure ${yr}, Merit List & Admissions | TaleemPK`;
  const progCount = (u.programs||[]).length;
  const d = `${u.full_name||u.name}${city?' ('+city+')':''} ${yr} admissions: fee structure${u.fee?' ('+u.fee+')':''}, merit list, entry test${progCount?', '+progCount+'+ programs':''}. HEC-recognized. Compare on TaleemPK.`;
  $('metaDesc').setAttribute('content', d);
  $('ogTitle').setAttribute('content', `${u.full_name||u.name} | TaleemPK`);
  $('ogDesc').setAttribute('content', d);
  const tw = document.getElementById('twTitle'); if(tw) tw.setAttribute('content', document.title);
  const td = document.getElementById('twDesc'); if(td) td.setAttribute('content', d);
  const slug = toSlug(u.name);
  const canon = `https://taleempk.pk/university/${slug}`;
  const cl = $('canonicalUrl'); if(cl) cl.setAttribute('href', canon);
  // Update browser URL to canonical slug form (if coming from ?id= link)
  if(!location.pathname.includes('/university/')) history.replaceState(null,'',`/university/${slug}`);
  // EducationalOrganization JSON-LD for Google rich results
  const sameAs = u.website ? ['https://www.' + u.website] : [];
  const ld = {
    "@context":"https://schema.org",
    "@type":"CollegeOrUniversity",
    "name": u.full_name || u.name,
    "alternateName": u.name,
    "url": canon,
    "logo": u.logo_url || (u.website ? 'https://www.google.com/s2/favicons?domain='+u.website+'&sz=256' : undefined),
    "description": u.description || d,
    "address": u.city ? {"@type":"PostalAddress","addressLocality":u.city.split('/')[0].trim(),"addressRegion":u.province||'','addressCountry':'PK'} : undefined,
    "foundingDate": u.established ? String(u.established) : undefined,
    "sameAs": sameAs
  };
  // strip undefineds
  Object.keys(ld).forEach(k=>{ if(ld[k]===undefined) delete ld[k]; });
  let s = document.getElementById('ldjson-uni');
  if(!s){ s = document.createElement('script'); s.id='ldjson-uni'; s.type='application/ld+json'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(ld);

  // FAQPage JSON-LD for Google rich results
  const faqs = [];
  // HEC recognition — directly answers the common "is X recognized by HEC" query.
  // Every institution in our dataset is HEC-recognized, so this is factual.
  faqs.push({
    "@type":"Question",
    "name":`Is ${u.full_name||u.name} recognized by HEC?`,
    "acceptedAnswer":{"@type":"Answer","text":`Yes. ${u.full_name||u.name} is recognized by the Higher Education Commission (HEC) of Pakistan${u.established?', established in '+u.established:''}${city?' and located in '+city:''}.`}
  });
  if(u.fee) faqs.push({
    "@type":"Question",
    "name":`What is the fee structure of ${u.full_name||u.name}?`,
    "acceptedAnswer":{"@type":"Answer","text":`The fee at ${u.full_name||u.name} is approximately ${u.fee}${u.fee_note?' ('+u.fee_note+')':''}. See the full fee breakdown on TaleemPK.`}
  });
  if(u.merit) faqs.push({
    "@type":"Question",
    "name":`What is the merit for admission at ${u.full_name||u.name}?`,
    "acceptedAnswer":{"@type":"Answer","text":`The closing merit at ${u.full_name||u.name} is around ${u.merit}%. Check TaleemPK for latest merit trends.`}
  });
  if(u.scholarships) faqs.push({
    "@type":"Question",
    "name":`Does ${u.full_name||u.name} offer scholarships?`,
    "acceptedAnswer":{"@type":"Answer","text":`Yes, ${u.full_name||u.name} offers scholarships. ${u.scholarships}`}
  });
  faqs.push({
    "@type":"Question",
    "name":`Does ${u.full_name||u.name} have hostel facilities?`,
    "acceptedAnswer":{"@type":"Answer","text":u.hostel?`Yes, ${u.full_name||u.name} provides hostel facilities for students.`:`Hostel availability at ${u.full_name||u.name} — please check the official website for current information.`}
  });
  if((u.programs||[]).length){
    faqs.push({
      "@type":"Question",
      "name":`What programs are offered at ${u.full_name||u.name}?`,
      "acceptedAnswer":{"@type":"Answer","text":`${u.full_name||u.name} offers ${u.programs.length} programs including ${u.programs.slice(0,5).join(', ')}${u.programs.length>5?' and more':''}.`}
    });
  }
  if(faqs.length){
    const faqLd = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqs};
    let fs = document.getElementById('ldjson-faq');
    if(!fs){ fs = document.createElement('script'); fs.id='ldjson-faq'; fs.type='application/ld+json'; document.head.appendChild(fs); }
    fs.textContent = JSON.stringify(faqLd);
  }
}

function render(){
  const u=UNI;
  // Sanitize icon to prevent attribute-injection XSS
  const iconSafe = String(u.icon||'🏛️').replace(/['"\\<>]/g,'').slice(0,8);
  const websiteSafe = String(u.website||'').replace(/[^a-z0-9.\-\/]/gi,'');
  const logo = u.logo_url
    ? `<img src="${esc(u.logo_url)}" alt="" data-fb="${esc(iconSafe)}" onerror="this.replaceWith(document.createTextNode(this.dataset.fb))">`
    : (websiteSafe ? `<img src="https://www.google.com/s2/favicons?domain=${esc(websiteSafe)}&sz=128" alt="" data-fb="${esc(iconSafe)}" onerror="this.replaceWith(document.createTextNode(this.dataset.fb))">` : esc(iconSafe));
  const fd = (u.fee_details||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const sectorLabel = u.sector==='public'?'🏛️ Public':u.sector==='military'?'⚔️ Military':'🏢 Private';
  const cleanTags = (u.tags||[]).filter(t=>!['public','private','military','federal','punjab','sindh','kpk','balochistan','ajk','gilgitbaltistan'].includes(t)).slice(0,3);

  const isEmptyVal = v => !v || ['—','-','n/a','na','tbd'].includes(String(v).trim().toLowerCase());
  const sideRow = (icn,k,v) => isEmptyVal(v) ? '' : `<div class="side-row"><div class="side-icn">${icn}</div><div><div class="side-k">${k}</div><div class="side-v">${esc(v)}</div></div></div>`;

  $('content').innerHTML = `
  <div class="hero-band">
    <div class="hero-inner">
      <div class="crumbs"><a href="/">Universities</a> &nbsp;›&nbsp; ${esc(u.name)}</div>
      <div class="hero-top">
        <div class="hero-logo">${logo}</div>
        <div class="hero-tags">
          ${u.rank?`<div class="hero-rank-tag">🏆 Rank #${u.rank} in Pakistan</div>`:''}
          ${u.fee_year?`<div class="verified-tag">✓ Verified data · ${esc(u.fee_year)}</div>`:''}
          ${u.data_updated?`<div class="updated-tag" title="${new Date(u.data_updated).toLocaleString()}">🕘 Updated ${timeAgo(u.data_updated)}</div>`:''}
        </div>
      </div>
      <h1 class="hero-name">${esc(u.full_name||u.name)}</h1>
      <div class="hero-meta">
        <span>📍 <b>${esc(u.city||'')}</b></span>
        ${u.established?`<span>· Est. <b>${u.established}</b></span>`:''}
        <span id="heroRating" class="hero-rating"></span>
      </div>
      <div class="hero-badges">
        <span class="hec-badge">✓ HEC Recognized</span>
        <span class="green">${sectorLabel}</span>
        ${cleanTags.map(t=>`<span>${esc(t)}</span>`).join('')}
      </div>
    </div>
  </div>

  <div class="layout">
    <div class="main">
      <div class="sec">
        <div class="sec-head"><div class="icn">📖</div><h2>About ${esc(u.name)}</h2></div>
        <div class="desc">
          <p style="margin:0 0 10px;"><strong>${esc(u.full_name||u.name)}</strong> is a${u.sector==='private'?' private':u.sector==='military'?' military':' public'} ${u.type==='college'?'college':'university'} in ${esc((u.city||'Pakistan').split('/')[0].trim())}, recognized by the Higher Education Commission (HEC) of Pakistan${u.established?', established in '+u.established:''}.</p>
          ${u.description?`<p style="margin:0;">${esc(u.description)}</p>`:''}
        </div>
      </div>

      ${fd.length?`
        <div class="sec">
          <div class="sec-head"><div class="icn">💰</div><h2>Detailed Fee Structure ${u.fee_year?`<span class="count">${esc(u.fee_year)}</span>`:''}</h2></div>
          ${fd.map(f=>`<div class="fee-row"><div class="fee-row-k">${esc(f.label)}</div><div class="fee-row-v">${esc(f.value)}</div></div>`).join('')}
          ${u.fee_note?`<div class="fee-note">${esc(u.fee_note)}</div>`:''}
        </div>`:''}

      <div class="sec">
        <div class="sec-head"><div class="icn">📈</div><h2>Merit Trend <span class="count">Last 3 Years</span></h2></div>
        ${MERIT_TRENDS[u.id]
          ? `<div class="merit-chart-wrap"><canvas id="meritChart"></canvas></div>
             <div style="font-size:.72rem;color:var(--gray-400);margin-top:8px;font-style:italic;">
               ⓘ Estimated trend based on community-reported merit. Verify on the official site.
             </div>`
          : `<div class="merit-empty"><div class="merit-empty-icn">📭</div><div class="merit-empty-txt">No merit data yet for ${esc(u.name)} — be the first to share last year's closing merit list.</div></div>`}
        <div class="merit-submit-row">
          <button class="btn navyb" onclick="submitMerit()">+ Submit Merit / Closing Data</button>
          <span class="muted" style="align-self:center;font-size:.8rem;">Helps every future applicant 🙏</span>
        </div>
      </div>

      <div class="sec" id="aggCalcSec">
        <div class="sec-head"><div class="icn">🧮</div><h2>Aggregate Calculator <span class="count" style="background:rgba(0,200,83,0.15);color:#00C853">For ${esc(u.name)}</span></h2></div>
        <div id="aggCalcBox"></div>
      </div>

      <div class="sec">
        <div class="sec-head"><div class="icn">📚</div><h2>Programs Offered <span class="count">${(u.programs||[]).length}</span></h2></div>
        ${groupedPrograms(u.programs)}
      </div>

      ${(u.highlights||[]).length?`
        <div class="sec">
          <div class="sec-head"><div class="icn">✨</div><h2>Highlights</h2></div>
          <div class="hl">${u.highlights.map(h=>`<span>${esc(h)}</span>`).join('')}</div>
        </div>`:''}

      <div class="sec">
        <div class="sec-head"><div class="icn">💬</div><h2>Student Reviews</h2></div>
        <div id="reviews"><div class="muted">Loading…</div></div>
      </div>

      <div class="sec">
        <div class="sec-head"><div class="icn">❓</div><h2>Questions &amp; Answers</h2></div>
        <div id="qa"><div class="muted">Loading…</div></div>
      </div>

      <div class="sec" id="similar"></div>
    </div>

    <aside class="sidebar">
      <div class="side-card">
        <h3>Quick Facts</h3>
        ${sideRow('💰','Fee / Semester', u.fee)}
        ${sideRow('🎯','Merit / Eligibility', u.merit)}
        ${sideRow('📝','Entry Test', u.entry)}
        ${sideRow('👥','Seats', u.seats)}
        ${sideRow('🎓','Scholarships', u.scholarships)}
        ${sideRow('🏠','Hostel', u.hostel)}
        <div class="side-cta">
          ${u.website?`<a class="btn" href="https://www.${esc(u.website)}" target="_blank" rel="noopener">🌐 Visit Official Site</a>`:''}
          <button class="btn navyb" onclick="shareUni()">🔗 Share University</button>
        </div>
      </div>
    </aside>
  </div>`;
}

/* Reviews */
let _star=0;
async function loadReviews(){
  const { data } = await sb.from('reviews').select('rating,category,body,author,created_at').eq('institution_id',UNI.id).order('created_at',{ascending:false});
  const rv=data||[];
  const avg=rv.length?(rv.reduce((s,r)=>s+r.rating,0)/rv.length):0;
  const hr = $('heroRating');
  if(hr) hr.innerHTML = rv.length ? `<span class="s">${stars(avg)}</span> <b>${avg.toFixed(1)}</b> · ${rv.length} review${rv.length!==1?'s':''}` : `<span style="color:rgba(255,255,255,.5);font-size:.85rem;">☆☆☆☆☆ No reviews yet</span>`;
  const form = currentUser
    ? `<div style="border:1px dashed var(--gray-200);border-radius:12px;padding:14px;margin-bottom:14px;">
        <div class="star-pick" id="starPick">${[1,2,3,4,5].map(n=>`<span onclick="pickStar(${n})">★</span>`).join('')}</div>
        <textarea id="rvText" rows="3" placeholder="Share your experience…" style="margin:8px 0;"></textarea>
        <button class="btn" onclick="postReview()">Post Review</button></div>`
    : `<p class="muted" style="margin-bottom:12px;">👉 <a href="#" onclick="openAuth();return false" style="color:var(--green-dark);font-weight:700;">Log in</a> to write a review.</p>`;
  $('reviews').innerHTML = `
    ${rv.length?`<div class="avg"><span class="rv-stars" style="font-size:1.3rem">${stars(avg)}</span><span class="avg-num">${avg.toFixed(1)}</span><span class="muted">/ 5 · ${rv.length} review${rv.length!==1?'s':''}</span></div>`:''}
    ${form}
    ${rv.length?rv.map(r=>`<div class="rv"><div class="rv-top"><span class="rv-stars">${stars(r.rating)}</span> · ${esc(r.category||'General')} · 👤 ${esc(r.author||'Student')}${isAdmin()?` <button class="admin-del" onclick="adminDeleteReview(${r.id})">Delete</button>`:''}</div><div class="rv-text">${esc(r.body)}</div></div>`).join(''):'<p class="muted">No reviews yet — be the first!</p>'}`;
}
function pickStar(n){ _star=n; document.querySelectorAll('#starPick span').forEach((s,i)=>s.classList.toggle('on',i<n)); }
async function postReview(){
  if(!currentUser){ openAuth(); return; }
  const t=$('rvText').value.trim(); if(!t){ alert('Please write your review.'); return; } if(!_star){ alert('Pick a star rating.'); return; }
  const { error } = await sb.from('reviews').insert({ institution_id:UNI.id, rating:_star, category:'General', body:t, author:userName() });
  if(error){ alert(error.message); return; }
  _star=0; loadReviews();
}

/* Q&A */
async function loadQA(){
  const { data } = await sb.from('questions').select('id,question,author,created_at,answers(body,author,created_at)').eq('institution_id',UNI.id).order('created_at',{ascending:false});
  const qs=data||[];
  const ask = currentUser
    ? `<div style="display:flex;gap:8px;margin-bottom:14px;"><input id="qText" placeholder="Ask a question…"><button class="btn" onclick="postQ()">Ask</button></div>`
    : `<p class="muted" style="margin-bottom:12px;">👉 <a href="#" onclick="openAuth();return false" style="color:var(--green-dark);font-weight:700;">Log in</a> to ask a question.</p>`;
  $('qa').innerHTML = ask + (qs.length?qs.map(q=>`
    <div class="qa-item"><div class="qa-q">Q: ${esc(q.question)}${isAdmin()?` <button class="admin-del" onclick="adminDeleteQuestion(${q.id})">Delete</button>`:''}</div>
      <div class="muted" style="font-size:.76rem;">👤 ${esc(q.author||'Student')}</div>
      ${(q.answers||[]).map(a=>`<div class="qa-ans">${esc(a.body)} <span class="muted">— ${esc(a.author||'Student')}</span></div>`).join('')}
      ${currentUser?`<div style="display:flex;gap:8px;margin-top:8px;"><input id="ans-${q.id}" placeholder="Write an answer…"><button class="btn" onclick="postA(${q.id})">Answer</button></div>`:''}
    </div>`).join(''):'<p class="muted">No questions yet — be the first to ask!</p>');
}
async function postQ(){
  if(!currentUser){ openAuth(); return; }
  const t=$('qText').value.trim(); if(!t){ alert('Please write your question.'); return; }
  const { error } = await sb.from('questions').insert({ institution_id:UNI.id, question:t, author:userName() });
  if(error){ alert(error.message); return; } loadQA();
}
async function postA(qid){
  const t=$('ans-'+qid).value.trim(); if(!t){ alert('Please write your answer.'); return; }
  const { error } = await sb.from('answers').insert({ question_id:qid, body:t, author:userName() });
  if(error){ alert(error.message); return; } loadQA();
}

/* Share */
function shareUni(){
  const url=location.origin+location.pathname+'?id='+UNI.id;
  const text=`${UNI.full_name||UNI.name} — fees, merit & programs on TaleemPK`;
  if(navigator.share){ navigator.share({title:UNI.full_name,text,url}).catch(()=>{}); }
  else { navigator.clipboard?.writeText(url); window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`,'_blank'); }
}

/* Auth */
let _mode='login';
function userName(){ return (currentUser?.user_metadata?.name) || (currentUser?.email||'User').split('@')[0]; }
function onAuthBtn(){ if(currentUser){ sb.auth.signOut().then(()=>{currentUser=null;refreshAuth();loadReviews();loadQA();}); } else openAuth(); }
function openAuth(){ aTab('login'); $('authOv').classList.add('show'); }
function closeAuth(){ $('authOv').classList.remove('show'); }
function aTab(m){ _mode=m; $('tabL').style.background=m==='login'?'var(--navy)':'var(--gray-200)'; $('tabL').style.color=m==='login'?'#fff':'var(--navy)';
  $('tabS').style.background=m==='signup'?'var(--navy)':'var(--gray-200)'; $('tabS').style.color=m==='signup'?'#fff':'var(--navy)';
  $('nameWrap').style.display=m==='signup'?'block':'none'; $('aTitle').textContent=m==='signup'?'Create your account 🎓':'Welcome back 👋'; $('aBtn').textContent=m==='signup'?'Create Account':'Login'; }
function aFlash(t,ok){ const e=$('aMsg'); e.textContent=t; e.className='amsg '+(ok?'ok':'err'); }
async function submitAuth(){
  const email=$('aEmail').value.trim(), pass=$('aPass').value;
  if(!email||!pass){ aFlash('Enter email and password.',false); return; }
  if(_mode==='signup'){
    const { error } = await sb.auth.signUp({ email, password:pass, options:{ data:{ name:$('aName').value.trim() } } });
    if(error){ aFlash(error.message,false); return; } aFlash('✅ Account created! Check your inbox (and spam) for a confirmation email — click the link, then come back here to log in.',true); setTimeout(()=>aTab('login'),3500);
  } else {
    const { data, error } = await sb.auth.signInWithPassword({ email, password:pass });
    if(error){ aFlash(error.message,false); return; } currentUser=data.user; refreshAuth(); closeAuth(); loadReviews(); loadQA();
  }
}
function refreshAuth(){ $('authBtn').textContent = currentUser ? ('👤 '+userName()+' · Logout') : 'Login'; }
async function initAuth(){ const { data } = await sb.auth.getSession(); currentUser=data.session?data.session.user:null; refreshAuth(); }

initAuth();
load();
