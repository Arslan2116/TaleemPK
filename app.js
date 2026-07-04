// TaleemPK main application script (extracted from index.html).
// Load order matters: app-core.js -> uni-data.js -> app.js (all synchronous).


// ─── COMMUNITY VERIFIED MERIT DATA ───
// Admin: after verifying submissions, add entries here.
// Format: uniId → { year, submittedBy, programs: [{name, merit, seats}] }
// Example:
// const VERIFIED_MERIT = {
//   1: { year: '2024-25', submittedBy: 'Asad Khan (Batch 2025)',
//        programs: [
//          { name: 'BE Computer Engineering', merit: 89.2, seats: 100 },
//          { name: 'BE Electrical Engineering', merit: 87.5, seats: 120 },
//        ]},
// };
const VERIFIED_MERIT = {
  // Add verified entries here — empty until first verified submission
};

// ─── MERIT SUBMISSION CONTACT ───
// Replace with your actual WhatsApp number (no + or spaces, e.g. 923001234567)
const MERIT_WA_NUMBER = SITE_CONFIG.whatsapp || '923XXXXXXXXX';

// ─── FORMSPREE ENDPOINT ───
// Step 1: Go to https://formspree.io → Sign up free
// Step 2: Create a new form → copy the endpoint (e.g. https://formspree.io/f/xabcdefg)
// Step 3: Replace the empty string below with your endpoint
const FORMSPREE_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xabcdefg'

function renderVerifiedMerit(uniId) {
  const data = VERIFIED_MERIT[uniId];
  if (!data || !data.programs || !data.programs.length) return '';
  const rows = data.programs.map(p => `
    <tr>
      <td>${p.name}</td>
      <td class="merit-pct">${p.merit}%</td>
      <td>${p.seats || '—'}</td>
    </tr>
  `).join('');
  return `
    <div style="overflow-x:auto;border-radius:8px;overflow:hidden;">
      <table class="merit-table">
        <thead><tr><th>Program</th><th>Closing Merit</th><th>Seats</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="merit-source-note">👤 Submitted by: <strong>${data.submittedBy || 'Anonymous'}</strong> &nbsp;·&nbsp; 📅 ${data.year}</p>
  `;
}

let _meritUniId = null;
let _meritImgFile = null;

function handleMeritImg(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Image is too large — it must be under 5 MB.');
    return;
  }
  _meritImgFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('msImgPreview');
    const placeholder = document.getElementById('msImgPlaceholder');
    const removeBtn = document.getElementById('msImgRemove');
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeMeritImg(e) {
  e.stopPropagation();
  _meritImgFile = null;
  document.getElementById('msImgFile').value = '';
  document.getElementById('msImgPreview').style.display = 'none';
  document.getElementById('msImgPreview').src = '';
  document.getElementById('msImgPlaceholder').style.display = 'flex';
  document.getElementById('msImgRemove').style.display = 'none';
}

function openMeritSubmit(uniId, uniName) {
  // Look up the uni name from UNIVERSITIES if not passed in — avoids template-injection
  // through u.full when the function is called from a card inline onclick.
  if (!uniName && typeof UNIVERSITIES !== 'undefined') {
    const u = UNIVERSITIES.find(x => x.id === uniId);
    uniName = u ? (u.full || u.name) : '';
  }
  _meritUniId = uniId;
  _meritImgFile = null;
  // Guarded element access — these modal fields might not exist on every page state
  const nameEl = document.getElementById('meritSubmitUniName');
  if (nameEl) nameEl.textContent = uniName || '';
  ['msProg','msMerit','msSeats','msProof','msName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const yearEl = document.getElementById('msYear');           if (yearEl) yearEl.value = '2024-25';
  const fileEl = document.getElementById('msImgFile');         if (fileEl) fileEl.value = '';
  const previewEl = document.getElementById('msImgPreview');   if (previewEl) { previewEl.style.display = 'none'; previewEl.src = ''; }
  const placeholderEl = document.getElementById('msImgPlaceholder'); if (placeholderEl) placeholderEl.style.display = 'flex';
  document.getElementById('msImgRemove').style.display = 'none';
  document.getElementById('msShareNote').style.display = 'none';
  document.getElementById('meritOverlay').classList.add('open');
}

function closeMeritSubmit() {
  document.getElementById('meritOverlay').classList.remove('open');
}

function buildMeritMsg() {
  const uniName = (document.getElementById('meritSubmitUniName')?.textContent || '').replace(/^🏛️\s*/, '').trim();
  const prog  = document.getElementById('msProg').value.trim();
  const merit = document.getElementById('msMerit').value.trim();
  const seats = document.getElementById('msSeats').value.trim();
  const year  = document.getElementById('msYear').value;
  const proof = document.getElementById('msProof').value.trim();
  const name  = document.getElementById('msName').value.trim();
  if (!prog || !merit) {
    alert('Please fill Program Name and Closing Merit % — these are required.');
    return null;
  }
  return `📊 *TaleemPK Merit Submission*\n\n🏛️ University: ${uniName}\n📚 Program: ${prog}\n📈 Closing Merit: ${merit}%\n💺 Seats: ${seats||'—'}\n📅 Year: ${year}\n🔗 Proof: ${proof||'Not provided'}\n👤 Submitted by: ${name||'Anonymous'}`;
}

async function submitMeritViaWhatsApp() {
  const msg = buildMeritMsg();
  if (!msg) return;

  // Mobile: use Web Share API to share text + image file together
  if (_meritImgFile && navigator.canShare && navigator.canShare({ files: [_meritImgFile] })) {
    try {
      await navigator.share({ title: 'TaleemPK Merit Submission', text: msg, files: [_meritImgFile] });
      return;
    } catch(e) {
      if (e.name === 'AbortError') return; // user cancelled
      // Other error — fall through to WhatsApp link
    }
  }

  // Desktop / fallback: open WhatsApp link + show image note if image selected
  const imgNote = _meritImgFile ? `\n📸 Image proof: (attached separately)` : '';
  window.open(`https://wa.me/${MERIT_WA_NUMBER}?text=${encodeURIComponent(msg + imgNote)}`, '_blank');

  // If image was selected, show instruction to attach manually
  if (_meritImgFile) {
    const note = document.getElementById('msShareNote');
    note.style.display = 'block';
    note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function copyMeritData() {
  const msg = buildMeritMsg();
  if (!msg) return;
  const btn = document.querySelector('.ms-copy-btn');
  const done = () => { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Text', 2500); };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(done).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = msg; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = msg; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); done();
  }
}

// ─── Generic admin notifier: sends a submission to Formspree (if configured) ───
// Non-blocking & fail-silent — local save/display still works even if this fails.
function notifyAdmin(subject, payload) {
  const endpoint = window._formspreeEndpoint || SITE_CONFIG.formspree_endpoint || '';
  if (!endpoint) return; // Not configured yet — skip silently
  function neutralise(v){
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v).slice(0, 4000);
    return String(v).replace(/[<>]/g, c => ({'<':'⟨','>':'⟩'}[c])).slice(0, 4000);
  }
  const safePayload = {};
  for (const [k, v] of Object.entries(payload || {})) safePayload[k] = neutralise(v);
  const body = JSON.stringify(Object.assign(
    { _subject: neutralise(subject).slice(0, 200), _replyto: 'noreply@taleempk.pk' },
    safePayload
  ));
  // Best-effort send with one retry — Formspree occasionally 5xx during peak.
  // Done in a microtask so the form submit isn't blocked on this.
  async function send(){
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body
        });
        if (r.ok) return;
        if (r.status >= 400 && r.status < 500) return; // 4xx won't recover on retry
      } catch (_) { /* network error — try again */ }
      await new Promise(r => setTimeout(r, 1500)); // 1.5 s backoff between tries
    }
  }
  try { send(); } catch(e) {}
}

async function submitMeritForm() {
  // If Formspree not configured → fall back to WhatsApp
  const FORMSPREE_ENDPOINT = window._formspreeEndpoint || SITE_CONFIG.formspree_endpoint || '';
  if (!FORMSPREE_ENDPOINT) {
    submitMeritViaWhatsApp();
    return;
  }

  const uniName = (document.getElementById('meritSubmitUniName')?.textContent || '').replace(/^🏛️\s*/, '').trim();
  const prog  = document.getElementById('msProg').value.trim();
  const merit = document.getElementById('msMerit').value.trim();
  const seats = document.getElementById('msSeats').value.trim();
  const year  = document.getElementById('msYear').value;
  const proof = document.getElementById('msProof').value.trim();
  const name  = document.getElementById('msName').value.trim();

  if (!prog || !merit) {
    alert('Please fill Program Name and Closing Merit % — these are required.');
    return;
  }

  const btn = document.getElementById('msSubmitBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Submitting...';

  // If image selected, convert to base64 for Formspree
  let imgData = '';
  if (_meritImgFile) {
    imgData = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.readAsDataURL(_meritImgFile);
    });
  }

  const payload = {
    university: uniName,
    program: prog,
    closing_merit: merit + '%',
    available_seats: seats || '—',
    academic_year: year,
    proof_url: proof || 'Not provided',
    submitted_by: name || 'Anonymous',
    image_note: imgData ? 'Screenshot attached (base64 in image_data field)' : 'No image',
    _subject: `TaleemPK Merit Submission — ${uniName} (${prog})`,
    _replyto: 'noreply@taleempk.com'
  };

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Show success state
      document.getElementById('msFormActions').style.display = 'none';
      document.getElementById('msSuccess').style.display = 'block';
      document.getElementById('msSuccess').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      throw new Error('Server error ' + res.status);
    }
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🚀 Submit Data';
    alert('Submission failed. Please try WhatsApp instead or check your internet connection.');
  }
}

// ─── CITY COORDINATES (for Map View) ───
const CITY_COORDS = {
  'Islamabad':[33.6844,73.0479],'Rawalpindi':[33.5651,73.0169],'Wah':[33.7830,72.7286],'Attock':[33.7660,72.3600],
  'Lahore':[31.5204,74.3587],'Faisalabad':[31.4504,73.1350],'Multan':[30.1575,71.5249],
  'Gujranwala':[32.1877,74.1945],'Sialkot':[32.4945,74.5229],'Sargodha':[32.0836,72.6711],
  'Gujrat':[32.5739,74.0786],'Bahawalpur':[29.3956,71.6836],'Sheikhupura':[31.7167,73.9850],
  'Okara':[30.8138,73.4536],'Mianwali':[32.5847,71.5433],'Jhang':[31.2781,72.3220],
  'Sahiwal':[30.6706,73.1077],'Jhelum':[32.9343,73.7214],'Chakwal':[32.9332,72.8505],
  'Narowal':[32.0991,74.8761],'Hafizabad':[32.0709,73.6881],'DG Khan':[30.0489,70.6330],
  'Dera Ghazi Khan':[30.0489,70.6330],'Layyah':[30.9591,70.9396],'Khanewal':[30.3006,71.9327],
  'Nankana Sahib':[31.4505,73.7067],'Kasur':[31.1166,74.4501],'Bhakkar':[31.6271,71.0645],
  'Vehari':[30.0451,72.3491],'Toba Tek Singh':[30.9774,72.4827],
  'Karachi':[24.8607,67.0011],'Hyderabad':[25.3960,68.3578],'Sukkur':[27.6995,68.8673],
  'Jamshoro':[25.4211,68.2828],'Larkana':[27.5570,68.2142],'Nawabshah':[26.2442,68.4102],
  'Khairpur':[27.5295,68.7586],'Tandojam':[25.4280,68.5336],'Mirpurkhas':[25.5276,69.0084],
  'Peshawar':[34.0151,71.5249],'Abbottabad':[34.1463,73.2117],'Mardan':[34.1985,72.0440],
  'Mansehra':[34.3293,73.2063],'Nowshera':[34.0153,71.9747],'Swat':[35.2227,72.4258],
  'DI Khan':[31.8313,70.9017],'Dera Ismail Khan':[31.8313,70.9017],'Kohat':[33.5869,71.4414],
  'Bannu':[32.9887,70.6045],'Chitral':[35.8518,71.7865],'Swabi':[34.1203,72.4699],
  'Haripur':[33.9950,72.9407],'Buner':[34.5082,72.4947],'Shangla':[35.0200,72.5300],
  'Dir':[35.2018,71.8766],'Karak':[33.1172,71.0936],'Batagram':[34.6770,73.0269],
  'Quetta':[30.1798,66.9750],'Turbat':[26.0022,63.0442],'Khuzdar':[27.8000,66.6167],
  'Hub':[25.0325,66.8960],'Sibi':[29.5430,67.8770],'Loralai':[30.3700,68.5942],
  'Muzaffarabad':[34.3703,73.4705],'Mirpur':[33.1532,73.7508],'Rawalakot':[33.8591,73.7602],
  'Bagh':[33.9866,73.7832],'Kotli':[33.5170,73.9022],
  'Gilgit':[35.9221,74.3083],'Skardu':[35.2971,75.6341],
  'Online':[33.6844,73.0479],
};

// ─── MERIT TRENDS (last 3 years closing merit %) ───
const MERIT_TRENDS = {
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

// ─── ADMISSION CALENDAR 2026 ───
const ADMISSION_DATES = [
  {uni:'AIOU',          ev:'Spring 2026 Admission Closed',         date:'2026-05-20',type:'deadline'},
  {uni:'NUST',          ev:'Fall 2026 Applications Open',           date:'2026-06-01',type:'open'},
  {uni:'COMSATS',       ev:'Fall 2026 Online Apply Opens',          date:'2026-06-05',type:'open'},
  {uni:'Multiple Unis', ev:'HEC NTS GAT General 2026',              date:'2026-06-08',type:'test'},
  {uni:'UET Lahore',    ev:'ECAT 2026 Registration Opens',          date:'2026-06-10',type:'open'},
  {uni:'LUMS',          ev:'Fall 2026 Application Deadline',        date:'2026-06-15',type:'deadline'},
  {uni:'FAST NUCES',    ev:'Fall 2026 — Last Date to Apply',        date:'2026-06-20',type:'deadline'},
  {uni:'GIKI',          ev:'Entry Test Registration Opens',         date:'2026-06-25',type:'open'},
  {uni:'All Medical',   ev:'MDCAT 2026 Registration Opens',         date:'2026-06-30',type:'open'},
  {uni:'NUST',          ev:'NUST NET 2026',                         date:'2026-07-13',type:'test'},
  {uni:'LUMS',          ev:'First Merit List',                      date:'2026-07-15',type:'merit'},
  {uni:'IBA Karachi',   ev:'IBA Admission Test 2026',               date:'2026-07-20',type:'test'},
  {uni:'GIKI',          ev:'GIKI Entry Test 2026',                  date:'2026-07-25',type:'test'},
  {uni:'FAST NUCES',    ev:'NU Entry Test — All Campuses',          date:'2026-07-27',type:'test'},
  {uni:'All Eng. Unis', ev:'ECAT 2026',                             date:'2026-08-09',type:'test'},
  {uni:'UET Lahore',    ev:'1st Merit List',                        date:'2026-08-20',type:'merit'},
  {uni:'COMSATS',       ev:'Fall 2026 Merit List',                  date:'2026-08-22',type:'merit'},
  {uni:'FAST NUCES',    ev:'Merit List — All Campuses',             date:'2026-08-25',type:'merit'},
  {uni:'GIKI',          ev:'Merit List Published',                  date:'2026-08-28',type:'merit'},
  {uni:'All Medical',   ev:'MDCAT 2026',                            date:'2026-08-30',type:'test'},
  {uni:'NUST',          ev:'1st Merit List',                        date:'2026-09-01',type:'merit'},
  {uni:'AIOU',          ev:'Autumn 2026 Admission Opens',           date:'2026-09-01',type:'open'},
  {uni:'PU Lahore',     ev:'Undergraduate Merit List',              date:'2026-09-05',type:'merit'},
  {uni:'QAU Islamabad', ev:'Merit List',                            date:'2026-09-08',type:'merit'},
  {uni:'PMDC',          ev:'MDCAT 2026 Result Announced',           date:'2026-09-20',type:'merit'},
  {uni:'VU',            ev:'Fall 2026 Admission Last Date',         date:'2026-09-25',type:'deadline'},
  {uni:'NUST',          ev:'2nd Merit List',                        date:'2026-09-28',type:'merit'},
  {uni:'Pvt. Unis',     ev:'Fall 2026 Classes Begin',               date:'2026-10-01',type:'open'},
  {uni:'Public Unis',   ev:'Fall 2026 Classes Begin',               date:'2026-10-05',type:'open'},
  {uni:'IBA Karachi',   ev:'Spring 2027 Application Opens',         date:'2026-11-01',type:'open'},
  {uni:'VU',            ev:'Spring 2027 Admission Opens',           date:'2026-11-15',type:'open'},
  {uni:'LUMS',          ev:'Spring 2027 Application Deadline',      date:'2026-12-15',type:'deadline'},
];

// Study group → which tags are eligible
// Match program names to broad eligibility categories — used by the Admission Predictor.
// We check the REAL programs the university offers, not just tags.
const PROG_REGEX = {
  // Strictly health-track programs Pre-Medical students apply for
  medical:      /\bmbbs\b|\bbds\b|\bpharm|\bnursing\b|\bdpt\b|physiotherapy|\bmedicine\b|\bdental\b|\bdvm\b|allied health|radiology|optometry|veterinary|public health|paramedic|(?<!bio)medical(?!\s+engineering)/i,
  // Biological / life sciences — valid Pre-Medical fallbacks (NOT physics/maths)
  bioSciences:  /\b(biology|biotech|biotechnology|biochem|microbiology|zoology|botany|life sciences|biological|food science|nutrition|environmental science|biosciences|genetics|molecular)\b|\bbiomedical(?!\s+engineering)/i,
  // Engineering — catches "Engineering", "Engg" abbrev, and named disciplines
  engineering:  /engineering|\bengg\b|\b(civil|mechanical|electrical|chemical|aerospace|avionics|mechatronic|petroleum|mining|metallurg|telecommunication|architectural)\b|\b(biomedical|industrial|materials)\s+engineering\b|\bbs\s*ee\b|\bbs\s*ce\b|\bbs\s*me\b/i,
  // Computing
  cs:           /computer science|software engineer|cyber|artificial intelligence|data science|information tech|\bbs\s*cs\b|\bbs\s*se\b|\bbs\s*it\b|\bbscs\b|\bbsse\b|\bbsit\b|\bit\b|\bai\b/i,
  // Business
  business:     /\b(bba|mba|business|accounting|finance|economics|commerce|management|marketing|fintech|entrepreneur)\b/i,
  // Arts / humanities / law
  arts:         /\b(arts|design|architecture|fashion|media|literature|english|urdu|history|philosophy|psychology|sociology|anthropology|fine art|llb|law|education|journalism|mass comm|linguistics|islamic studies)\b/i,
  // Physical sciences (NOT a Pre-Medical fallback — those students don't typically pick BS Physics)
  physicalSciences: /\b(physics|chemistry|mathematics|maths|statistics|geology|astronomy|space science)\b/i
};

// Detect undergraduate programs only — predictor is for FSc/A-Level admission seekers,
// so MS/MPhil/PhD/MA/MSc/Master programs must NOT count toward eligibility.
function isUndergrad(p){
  // Exclude obvious grad-level prefixes
  if(/^\s*(MS|MSc|MPhil|MA|MBA|EMBA|Master|PhD|Post[- ])/i.test(p)) return false;
  // Include obvious undergrad prefixes
  if(/^\s*(BS|BSc|BA|BBA|BE|BTech|Bachelor|MBBS|BDS|Pharm[- ]?D|DPT|DVM|LLB|BFA|B\.Ed|BEd|B\.Com|BCom)/i.test(p)) return true;
  // Programs without a prefix (like "MBBS", "CS", "Civil Engg") — assume undergrad
  return true;
}
function hasProgramIn(u, category){
  const re = PROG_REGEX[category];
  if(!re) return false;
  return (u.programs || []).some(p => isUndergrad(p) && re.test(p));
}

// Returns true if the university actually offers something relevant to this student's background.
function isEligible(u, studyGroup) {
  if(studyGroup === 'alevels') return true;
  const tags = u.tags || [];

  // Pre-Engineering → engineering, CS, sciences, business
  if(studyGroup === 'engineering'){
    return hasProgramIn(u,'engineering') || hasProgramIn(u,'cs') || hasProgramIn(u,'physicalSciences')
        || hasProgramIn(u,'business') || tags.includes('engineering') || tags.includes('cs')
        || tags.includes('business');
  }

  // Pre-Medical → MBBS/BDS/Pharm/Nursing/DPT OR bio-sciences (Biotech etc.) — NOT generic BS Chemistry
  if(studyGroup === 'medical'){
    return hasProgramIn(u,'medical') || hasProgramIn(u,'bioSciences') || tags.includes('medical');
  }

  // General / FA / ICS / ICom → business, CS, arts, social, education
  if(studyGroup === 'general'){
    return hasProgramIn(u,'business') || hasProgramIn(u,'cs') || hasProgramIn(u,'arts')
        || tags.includes('business') || tags.includes('arts');
  }

  return true;
}

// Assessment state
let assessMode = false;
let assessData = null;

function openPredictor() {
  document.getElementById('predictorOverlay').classList.add('open');
  if (typeof hydrateIcons === 'function') hydrateIcons(document.getElementById('predictorOverlay'));
}
function closePredictor() {
  document.getElementById('predictorOverlay').classList.remove('open');
}
function selectStudy(btn) {
  document.querySelectorAll('.pred-opt').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}
function getMatchLabel(surplus) {
  if(surplus >= 15) return { cls:'match-strong', label:'✅ Strong Match' };
  if(surplus >= 5)  return { cls:'match-good',   label:'👍 Good Match' };
  if(surplus >= 0)  return { cls:'match-border',  label:'⚠️ Borderline' };
  return               { cls:'match-reach',   label:'📚 Reach' };
}

function runPredictor() {
  const pct      = parseInt(document.getElementById('predPct').value);
  const study    = document.querySelector('.pred-opt.selected')?.dataset.study || 'engineering';
  const field    = document.getElementById('predField').value;
  const province = document.getElementById('predProvince').value;
  const uniType  = document.getElementById('predType').value;
  const maxFee   = document.getElementById('predFee').value ? parseInt(document.getElementById('predFee').value) : Infinity;

  assessMode = true;
  assessData = { pct, study, field, province, uniType, maxFee };
  closePredictor();

  // Field-specific eligibility — strict, based on actual programs (not "public" fallback)
  const FIELD_CHECK = {
    medical:     u => hasProgramIn(u,'medical') || hasProgramIn(u,'bioSciences') || u.tags.includes('medical'),
    engineering: u => hasProgramIn(u,'engineering') || u.tags.includes('engineering'),
    cs:          u => hasProgramIn(u,'cs') || u.tags.includes('cs') || u.tags.includes('computing'),
    business:    u => hasProgramIn(u,'business') || u.tags.includes('business'),
    sciences:    u => hasProgramIn(u,'physicalSciences') || hasProgramIn(u,'bioSciences') || u.tags.includes('sciences'),
    arts:        u => hasProgramIn(u,'arts') || u.tags.includes('arts')
  };

  // Filter + sort
  let results = UNIVERSITIES.filter(u => {
    if(!isEligible(u, study)) return false;
    if(province && u.province !== province) return false;
    if(uniType && u.type !== uniType) return false;
    if(maxFee !== Infinity && u.feeNum > maxFee) return false;
    if(field && FIELD_CHECK[field] && !FIELD_CHECK[field](u)) return false;

    // Cross-check: study group + field combo sanity
    // FSc Pre-Engineering wants Medical → allow medical OR bio-sciences (Biotech, Biomedical Sciences etc. are valid Pre-Eng switch paths)
    if(study === 'engineering' && field === 'medical'
       && !hasProgramIn(u,'medical') && !hasProgramIn(u,'bioSciences')) return false;
    // FSc Pre-Medical wants Engineering → only show unis with actual engineering programs
    if(study === 'medical' && field === 'engineering' && !hasProgramIn(u,'engineering')) return false;
    // FA/ICS/ICom students cannot pursue MBBS/BDS (no Biology) — hard block
    if(study === 'general' && field === 'medical') return false;
    // FA/ICS/ICom + Engineering: BE/BS Civil etc. need FSc Pre-Eng, BUT ICS students can do BS CS, BS SE, BS IT.
    // Allow only if the uni has computing programs the student can actually enrol in.
    if(study === 'general' && field === 'engineering' && !hasProgramIn(u,'cs')) return false;

    return true;
  });

  // Sort: surplus desc (best match first), then by meritMin desc (harder unis first within same tier)
  results.sort((a,b) => {
    const sa = pct - (a.meritMin||50);
    const sb = pct - (b.meritMin||50);
    if(sb !== sa) return sb - sa; // higher surplus = easier = show first
    return (b.meritMin||50) - (a.meritMin||50); // tie-break: harder uni first
  });

  // Reset pagination and render
  currentPage = 1;
  renderCards(results);

  // Show active bar
  const bar = document.getElementById('predictorActiveBar');
  bar.classList.add('show');
  document.getElementById('predictorActiveInfo').textContent =
    `Showing ${results.length} universities for ${pct}% · ${study==='engineering'?'FSc Pre-Eng':study==='medical'?'FSc Pre-Medical':study==='general'?'FA/ICS/ICom':'A-Levels'}${field?' · '+field.charAt(0).toUpperCase()+field.slice(1):''}`;

  document.getElementById('universities').scrollIntoView({behavior:'smooth'});
}

function clearPredictor() {
  assessMode = false;
  assessData = null;
  document.getElementById('predictorActiveBar').classList.remove('show');
  currentPage = 1;
  applyFilters();
}

let compareList = [];
let currentFilter = 'all';
let currentCity = '';
let currentProgram = '';
let currentScholarship = '';
let currentSort = 'default';
let searchQuery = '';

// Curated program categories for the Program filter dropdown.
// Each option matches a university if any of its programs/tags contains a term.
const PROGRAM_FILTERS = [
  {label:'Computer Science',        terms:['computer science','bscs','bs cs','computing','cs']},
  {label:'Software Engineering',    terms:['software','bsse']},
  {label:'Artificial Intelligence', terms:['artificial intelligence','ai','machine learning']},
  {label:'Data Science',            terms:['data science']},
  {label:'Information Technology',  terms:['information technology','bsit','bs it']},
  {label:'Electrical Engineering',  terms:['electrical','electronics']},
  {label:'Mechanical Engineering',  terms:['mechanical','mechatronics']},
  {label:'Civil Engineering',       terms:['civil']},
  {label:'Chemical Engineering',    terms:['chemical']},
  {label:'Business / BBA',          terms:['bba','business','bsba']},
  {label:'MBA',                     terms:['mba']},
  {label:'Executive MBA (EMBA)',    terms:['emba','executive mba']},
  {label:'Accounting & Finance',    terms:['accounting','finance','bsaf']},
  {label:'Economics',               terms:['economics']},
  {label:'MBBS / Medicine',         terms:['mbbs','medicine','medical']},
  {label:'Dentistry (BDS)',         terms:['bds','dental','dentistry']},
  {label:'Pharmacy (Pharm-D)',      terms:['pharm']},
  {label:'Nursing',                 terms:['nursing','nurse']},
  {label:'Law (LLB)',               terms:['llb','law']},
  {label:'Architecture',            terms:['architecture']},
  {label:'Psychology',              terms:['psychology']},
  {label:'English',                 terms:['english']},
  {label:'Mathematics',             terms:['mathematics','maths']},
  {label:'Agriculture / Vet',       terms:['agriculture','veterinary','dvm','animal']},
  {label:'Fashion & Design',        terms:['fashion','design','textile','fine arts','bfa']},
  {label:'Media & Journalism',      terms:['media','journalism','mass comm']},
  {label:'Education',               terms:['education','b.ed','m.ed']},
  {label:'Islamic Studies',         terms:['islamic']},
  {label:'Physics',                 terms:['physics']},
  {label:'Chemistry',               terms:['chemistry','biochem']},
  {label:'Biology / Life Sciences', terms:['biology','life sciences','biosciences','biotechnology','microbiology']},
  {label:'Statistics',              terms:['statistics','statistical']},
  {label:'Social Sciences',         terms:['social science','social sciences','social development','sociology']},
  {label:'Political Science / IR',  terms:['political science','international relations','politics']},
  {label:'Environmental Science',   terms:['environmental']},
  {label:'Cyber Security',          terms:['cyber security','cybersecurity','cyber']},
  {label:'Aerospace / Avionics',   terms:['aerospace','avionics','aeronautical']},
  {label:'Computer Engineering',   terms:['computer engineering']},
  {label:'Materials / Metallurgy',  terms:['materials','metallurgy','nanotechnology']},
  {label:'Nuclear Engineering',    terms:['nuclear']},
  {label:'Systems / Industrial Eng',terms:['systems engineering','industrial engineering','mechatronics']},
  {label:'Management Sciences',    terms:['management sciences','management','industrial management']},
  {label:'Commerce',               terms:['commerce','b.com','bcom']},
  {label:'Tourism & Hospitality',  terms:['tourism','hospitality']},
  {label:'Earth / Geo Sciences',   terms:['earth science','geology','geo','geoinformatics']},
  {label:'Anthropology',           terms:['anthropology']},
  {label:'Microbiology / Zoology', terms:['microbiology','zoology','botany']},
  {label:'Architecture / Design',  terms:['architecture','industrial design','product design','interior']},
  {label:'Financial Technology',   terms:['fintech','financial technology']},
  {label:'Nursing / Allied Health', terms:['nursing','allied health','physiotherapy','dpt','radiology']},
];
let currentPage = 1;
const PAGE_SIZE = 20;
let filteredCache = [];

// ════════════════════════════════════════════
//  STUDENT TOOL 1 — PERSONAL SHORTLIST
// ════════════════════════════════════════════
// ─── Shortlist — DB-backed, login required ───
// In-memory cache loaded from the user_shortlists table on login.
let _shortlistIds = new Set();
let _slActive = false;

function getShortlist(){ return [..._shortlistIds]; }
function isInShortlist(id){ return _shortlistIds.has(id); }

async function loadShortlistFromDB(){
  if(!currentUser || !sbClient){ _shortlistIds = new Set(); updateSlBadge(); return; }
  try{
    const { data, error } = await sbClient.from('user_shortlists').select('institution_id').eq('user_id', currentUser.id);
    if(error) throw error;
    _shortlistIds = new Set((data||[]).map(r => r.institution_id));
  }catch(e){ _shortlistIds = new Set(); }
  // Refresh all save buttons + badge
  document.querySelectorAll('[id^="sl-btn-"]').forEach(btn => {
    const id = parseInt(btn.id.replace('sl-btn-',''));
    btn.textContent = _shortlistIds.has(id) ? '❤️' : '🤍';
    btn.classList.toggle('saved', _shortlistIds.has(id));
  });
  updateSlBadge();
  if(_slActive){ currentPage=1; applyFilters(); }
}

async function toggleShortlist(id, event) {
  event && event.stopPropagation();
  // Gate: only logged-in users can shortlist
  if(!currentUser){
    if(typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  const wasSaved = _shortlistIds.has(id);
  // Optimistic update
  if(wasSaved) _shortlistIds.delete(id); else _shortlistIds.add(id);
  const btn = document.getElementById(`sl-btn-${id}`);
  if(btn){ btn.textContent = !wasSaved?'❤️':'🤍'; btn.classList.toggle('saved',!wasSaved); }
  updateSlBadge();
  // Persist to DB
  try{
    if(wasSaved){
      const { error } = await sbClient.from('user_shortlists').delete().eq('user_id', currentUser.id).eq('institution_id', id);
      if(error) throw error;
    } else {
      const { error } = await sbClient.from('user_shortlists').insert({ user_id: currentUser.id, institution_id: id });
      if(error) throw error;
    }
  }catch(e){
    // Revert UI on failure
    if(wasSaved) _shortlistIds.add(id); else _shortlistIds.delete(id);
    if(btn){ btn.textContent = wasSaved?'❤️':'🤍'; btn.classList.toggle('saved',wasSaved); }
    updateSlBadge();
    alert('Could not update shortlist: ' + (e.message || 'please try again'));
  }
  if(_slActive && wasSaved) { currentPage=1; applyFilters(); }
}

function updateSlBadge() {
  const count = _shortlistIds.size;
  const badge = document.getElementById('slCountBadge');
  if(badge){ badge.textContent = count; badge.style.display = count > 0 ? 'inline' : 'none'; }
  const btn = document.getElementById('slToolBtn');
  if(btn) btn.classList.toggle('active', _slActive);
}

/* ── About Page ── */
function openAboutPage() {
  closeBlogPage(); closeScholarshipsPage();
  document.getElementById('aboutPage').classList.add('active');
  document.body.classList.add('about-active');
  window.scrollTo({top:0, behavior:'smooth'});
  closeNavDropdown();
}
function closeAboutPage() {
  document.getElementById('aboutPage').classList.remove('active');
  document.body.classList.remove('about-active');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ── Blog / News ── */
function fmtNewsDate(d){
  try { return new Date(d+'T00:00:00').toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'}); }
  catch(e){ return d; }
}
function blogSlug(title){ return (title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function newsCardHTML(p){
  const href = p.url || `/blog/${blogSlug(p.title)}`;
  return `
    <a href="${href}" class="news-card" style="display:block;text-decoration:none;color:inherit;">
      <div class="news-card-banner">${p.icon||'📰'}</div>
      <div class="news-card-body">
        <span class="news-cat">${p.category||'Article'}</span>
        <h3 class="news-card-title">${p.title}</h3>
        <p class="news-card-excerpt">${p.excerpt||''}</p>
        <div class="news-card-meta">
          <span>${fmtNewsDate(p.date)}</span>
          <span class="news-read">Read More →</span>
        </div>
      </div>
    </a>`;
}
// Auto-link university names in text to their detail pages
function autoLinkUniversities(text){
  if(!text || !window.INSTITUTIONS || !INSTITUTIONS.length) return text;
  // Build sorted list (longer names first to avoid partial matches)
  const unis = INSTITUTIONS.slice().sort((a,b)=>(b.name||'').length-(a.name||'').length);
  let result = text;
  unis.forEach(u=>{
    const names = [u.full_name, u.name].filter(Boolean);
    names.forEach(n=>{
      if(n.length < 4) return;
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const re = new RegExp(`(?<!<[^>]*)(${escaped})(?![^<]*>)`, 'g');
      const _slug = (u.name||'').toLowerCase().replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      result = result.replace(re, `<a href="/university/${_slug}" style="color:var(--green);text-decoration:underline;font-weight:600">$1</a>`);
    });
  });
  return result;
}

function renderNews(){
  const grid = document.getElementById('newsGrid');
  if(!grid) return;
  if(!NEWS_POSTS.length){ grid.innerHTML='<p style="color:var(--gray-600)">No articles yet — check back soon.</p>'; return; }
  // Homepage shows only the latest 3 articles
  grid.innerHTML = NEWS_POSTS.slice(0,3).map(newsCardHTML).join('');
  // Show/hide the "View all" button depending on how many posts exist
  const va = document.getElementById('newsViewAll');
  if(va) va.style.display = NEWS_POSTS.length > 3 ? '' : 'none';
}
// New posts (manual articles + auto digests) live in /blog-index.json — merge them in
// so the homepage always shows the freshest three without editing this file.
(async function hydrateNews(){
  try{
    const r = await fetch('/blog-index.json', {cache:'no-store'});
    if(!r.ok) return;
    const idx = await r.json();
    if(!Array.isArray(idx) || !idx.length) return;
    idx.slice().reverse().forEach(p => {
      if(!NEWS_POSTS.some(x => x.url === p.url || x.title === p.title)) NEWS_POSTS.unshift(p);
    });
    NEWS_POSTS.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    renderNews();
  }catch(e){}
})();
function renderBlogPage(){
  const grid = document.getElementById('blogPageGrid');
  if(!grid) return;
  grid.innerHTML = NEWS_POSTS.length
    ? NEWS_POSTS.map(newsCardHTML).join('')
    : '<p style="color:var(--gray-600)">No articles yet — check back soon.</p>';
}
function openBlogPage(){
  closeAboutPage(); closeScholarshipsPage();
  renderBlogPage();
  document.getElementById('blogPage').classList.add('active');
  document.body.classList.add('blog-active');
  window.scrollTo({top:0, behavior:'smooth'});
  closeNavDropdown();
}
function closeBlogPage(){
  document.getElementById('blogPage').classList.remove('active');
  document.body.classList.remove('blog-active');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ── Scholarships ── */
let SCHOLARSHIPS = [];
let _scholFilter = 'all';
async function loadScholarships(){
  if(!sbClient) return;
  try{
    const { data, error } = await sbClient.from('scholarships')
      .select('id,title,provider,type,level,coverage,eligibility,deadline,description,apply_url,icon,featured,sort_order')
      .order('sort_order',{ascending:true});
    if(error) throw error;
    SCHOLARSHIPS = data || [];
  }catch(e){ SCHOLARSHIPS = []; }
  renderScholarships();
}
function renderScholarships(){
  const grid = document.getElementById('scholGrid');
  if(!grid) return;
  const list = _scholFilter==='all' ? SCHOLARSHIPS : SCHOLARSHIPS.filter(s=>(s.type||'')===_scholFilter);
  if(!list.length){ grid.innerHTML='<p style="color:var(--gray-600)">No scholarships found for this filter.</p>'; return; }
  grid.innerHTML = list.map(s=>`
    <div class="schol-card ${s.featured?'feat':''}">
      <div class="schol-top">
        <span class="schol-icon">${s.icon||'🎓'}</span>
        <div><div class="schol-title">${s.title}</div><div class="schol-provider">${s.provider||''}</div></div>
      </div>
      <div class="schol-badges">
        ${s.featured?'<span class="schol-feat-tag">★ Featured</span>':''}
        ${s.type?`<span class="schol-badge">${s.type}</span>`:''}
        ${s.level?`<span class="schol-badge lvl">${s.level}</span>`:''}
      </div>
      ${s.coverage?`<div class="schol-row"><b>Coverage:</b> ${s.coverage}</div>`:''}
      ${s.eligibility?`<div class="schol-row"><b>Eligibility:</b> ${s.eligibility}</div>`:''}
      ${s.deadline?`<div class="schol-row"><b>Deadline:</b> ${s.deadline}</div>`:''}
      ${s.description?`<div class="schol-desc">${autoLinkUniversities(s.description)}</div>`:''}
      ${s.apply_url?`<a class="schol-apply" href="${s.apply_url}" target="_blank" rel="noopener">Apply / Details →</a>`:''}
    </div>
  `).join('');
}
function filterScholarships(type, btn){
  _scholFilter = type;
  document.querySelectorAll('.schol-fbtn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderScholarships();
}
function openScholarshipsPage(){
  closeAboutPage(); closeBlogPage();
  document.getElementById('scholarshipsPage').classList.add('active');
  document.body.classList.add('scholar-active');
  window.scrollTo({top:0, behavior:'smooth'});
  closeNavDropdown();
  loadScholarships();
}
function closeScholarshipsPage(){
  document.getElementById('scholarshipsPage').classList.remove('active');
  document.body.classList.remove('scholar-active');
  window.scrollTo({top:0, behavior:'smooth'});
}
function openArticle(id){
  const p = NEWS_POSTS.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('articleModal').innerHTML = `
    <button class="article-close" onclick="closeArticle()" aria-label="Close">×</button>
    <span class="article-cat">${p.category||'Article'}</span>
    <h1>${p.title}</h1>
    <div class="article-meta">By ${p.author||'TaleemPK'} · ${fmtNewsDate(p.date)}</div>
    <div class="article-content">${autoLinkUniversities(p.body||'<p>'+(p.excerpt||'')+'</p>')}</div>
  `;
  document.getElementById('articleOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  // Update URL hash for shareability and crawlability
  const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  history.replaceState(null,'','#blog-'+slug);
  // Article JSON-LD
  const artLd = {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline": p.title,
    "description": p.excerpt || p.title,
    "author":{"@type":"Organization","name": p.author||'TaleemPK'},
    "publisher":{"@type":"Organization","name":"TaleemPK","url":"https://taleempk.pk"},
    "datePublished": p.date || p.created_at,
    "dateModified": p.updated_at || p.date || p.created_at,
    "url": "https://taleempk.pk/#blog-"+slug,
    "mainEntityOfPage":{"@type":"WebPage","@id":"https://taleempk.pk/#blog-"+slug}
  };
  let as = document.getElementById('ldjson-article');
  if(!as){ as = document.createElement('script'); as.id='ldjson-article'; as.type='application/ld+json'; document.head.appendChild(as); }
  as.textContent = JSON.stringify(artLd);
}
function closeArticle(e){
  if(!e || e.target.id==='articleOverlay' || e.target.classList.contains('article-close')){
    document.getElementById('articleOverlay').classList.remove('show');
    document.body.style.overflow = '';
    history.replaceState(null,'',location.pathname);
  }
}

/* ── Nav Dropdown ── */
function toggleNavDropdown() {
  document.getElementById('navToolsDropdown').classList.toggle('open');
}
function closeNavDropdown() {
  document.getElementById('navToolsDropdown').classList.remove('open');
  closeMobileMenu();   // also close the mobile menu after selecting a tool
}
// ── Mobile hamburger menu ──
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const burger = document.getElementById('navHamburger');
  const open = links.classList.toggle('open');
  if(burger) burger.classList.toggle('open', open);
  if(!open) document.getElementById('navToolsDropdown').classList.remove('open');
}
function closeMobileMenu() {
  const links = document.querySelector('.nav-links');
  if(links) links.classList.remove('open');
  const burger = document.getElementById('navHamburger');
  if(burger) burger.classList.remove('open');
}
document.addEventListener('click', function(e) {
  var dd = document.getElementById('navToolsDropdown');
  if(dd && !dd.contains(e.target)) dd.classList.remove('open');
});

// ── Close every other student tool panel except the one being opened ──
function closeOtherTools(keep){
  // Map View
  if(keep!=='map' && typeof _mapActive!=='undefined' && _mapActive){
    _mapActive=false;
    document.getElementById('mapContainer').classList.remove('show');
    document.getElementById('uniGrid').style.display='';
    const pg=document.getElementById('pagination'); if(pg) pg.style.display='';
    const rc=document.getElementById('resultsCount'); if(rc) rc.style.display='';
    document.getElementById('mapToolBtn').classList.remove('active');
  }
  // Admission Calendar
  if(keep!=='cal'){
    const sec=document.getElementById('calendarSection');
    if(sec && sec.classList.contains('show')){
      sec.classList.remove('show');
      const b=document.getElementById('calToolBtn'); if(b) b.classList.remove('active');
    }
  }
  // Fee Calculator overlay
  if(keep!=='fee'){
    const ov=document.getElementById('feeOverlay');
    if(ov) ov.classList.remove('open');
  }
}

function toggleShortlistFilter() {
  // Gate: shortlist requires sign-in
  if(!currentUser){
    if(typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  if(!_slActive && _shortlistIds.size===0){
    alert('Your shortlist is empty. Tap the 🤍 button on any university card to save it.'); return;
  }
  closeOtherTools('shortlist');
  _slActive = !_slActive;
  document.getElementById('slToolBtn').classList.toggle('active', _slActive);
  document.getElementById('slToolBtn').querySelector('span.tool-badge') &&
    (document.getElementById('slToolBtn').style.background = _slActive ? 'var(--navy)' : '');
  currentPage=1; applyFilters();
}

// ════════════════════════════════════════════
//  STUDENT TOOL 2 — FEE CALCULATOR
// ════════════════════════════════════════════
let _feeHostel = true;

function parseFeeNumeric(s) {
  if(!s) return null;
  const toVal = (n, u) => parseFloat(n) * (u.toUpperCase()==='L' ? 100000 : 1000);
  // Rs. 80K–1.2L/sem  (mixed units)
  let m = s.match(/Rs\.\s*([\d.]+)\s*([KkLl])\s*[–\-]\s*([\d.]+)\s*([KkLl])/);
  if(m) return (toVal(m[1],m[2]) + toVal(m[3],m[4])) / 2;
  // Rs. 1.2–1.4L/sem or Rs. 30–40K/sem  (same unit)
  m = s.match(/Rs\.\s*([\d.]+)[–\-]([\d.]+)\s*([LlKk])/);
  if(m){ const avg=(parseFloat(m[1])+parseFloat(m[2]))/2; return m[3].toUpperCase()==='L'?avg*100000:avg*1000; }
  // Rs. 1.4L/sem  (single value)
  m = s.match(/Rs\.\s*([\d.]+)\s*([LlKk])\/sem/i);
  if(m){ const v=parseFloat(m[1]); return m[2].toUpperCase()==='L'?v*100000:v*1000; }
  return null;
}

function openFeeCalc() {
  setTimeout(()=>{ if (typeof hydrateIcons === 'function') hydrateIcons(document.getElementById('feeOverlay')); }, 0);
  closeOtherTools('fee');
  const sel = document.getElementById('fcUni');
  if(sel.options.length <= 1) {
    UNIVERSITIES.forEach(u=>{
      const fee=parseFeeNumeric(u.fee);
      if(fee){ const o=document.createElement('option'); o.value=u.id; o.textContent=`${u.name} — ${u.city}`; o.dataset.fee=fee; sel.appendChild(o); }
    });
  }
  document.getElementById('feeResult').classList.remove('show');
  document.getElementById('feeOverlay').classList.add('open');
  updateFeeCalc();
}
function closeFeeCalc(){ document.getElementById('feeOverlay').classList.remove('open'); }

function setHostel(v){
  _feeHostel=v;
  document.getElementById('fcHostYes').classList.toggle('active',v);
  document.getElementById('fcHostNo').classList.toggle('active',!v);
  updateFeeCalc();
}

function updateFeeCalc() {
  const dur = parseInt(document.getElementById('fcDur').value);
  const sch = parseInt(document.getElementById('fcSch').value);
  const liv = parseInt(document.getElementById('fcLiv').value);
  document.getElementById('fcDurLabel').textContent = `${dur} year${dur>1?'s':''} (${dur*2} sems)`;
  document.getElementById('fcSchLabel').textContent = `${sch}%`;
  document.getElementById('fcLivLabel').textContent = `Rs. ${Math.round(liv/1000)}K/mo`;
}

function calculateFee() {
  const sel = document.getElementById('fcUni');
  if(!sel.value){ alert('Please select a university first.'); return; }
  const feePer = parseFloat(sel.options[sel.selectedIndex].dataset.fee);
  const dur  = parseInt(document.getElementById('fcDur').value);
  const sch  = parseInt(document.getElementById('fcSch').value)/100;
  const liv  = parseInt(document.getElementById('fcLiv').value);
  const sems = dur*2;
  const tuition = feePer*sems*(1-sch);
  const hostel  = _feeHostel ? 35000*sems : 0;
  const living  = liv*6*sems;
  const total   = tuition+hostel+living;
  const fmt = n => n>=100000 ? `Rs. ${(n/100000).toFixed(1)}L` : `Rs. ${Math.round(n/1000)}K`;
  document.getElementById('feeTotal').textContent = fmt(total);
  document.getElementById('feeBreakdown').innerHTML = `
    <div class="fee-bline"><div class="fee-bline-k">Tuition (${sems} sems)</div><div class="fee-bline-v">${fmt(tuition)}</div></div>
    <div class="fee-bline"><div class="fee-bline-k">Scholarship Saving</div><div class="fee-bline-v" style="color:#86efac">−${fmt(feePer*sems*sch)}</div></div>
    <div class="fee-bline"><div class="fee-bline-k">${_feeHostel?'Hostel':'No Hostel'}</div><div class="fee-bline-v">${fmt(hostel)}</div></div>
    <div class="fee-bline"><div class="fee-bline-k">Living Expenses</div><div class="fee-bline-v">${fmt(living)}</div></div>
    <div class="fee-bline" style="grid-column:1/-1;background:rgba(0,200,83,0.12)">
      <div class="fee-bline-k">Per Semester (all-in)</div><div class="fee-bline-v">${fmt(total/sems)}</div>
    </div>`;
  document.getElementById('feeResult').classList.add('show');
}

// ════════════════════════════════════════════
//  SCHOLARSHIP AUTO-MATCHER
//  Multi-step wizard → keyword-weighted matching against Supabase scholarships
// ════════════════════════════════════════════
let _smProfile = { level:null, field:null, priority:null, region:null };
let _smCurrentStep = 1;
const SM_TOTAL_STEPS = 4;

function openScholMatch(){
  _smProfile = { level:null, field:null, priority:null, region:null };
  _smCurrentStep = 1;
  smRender();
  // Ensure scholarships are loaded
  if(!SCHOLARSHIPS.length) loadScholarships();
  document.getElementById('scholMatchOverlay').classList.add('open');
  if (typeof hydrateIcons === 'function') hydrateIcons(document.getElementById('scholMatchOverlay'));
}
function closeScholMatch(){ document.getElementById('scholMatchOverlay').classList.remove('open'); }

function smPick(btn, key){
  // Clear other selected on same step
  btn.parentElement.querySelectorAll('.sm-opt').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  _smProfile[key] = btn.dataset.val;
  document.getElementById('smNext').disabled = false;
}

function smGo(dir){
  _smCurrentStep += dir;
  if(_smCurrentStep < 1) _smCurrentStep = 1;
  if(_smCurrentStep > SM_TOTAL_STEPS){
    smShowResults();
    return;
  }
  smRender();
}

function smRender(){
  // Hide all steps + results
  document.querySelectorAll('#scholMatchOverlay .sm-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('smResults').classList.remove('show');
  document.getElementById('smNav').style.display='flex';
  // Show current step
  const step = document.querySelector(`#scholMatchOverlay .sm-step[data-step="${_smCurrentStep}"]`);
  if(step) step.classList.add('active');
  // Update progress bar
  const progress = document.getElementById('smProgress');
  Array.from(progress.children).forEach((d,i)=>{
    d.classList.remove('active','done');
    if(i+1 < _smCurrentStep) d.classList.add('done');
    else if(i+1 === _smCurrentStep) d.classList.add('active');
  });
  // Update nav buttons
  document.getElementById('smPrev').style.display = _smCurrentStep > 1 ? 'inline-block' : 'none';
  const nextBtn = document.getElementById('smNext');
  // Enable Next only if current step has selection
  const keys = ['level','field','priority','region'];
  const currentKey = keys[_smCurrentStep-1];
  nextBtn.disabled = !_smProfile[currentKey];
  nextBtn.textContent = _smCurrentStep === SM_TOTAL_STEPS ? '🎯 Find My Scholarships' : 'Next →';
}

function smRestart(){
  _smProfile = { level:null, field:null, priority:null, region:null };
  _smCurrentStep = 1;
  // Clear all selections
  document.querySelectorAll('#scholMatchOverlay .sm-opt').forEach(b=>b.classList.remove('selected'));
  smRender();
}

// Match a single scholarship against profile, return score + reasons
function smScoreScholarship(s, profile){
  let score = 0;
  const reasons = [];
  const matchTags = [];

  // Combine all searchable text
  const txt = `${s.title||''} ${s.provider||''} ${s.type||''} ${s.level||''} ${s.eligibility||''} ${s.coverage||''} ${s.description||''}`.toLowerCase();

  // ─── LEVEL match (heavy weight: ±25) ───
  const levelKeywords = {
    fsc:  ['fsc','intermediate','undergraduate','bachelor','bs ','bba','be ','mbbs','ssc','hssc','a-level','12th'],
    ug:   ['undergraduate','bachelor','bs ','bba','be ','mbbs'],
    pg:   ['graduate','master','ms ','mba','mphil','postgraduate'],
    phd:  ['phd','doctoral','doctorate']
  };
  const userLevelKW = levelKeywords[profile.level] || [];
  const levelMatch = userLevelKW.some(k=>txt.includes(k));
  if(levelMatch){ score += 25; matchTags.push('✓ Level match'); reasons.push(`Matches your <b>${profile.level.toUpperCase()}</b> education level`); }
  else if(s.level){
    // If scholarship explicitly mentions a different level, penalize
    const otherLevels = Object.keys(levelKeywords).filter(k=>k!==profile.level);
    const otherMatch = otherLevels.some(k=>levelKeywords[k].some(kw=>(s.level||'').toLowerCase().includes(kw)));
    if(otherMatch) score -= 15;
  }

  // ─── FIELD match (medium weight: +20) ───
  if(profile.field && profile.field !== 'any'){
    const fieldKeywords = {
      engineering: ['engineering','engg','ecat','technical','technology'],
      medical:     ['medical','mbbs','bds','mdcat','health','medicine','pharmacy','nursing','dental'],
      cs:          ['computer','software','it ','information technology','tech','cs ','data science','ai','programming'],
      business:    ['business','bba','mba','commerce','management','finance','accounting'],
      sciences:    ['science','physics','chemistry','biology','mathematics','research'],
      arts:        ['arts','humanities','social','design','literature','law','llb']
    };
    const kw = fieldKeywords[profile.field] || [];
    const fieldMatch = kw.some(k=>txt.includes(k));
    if(fieldMatch){ score += 20; matchTags.push(`✓ ${profile.field}`); reasons.push(`Specifically for <b>${profile.field}</b> students`); }
    // "All fields" / "any discipline" scholarships still get small bonus
    else if(/all field|any discipline|all program|cross-disciplinary/i.test(txt)){ score += 8; reasons.push('Open to all fields'); }
  } else {
    score += 5; // Any-field user gets baseline
  }

  // ─── PRIORITY match: need-based vs merit-based (+25) ───
  const needKW  = ['need','need-based','need based','low income','poverty','ehsaas','baitul mal','undeserved','financially weak','poor'];
  const meritKW = ['merit','high achiever','top scorer','distinction','gold medal','excellence','outstanding','academic award'];
  const hasNeed  = needKW.some(k=>txt.includes(k));
  const hasMerit = meritKW.some(k=>txt.includes(k));
  if(profile.priority === 'need' && hasNeed){ score += 25; matchTags.push('✓ Need-based'); reasons.push('Need-based — for financially deserving students'); }
  else if(profile.priority === 'merit' && hasMerit){ score += 25; matchTags.push('✓ Merit-based'); reasons.push('Merit-based — for top academic achievers'); }
  else if(profile.priority === 'both'){
    if(hasNeed){ score += 12; matchTags.push('✓ Need-based'); }
    if(hasMerit){ score += 12; matchTags.push('✓ Merit-based'); }
  }
  else if(profile.priority === 'need' && hasMerit){ score -= 5; } // mismatch
  else if(profile.priority === 'merit' && hasNeed){ score -= 5; }

  // ─── REGION match (+15) ───
  const foreignKW  = ['foreign','abroad','international','overseas','usa','uk ','australia','europe','china','germany','japan','fulbright','chevening','erasmus','daad','commonwealth'];
  const domesticKW = ['pakistan','hec','domestic','local','within pakistan'];
  const isForeign  = foreignKW.some(k=>txt.includes(k));
  const isDomestic = domesticKW.some(k=>txt.includes(k));
  if(profile.region === 'foreign' && isForeign){ score += 15; matchTags.push('✓ Foreign'); reasons.push('Foreign / international scholarship'); }
  else if(profile.region === 'domestic' && (isDomestic || !isForeign)){ score += 12; matchTags.push('✓ Domestic'); reasons.push('Available within Pakistan'); }
  else if(profile.region === 'both'){ score += 8; }
  else if(profile.region === 'domestic' && isForeign){ score -= 10; }
  else if(profile.region === 'foreign' && isDomestic && !isForeign){ score -= 8; }

  // ─── Featured / Active bonus ───
  if(s.featured) score += 8;

  // ─── Deadline penalty (past dates lose points) ───
  if(s.deadline){
    const d = new Date(s.deadline);
    if(!isNaN(d) && d < new Date()){ score -= 20; reasons.push('⚠️ Deadline already passed'); }
  }

  return { score, reasons, matchTags };
}

function smShowResults(){
  document.querySelectorAll('#scholMatchOverlay .sm-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('smNav').style.display='none';
  // Mark all progress as done
  Array.from(document.getElementById('smProgress').children).forEach(d=>{ d.classList.remove('active'); d.classList.add('done'); });

  const results = document.getElementById('smResults');
  results.classList.add('show');
  const list = document.getElementById('smList');

  if(!SCHOLARSHIPS.length){
    list.innerHTML = '<div class="sm-no-results">⏳ Scholarships loading... Please try again in a moment.</div>';
    document.getElementById('smCount').textContent = '0';
    return;
  }

  // Score everything
  const scored = SCHOLARSHIPS.map(s=>{
    const { score, reasons, matchTags } = smScoreScholarship(s, _smProfile);
    return { s, score, reasons, matchTags };
  }).filter(x=>x.score > 0).sort((a,b)=>b.score-a.score);

  document.getElementById('smCount').textContent = scored.length;

  if(!scored.length){
    list.innerHTML = '<div class="sm-no-results">😔 No matching scholarships found. Try relaxing your filters — pick "Any Field" or "Both" to see more options.</div>';
    return;
  }

  list.innerHTML = scored.slice(0, 15).map((x,i)=>{
    const { s, score, reasons, matchTags } = x;
    // Normalize score to percentage (cap at 100)
    const matchPct = Math.min(Math.round((score / 110) * 100), 100);
    const rankClass = matchPct >= 75 ? 'good' : matchPct >= 50 ? 'fair' : 'low';
    const rankLabel = matchPct >= 75 ? '🎯 Top Match' : matchPct >= 50 ? '👍 Good Fit' : '👀 Worth a Look';

    return `
      <div class="sm-result-card">
        <div class="sm-result-rank ${rankClass}">#${i+1} · ${rankLabel}</div>
        <div class="sm-result-top">
          <div class="sm-result-icon">${s.icon || '🎁'}</div>
          <div class="sm-result-info">
            <div class="sm-result-title">${s.title}</div>
            <div class="sm-result-provider">${s.provider||''}</div>
          </div>
          <div class="sm-result-score">
            <div class="sm-result-score-num">${matchPct}%</div>
            <div class="sm-result-score-lbl">Match</div>
          </div>
        </div>
        <div class="sm-result-tags">
          ${s.type    ? `<span class="sm-result-tag">${s.type}</span>` : ''}
          ${s.level   ? `<span class="sm-result-tag">${s.level}</span>` : ''}
          ${s.coverage? `<span class="sm-result-tag">${s.coverage}</span>` : ''}
          ${matchTags.map(t=>`<span class="sm-result-tag match">${t}</span>`).join('')}
        </div>
        ${reasons.length ? `<div class="sm-result-reasons"><b>Why this matches:</b> ${reasons.join(' · ')}</div>` : ''}
        ${s.deadline?`<div style="font-size:.78rem;color:#5A6478;margin-top:8px;">📅 <b>Deadline:</b> ${s.deadline}</div>`:''}
        <div class="sm-result-actions">
          ${s.apply_url ? `<a class="sm-result-btn" href="${s.apply_url}" target="_blank" rel="noopener">Apply / Details →</a>` : ''}
          <button class="sm-result-btn outline" onclick="navigator.clipboard.writeText('${(s.apply_url||s.title).replace(/'/g,'')}').then(()=>{this.textContent='✓ Copied';setTimeout(()=>this.textContent='🔗 Copy Link',1500);})">🔗 Copy Link</button>
        </div>
      </div>
    `;
  }).join('');
}

// ════════════════════════════════════════════
//  MERIT AGGREGATE CALCULATOR
//  Real formulas used by Pakistani universities (2024-25 official policies)
// ════════════════════════════════════════════
const MERIT_FORMULAS = [
  // ─── Engineering ───
  { uni:'NUST',              field:'engineering', test:{name:'NUST NET', max:200},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.15, test:0.75}, lastMerit:'160-170 (NET)' },
  { uni:'UET Lahore',        field:'engineering', test:{name:'ECAT',     max:400},  matric:1100, fsc:1100, weights:{matric:0.17, fsc:0.50, test:0.33}, lastMerit:'78-82%' },
  { uni:'UET Taxila',        field:'engineering', test:{name:'ECAT',     max:400},  matric:1100, fsc:1100, weights:{matric:0.17, fsc:0.50, test:0.33}, lastMerit:'72-78%' },
  { uni:'UET Peshawar',      field:'engineering', test:{name:'ETEA',     max:200},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'70-80%' },
  { uni:'GIKI',              field:'engineering', test:{name:'GIKI Test',max:100},  matric:1100, fsc:1100, weights:{matric:0.15, fsc:0.00, test:0.85}, lastMerit:'80-85%' },
  { uni:'PIEAS',             field:'engineering', test:{name:'PIEAS Test',max:100}, matric:1100, fsc:1100, weights:{matric:0.15, fsc:0.25, test:0.60}, lastMerit:'85-90%' },
  { uni:'NED University',    field:'engineering', test:{name:'NED Test', max:100},  matric:1100, fsc:1100, weights:{matric:0.00, fsc:0.40, test:0.60}, lastMerit:'80-87%' },
  { uni:'MUET Jamshoro',     field:'engineering', test:{name:'MUET Test',max:100},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'72-80%' },
  { uni:'QUEST Nawabshah',   field:'engineering', test:{name:'QUEST Test',max:100}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'68-75%' },
  { uni:'KFUEIT',            field:'engineering', test:{name:'KFUEIT Test',max:100},matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'70-76%' },
  { uni:'Air University',    field:'engineering', test:{name:'AU Test',  max:100},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'72-78%' },
  { uni:'Bahria University', field:'engineering', test:{name:'Bahria Test',max:100},matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'68-75%' },
  { uni:'HITEC University',  field:'engineering', test:{name:'HITEC Test',max:100}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'65-72%' },

  // ─── Computing / Tech ───
  { uni:'FAST NUCES',        field:'cs',          test:{name:'NU Test',  max:100},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'78-85%' },
  { uni:'COMSATS',           field:'cs',          test:{name:'NTS/Test', max:100},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'70-80%' },
  { uni:'ITU Lahore',        field:'cs',          test:{name:'ITU Test', max:100},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'72-80%' },
  { uni:'NUST (CS/AI)',      field:'cs',          test:{name:'NUST NET', max:200},  matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.15, test:0.75}, lastMerit:'170-180 (NET)' },

  // ─── Medical (PMC Unified Formula) ───
  { uni:'King Edward Medical (KEMU)',  field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'92-95%' },
  { uni:'Allama Iqbal Medical (AIMC)', field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'90-93%' },
  { uni:'Nishtar Medical (NMU)',       field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'88-92%' },
  { uni:'Dow Medical (DUHS)',          field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'85-90%' },
  { uni:'Aga Khan Medical (AKU)',      field:'medical', test:{name:'AKU Test',max:100},matric:1100,fsc:1100, weights:{matric:0.10, fsc:0.30, test:0.60}, lastMerit:'Top 10% nationally' },
  { uni:'NUMS / AMC',                  field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'87-92%' },
  { uni:'Rawalpindi Medical (RMU)',    field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'89-93%' },
  { uni:'Fatima Jinnah Medical (FJMU)',field:'medical', test:{name:'MDCAT', max:200}, matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'90-93%' },

  // ─── Business / SAT-Based ───
  { uni:'IBA Karachi',  field:'business', test:{name:'IBA Aptitude', max:100}, matric:1100, fsc:1100, weights:{matric:0.00, fsc:0.30, test:0.70}, lastMerit:'Aptitude-based' },
  { uni:'LUMS',         field:'business', test:{name:'SAT',     max:1600},     matric:0,    fsc:1100, weights:{matric:0.00, fsc:0.30, test:0.70}, lastMerit:'SAT 1300+ / A-Level AAB+' },
  { uni:'IBA Sukkur',   field:'business', test:{name:'SIBA Test',max:100},     matric:1100, fsc:1100, weights:{matric:0.10, fsc:0.40, test:0.50}, lastMerit:'72-80%' },
];

let _meritUniData = null;

function openMeritCalc() {
  // Populate uni select
  const sel = document.getElementById('mcUni');
  if(sel.options.length <= 1){
    // Group by field
    const groups = { engineering:'🛠️ Engineering', cs:'💻 Computer Science', medical:'🏥 Medical (MBBS)', business:'💼 Business' };
    for(const [g, label] of Object.entries(groups)){
      const og = document.createElement('optgroup'); og.label = label;
      MERIT_FORMULAS.filter(f=>f.field===g).forEach((f,i)=>{
        const opt = document.createElement('option');
        opt.value = MERIT_FORMULAS.indexOf(f);
        opt.textContent = f.uni;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    }
  }
  document.getElementById('meritCalcOverlay').classList.add('open');
  if (typeof hydrateIcons === 'function') hydrateIcons(document.getElementById('meritCalcOverlay'));
}
function closeMeritCalc(){ document.getElementById('meritCalcOverlay').classList.remove('open'); }

/* ───────────────── CGPA CALCULATOR ───────────────── */
const CGPA_GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F'];
let _cgpaInit = false;

function cgpaScale(){
  const id = parseInt(document.getElementById('cgpaUni')?.value) || 0;
  const G = (window.TPK_GPA||{});
  return (id && G.byId && G.byId[id]) ? G.byId[id] : (G.hec || {grades:{'A+':4,'A':4,'A-':3.67,'B+':3.33,'B':3,'B-':2.67,'C+':2.33,'C':2,'C-':1.67,'D+':1.33,'D':1,'F':0}, conv:25});
}

// Grades valid for a scale: those with grade points > 0 (in canonical order) plus
// F. Grades a university doesn't use (e.g. NUST has no A-/B-/C+) are stored as 0
// in the data and must NOT appear in the dropdown — otherwise picking one wrongly
// scores 0. The top grade (A or A+) is whichever the scale defines with the max GP.
function validGrades(scale){
  const g = scale.grades || {};
  const list = CGPA_GRADES.filter(k => k!=='F' && (g[k]||0) > 0);
  list.push('F');
  return list;
}
function gradeOptions(scale, selected){
  return validGrades(scale).map(k=>`<option value="${k}"${k===selected?' selected':''}>${k}</option>`).join('');
}

function openCgpaCalc(){
  const ov = document.getElementById('cgpaOverlay');
  if(!_cgpaInit){
    // populate uni dropdown (only those whose scale differs from HEC are flagged)
    const sel = document.getElementById('cgpaUni');
    const custom = (window.TPK_GPA && window.TPK_GPA.byId) ? window.TPK_GPA.byId : {};
    if(typeof UNIVERSITIES !== 'undefined'){
      UNIVERSITIES.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'')).forEach(u=>{
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.name + (custom[u.id] ? ' — custom scale' : '');
        sel.appendChild(opt);
      });
    }
    // start with 3 blank course rows
    addCgpaRow(); addCgpaRow(); addCgpaRow();
    _cgpaInit = true;
  }
  ov.classList.add('open');
  if(window.hydrateIcons) window.hydrateIcons(ov);
  renderCgpaRows();
}
function closeCgpaCalc(){ document.getElementById('cgpaOverlay').classList.remove('open'); }

function addCgpaRow(){
  const box = document.getElementById('cgpaRows');
  const row = document.createElement('div');
  row.className = 'cgpa-row';
  row.innerHTML =
    `<input type="text" class="cgpa-cname" placeholder="Course (optional)" aria-label="Course name">`+
    `<select class="cgpa-grade" aria-label="Grade" onchange="calcCgpa()">${gradeOptions(cgpaScale(),'A')}</select>`+
    `<input type="number" class="cgpa-ch" min="0" max="12" step="0.5" placeholder="Cr" aria-label="Credit hours" oninput="calcCgpa()">`+
    `<button class="cgpa-del" aria-label="Remove course" onclick="this.parentElement.remove();calcCgpa()"><span data-icon="x" data-size="12"></span></button>`;
  box.appendChild(row);
  if(window.hydrateIcons) window.hydrateIcons(row);
}

function renderCgpaRows(){
  const s = cgpaScale();
  // rebuild every row's grade dropdown to this scale's valid grades, keeping the
  // current pick if it's still valid (else fall back to the top grade)
  const valid = validGrades(s);
  document.querySelectorAll('#cgpaRows .cgpa-grade').forEach(sel=>{
    const cur = valid.includes(sel.value) ? sel.value : valid[0];
    sel.innerHTML = gradeOptions(s, cur);
  });
  const note = document.getElementById('cgpaScaleNote');
  const id = parseInt(document.getElementById('cgpaUni')?.value)||0;
  const isCustom = id && window.TPK_GPA && window.TPK_GPA.byId && window.TPK_GPA.byId[id];
  const topGp = Math.max(...Object.values(s.grades||{}));
  note.textContent = isCustom
    ? `This university uses a custom grading scale (top grade = ${topGp} GP, ${valid.length} grade levels). Percentage ≈ CGPA × ${s.conv}.`
    : `HEC standard 4.0 scale (A = 4.0). Percentage ≈ CGPA × ${s.conv}.`;
  calcCgpa();
}

function calcCgpa(){
  const s = cgpaScale();
  let totQ = 0, totCh = 0;
  document.querySelectorAll('#cgpaRows .cgpa-row').forEach(r=>{
    const g = r.querySelector('.cgpa-grade').value;
    const ch = parseFloat(r.querySelector('.cgpa-ch').value);
    if(!ch || ch<=0) return;
    const gp = (g in s.grades) ? s.grades[g] : 0;
    totQ += gp * ch;
    totCh += ch;
  });
  const res = document.getElementById('cgpaResult');
  if(totCh <= 0){ res.style.display='none'; return; }
  const gpa = totQ / totCh;
  const pct = gpa * s.conv;
  document.getElementById('cgpaNum').textContent = gpa.toFixed(2);
  document.getElementById('cgpaPct').textContent = Math.min(pct,100).toFixed(1) + '%';
  document.getElementById('cgpaCredits').textContent = `Based on ${totCh} credit hour${totCh!==1?'s':''}`;
  let verdict, cls;
  if(gpa>=3.5){ verdict="🌟 Excellent — Dean's List range"; cls='good'; }
  else if(gpa>=3.0){ verdict='👍 Very Good standing'; cls='good'; }
  else if(gpa>=2.5){ verdict='✓ Good standing'; cls='fair'; }
  else if(gpa>=2.0){ verdict='⚠️ Satisfactory — above graduation minimum (2.0)'; cls='fair'; }
  else { verdict='❗ Below the 2.0 graduation minimum — improvement needed'; cls='low'; }
  const v = document.getElementById('cgpaVerdict');
  v.textContent = verdict; v.className = 'cgpa-verdict ' + cls;
  res.style.display = 'block';
}

function updateMeritCalc() {
  const idx = document.getElementById('mcUni').value;
  if(idx === ''){ _meritUniData=null; ['mcMatricRow','mcFscRow','mcTestRow','mcSatRow','mcFormulaBox'].forEach(id=>document.getElementById(id).style.display='none'); return; }
  const f = MERIT_FORMULAS[parseInt(idx)];
  _meritUniData = f;

  // Show formula
  const w = f.weights;
  const parts = [];
  if(w.matric) parts.push(`${(w.matric*100).toFixed(0)}% Matric`);
  if(w.fsc)    parts.push(`${(w.fsc*100).toFixed(0)}% FSc`);
  if(w.test)   parts.push(`${(w.test*100).toFixed(0)}% ${f.test.name}`);
  document.getElementById('mcFormulaText').innerHTML =
    `${parts.join(' + ')} &nbsp;·&nbsp; <em>Last year merit: ${f.lastMerit}</em>`;
  document.getElementById('mcFormulaBox').style.display = 'block';

  // Toggle input rows based on weights
  document.getElementById('mcMatricRow').style.display = w.matric > 0 ? 'block' : 'none';
  document.getElementById('mcFscRow').style.display    = w.fsc > 0    ? 'block' : 'none';
  // Use SAT row if test name is SAT, else regular Test row
  const isSat = /SAT/i.test(f.test.name);
  document.getElementById('mcTestRow').style.display = (w.test > 0 && !isSat) ? 'block' : 'none';
  document.getElementById('mcSatRow').style.display  = (w.test > 0 && isSat)  ? 'block' : 'none';

  if(!isSat){
    document.getElementById('mcTestLabel').textContent = f.test.name;
    document.getElementById('mcTestMax').textContent = f.test.max;
  }
  document.getElementById('mcMatricMax').textContent = f.matric || 1100;
  document.getElementById('mcFscMax').textContent    = f.fsc    || 1100;
}

function calculateMerit() {
  if(!_meritUniData){ alert('Please select a university first.'); return; }
  const f = _meritUniData;
  const w = f.weights;
  const matricObt = parseFloat(document.getElementById('mcMatricInput').value) || 0;
  const fscObt    = parseFloat(document.getElementById('mcFscInput').value)    || 0;
  const isSat = /SAT/i.test(f.test.name);
  const testObt   = parseFloat(document.getElementById(isSat?'mcSatInput':'mcTestInput').value) || 0;

  // Cap at max
  const matricPct = f.matric ? Math.min(matricObt / f.matric, 1) : 0;
  const fscPct    = f.fsc    ? Math.min(fscObt    / f.fsc,    1) : 0;
  const testMax   = isSat ? 1600 : f.test.max;
  const testPct   = Math.min(testObt   / testMax,   1);

  // Update mini progress bars + % under each input
  if(w.matric){
    document.getElementById('mcMatricBar').style.width = (matricPct*100)+'%';
    document.getElementById('mcMatricPctTxt').textContent = (matricPct*100).toFixed(1)+'%';
  }
  if(w.fsc){
    document.getElementById('mcFscBar').style.width = (fscPct*100)+'%';
    document.getElementById('mcFscPctTxt').textContent = (fscPct*100).toFixed(1)+'%';
  }
  if(w.test){
    const barId = isSat?'mcSatBar':'mcTestBar';
    const pctId = isSat?'mcSatPctTxt':'mcTestPctTxt';
    document.getElementById(barId).style.width = (testPct*100)+'%';
    document.getElementById(pctId).textContent = (testPct*100).toFixed(1)+'%';
  }

  // Aggregate
  const agg = (w.matric * matricPct + w.fsc * fscPct + w.test * testPct) * 100;

  // Don't show result until at least test is entered
  const hasInput = matricObt > 0 || fscObt > 0 || testObt > 0;
  if(!hasInput){ document.getElementById('meritResult').classList.remove('show'); return; }

  // Verdict comparing against last year merit
  let verdictClass='good', verdictText='Calculating…';
  const mlr = f.lastMerit.match(/(\d+(?:\.\d+)?)/g);
  if(mlr){
    const meritThreshold = parseFloat(mlr[0]);
    const isNETScore = /NET/.test(f.test.name) && /NET/.test(f.lastMerit);
    const scaled = isNETScore ? testObt : agg;

    if(scaled >= meritThreshold + 5){ verdictClass='strong'; verdictText='🎯 Strong Match · Likely Admission'; }
    else if(scaled >= meritThreshold){ verdictClass='good'; verdictText='👍 Good Match · Within Range'; }
    else if(scaled >= meritThreshold - 5){ verdictClass='border'; verdictText='⚠️ Borderline · Apply with Backups'; }
    else { verdictClass='reach'; verdictText='📚 Reach · Need Higher Marks'; }
  }

  // Big number color
  const numEl = document.getElementById('meritTotal');
  numEl.className = 'mc-result-num ' + verdictClass;
  numEl.innerHTML = `${agg.toFixed(2)}<span class="mc-result-suffix">%</span>`;

  // Verdict chip
  const v = document.getElementById('meritVerdict');
  v.className = 'mc-verdict ' + verdictClass;
  v.innerHTML = verdictText;

  // Beautiful breakdown rows
  const rows = [];
  if(w.matric){
    rows.push(`<div class="mc-bd-row">
      <div class="mc-bd-icon matric">${icon('bookOpen',{size:20})}</div>
      <div class="mc-bd-info">
        <div class="mc-bd-name">Matric / SSC</div>
        <div class="mc-bd-detail">${matricObt} / ${f.matric} &nbsp;·&nbsp; weight ${(w.matric*100).toFixed(0)}%</div>
      </div>
      <div class="mc-bd-contrib">+${(w.matric*matricPct*100).toFixed(2)}<small>POINTS</small></div>
    </div>`);
  }
  if(w.fsc){
    rows.push(`<div class="mc-bd-row">
      <div class="mc-bd-icon fsc">${icon('graduationCap',{size:20})}</div>
      <div class="mc-bd-info">
        <div class="mc-bd-name">FSc / Intermediate</div>
        <div class="mc-bd-detail">${fscObt} / ${f.fsc} &nbsp;·&nbsp; weight ${(w.fsc*100).toFixed(0)}%</div>
      </div>
      <div class="mc-bd-contrib">+${(w.fsc*fscPct*100).toFixed(2)}<small>POINTS</small></div>
    </div>`);
  }
  if(w.test){
    rows.push(`<div class="mc-bd-row">
      <div class="mc-bd-icon test">${icon('scroll',{size:20})}</div>
      <div class="mc-bd-info">
        <div class="mc-bd-name">${f.test.name}</div>
        <div class="mc-bd-detail">${testObt} / ${testMax} &nbsp;·&nbsp; weight ${(w.test*100).toFixed(0)}%</div>
      </div>
      <div class="mc-bd-contrib">+${(w.test*testPct*100).toFixed(2)}<small>POINTS</small></div>
    </div>`);
  }

  document.getElementById('meritBreakdown').innerHTML = `
    <div class="mc-bd-title">Breakdown of your aggregate</div>
    ${rows.join('')}
    <div class="mc-last-merit">${icon('trendingUp',{size:14})} Last year closing merit at <b>${f.uni}</b>: <b>${f.lastMerit}</b></div>
  `;
  document.getElementById('meritResult').classList.add('show');
  if (typeof hydrateIcons === 'function') hydrateIcons(document.getElementById('meritCalcOverlay'));
}

// ════════════════════════════════════════════
//  STUDENT TOOL 3 — ADMISSION CALENDAR
// ════════════════════════════════════════════
let _calFilter = 'all';
const TODAY = new Date(); TODAY.setHours(0,0,0,0);

function toggleCalendar() {
  const sec = document.getElementById('calendarSection');
  const isOpen = sec.classList.toggle('show');
  document.getElementById('calToolBtn').classList.toggle('active', isOpen);
  if(isOpen){ closeOtherTools('cal'); renderCalendar(); }
}

function filterCal(type, btn) {
  _calFilter = type;
  document.querySelectorAll('.cal-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderCalendar();
}

// ── Dynamic calendar events: admin-set deadlines + scraped items with parseable dates ──
let DYNAMIC_DATES = [];
function _parseEventDate(text){
  // "15 August 2026", "Aug 15, 2026", "15-08-2026", "2026-08-15"
  const MON='jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  let m = text.match(new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s+(${MON})[a-z]*\\.?,?\\s*(20\\d{2})?`,'i'))
       || text.match(new RegExp(`(${MON})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(20\\d{2})?`,'i'));
  if(m){
    const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    const isDayFirst = /^\d/.test(m[1]);
    const day  = parseInt(isDayFirst ? m[1] : m[2]);
    const mon  = months[(isDayFirst ? m[2] : m[1]).slice(0,3).toLowerCase()];
    let year = m[3] ? parseInt(m[3]) : new Date().getFullYear();
    let d = new Date(year, mon, day);
    if(!m[3] && d < new Date(Date.now()-30*86400000)) { year++; d = new Date(year, mon, day); } // no year + past → next year
    // build ISO locally — toISOString() shifts to UTC and loses a day in PKT
    if(day>=1 && day<=31 && !isNaN(d)) return `${year}-${String(mon+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  m = text.match(/(20\d{2})-(\d{2})-(\d{2})/) || text.match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/);
  if(m) return m[1].length===4 ? `${m[1]}-${m[2]}-${m[3]}` : `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  return null;
}
async function loadDynamicDates(){
  const H = { apikey: SUPABASE.key, Authorization: 'Bearer ' + SUPABASE.key };
  const out = [];
  try{
    // 1. Admin-set admission deadlines (institutions table)
    const r1 = await fetch(SUPABASE.url + '/rest/v1/institutions?select=name,admission_deadline,admission_deadline_note&admission_deadline=not.is.null', {headers:H});
    if(r1.ok) (await r1.json()).forEach(x => out.push({
      uni: x.name, ev: 'Admission Deadline' + (x.admission_deadline_note ? ' — ' + x.admission_deadline_note : ''),
      date: x.admission_deadline, type: 'deadline'
    }));
    // 2. Scraped updates whose titles contain a parseable date
    const r2 = await fetch(SUPABASE.url + '/rest/v1/uni_updates?select=uni_name,title,kind&status=neq.dismissed&order=found_at.desc&limit=100', {headers:H});
    if(r2.ok) (await r2.json()).forEach(x => {
      const date = _parseEventDate(x.title || '');
      if(!date) return;
      const type = /entry\s*test|\bnet\b|mdcat|ecat|\bnat\b|\bgat\b|admission\s*test/i.test(x.title) ? 'test'
                 : /merit\s*list/i.test(x.title) ? 'merit'
                 : x.kind === 'deadline' || /deadline|last\s*date/i.test(x.title) ? 'deadline' : 'open';
      out.push({ uni: x.uni_name, ev: x.title.slice(0,90), date, type });
    });
  }catch(e){ /* offline / tables missing — static calendar still works */ }
  // Dedupe against static + within itself (same uni + date + type)
  const seen = new Set(ADMISSION_DATES.map(e=>`${e.uni}|${e.date}|${e.type}`));
  DYNAMIC_DATES = out.filter(e => { const k=`${e.uni}|${e.date}|${e.type}`; if(seen.has(k)) return false; seen.add(k); return true; });
  if(document.getElementById('calEvents')) renderCalendar();
}
// Deferred: SUPABASE const is declared further down this file — calling now would hit the TDZ
document.addEventListener('DOMContentLoaded', loadDynamicDates);

function renderCalendar() {
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const events = ADMISSION_DATES.concat(DYNAMIC_DATES)
    .filter(e => _calFilter==='all' || e.type===_calFilter)
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!events.length){ document.getElementById('calEvents').innerHTML='<div class="cal-empty">No events for this filter.</div>'; return; }
  document.getElementById('calEvents').innerHTML = events.map(e=>{
    const d    = new Date(e.date+'T00:00:00');
    const diff = Math.round((d-TODAY)/86400000);
    const urg  = diff<0?'past':diff<=7?'urgent':diff<=30?'soon':'ok';
    const daysLabel = diff<0?'Done':diff===0?'Today!':diff===1?'1 day left':`${diff} days left`;
    const dcolor = diff<=7&&diff>=0?'#ef4444':diff<=30&&diff>=0?'#f59e0b':'var(--green-dark)';
    const badgeMap = {test:'📝 Test',deadline:'📋 Deadline',merit:'📊 Merit List',open:'🔓 Open'};
    return `<div class="cal-event ${urg}">
      <div class="cal-date"><div class="cal-day">${d.getDate()}</div><div class="cal-mon">${MONTHS[d.getMonth()]}</div></div>
      <div class="cal-info">
        <div class="cal-uni">${e.uni}</div>
        <div class="cal-desc">${e.ev}${diff>=0?` · <strong style="color:${dcolor}">${daysLabel}</strong>`:''}</div>
      </div>
      <span class="cal-badge ${e.type}">${badgeMap[e.type]||'Event'}</span>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════
//  STUDENT TOOL 4 — MAP VIEW
// ════════════════════════════════════════════
let _mapActive=false, _mapInit=false, _mapInstance=null, _mapMarkers={};

function toggleMapView() {
  _mapActive = !_mapActive;
  if(_mapActive) closeOtherTools('map');
  document.getElementById('mapContainer').classList.toggle('show',_mapActive);
  document.getElementById('uniGrid').style.display    = _mapActive?'none':'';
  document.getElementById('pagination').style.display = _mapActive?'none':'';
  document.getElementById('resultsCount').style.display = _mapActive?'none':'';
  document.getElementById('mapToolBtn').classList.toggle('active',_mapActive);
  if(_mapActive && !_mapInit){ initMap(); _mapInit=true; }
  if(_mapActive && _mapInstance){ setTimeout(()=>_mapInstance.invalidateSize(),50); }
}

function initMap() {
  const container = document.getElementById('mapContainer');
  if(typeof L==='undefined'){
    // Lazy load Leaflet JS on first map open
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => initMap();
    s.onerror = () => { container.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9BA5B5;font-size:0.9rem;">🗺️ Map unavailable — check internet connection</div>'; };
    document.head.appendChild(s);
    return;
  }
  // Zoom control on the right so the search box can sit top-left
  _mapInstance = L.map('mapContainer',{zoomControl:false}).setView([30.3753,69.3451],6);
  L.control.zoom({position:'topright'}).addTo(_mapInstance);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(_mapInstance);
  // Renamed to mapMarkerIcon so it doesn't shadow the global icon() helper
  const mapMarkerIcon = L.divIcon({className:'',html:'<div style="background:#00C853;width:9px;height:9px;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>',iconSize:[9,9],iconAnchor:[4,4]});
  _mapMarkers = {};
  UNIVERSITIES.forEach(u=>{
    const c=CITY_COORDS[u.city]; if(!c) return;
    const jr=()=>(Math.random()-0.5)*0.03;
    const lat=c[0]+jr(), lng=c[1]+jr();
    const typeLabel = u.type==='public' ? 'Public' : 'Private';
    const marker = L.marker([lat,lng],{icon: mapMarkerIcon}).bindPopup(
      `<div class="map-popup"><div class="map-popup-name">${escHTML(u.name)}</div><div class="map-popup-city">${escHTML(u.city)} · ${typeLabel}</div><button class="map-popup-btn" onclick="toggleMapView();setTimeout(()=>openDetail(${u.id}),100)">View Details →</button></div>`
    ).addTo(_mapInstance);
    _mapMarkers[u.id] = { marker, name:u.name, city:u.city, lat, lng };
  });

  // Search-on-map control (top-left)
  const SearchCtl = L.Control.extend({
    options:{ position:'topleft' },
    onAdd: function(){
      const div = L.DomUtil.create('div','map-search-control');
      div.innerHTML = `<input type="search" id="mapSearchInput" placeholder="🔍 Search university on map…" autocomplete="off" oninput="mapSearchInput(this.value)" onfocus="mapSearchInput(this.value)"><div class="map-search-results" id="mapSearchResults"></div>`;
      // Stop map drag/scroll/click when interacting with the box
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      return div;
    }
  });
  _mapInstance.addControl(new SearchCtl());
  // Clicking the map closes the results dropdown
  _mapInstance.on('click', ()=>{ const b=document.getElementById('mapSearchResults'); if(b) b.classList.remove('show'); });
}

// Filter universities as the user types in the map search box
function mapSearchInput(v){
  const box = document.getElementById('mapSearchResults'); if(!box) return;
  const q = (v||'').trim().toLowerCase();
  if(q.length < 1){ box.classList.remove('show'); box.innerHTML=''; return; }
  const matches = Object.entries(_mapMarkers)
    .filter(([id,m]) => m.name.toLowerCase().includes(q) || (m.city||'').toLowerCase().includes(q))
    .slice(0,8);
  if(!matches.length){
    box.innerHTML = '<div class="map-search-empty">No university found on the map for that name.</div>';
    box.classList.add('show'); return;
  }
  box.innerHTML = matches.map(([id,m])=>
    `<a onclick="mapSearchGo(${id})">${escHTML(m.name)}<span class="msr-city"> · ${escHTML((m.city||'').split('/')[0].trim())}</span></a>`
  ).join('');
  box.classList.add('show');
}
// Pan/zoom the map to the chosen university and open its popup
function mapSearchGo(id){
  const m = _mapMarkers[id]; if(!m || !_mapInstance) return;
  _mapInstance.setView([m.lat, m.lng], 13, { animate:true });
  m.marker.openPopup();
  const box = document.getElementById('mapSearchResults'); if(box) box.classList.remove('show');
  const inp = document.getElementById('mapSearchInput'); if(inp) inp.value = m.name;
}

// ════════════════════════════════════════════
//  STUDENT TOOL 5 — MERIT TREND CHART
// ════════════════════════════════════════════
function renderTrendChart(uniId) {
  const data = MERIT_TRENDS[uniId]; if(!data) return;
  const canvas = document.getElementById(`trend-${uniId}`);
  if(!canvas || typeof Chart==='undefined') return;
  new Chart(canvas,{
    type:'line',
    data:{
      labels:data.y,
      datasets:[{
        label:'Closing Merit %', data:data.m,
        borderColor:'#00C853', backgroundColor:'rgba(0,200,83,0.1)',
        borderWidth:2.5, pointBackgroundColor:'#00C853', pointRadius:5, tension:0.3, fill:true
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>`Merit: ${c.raw}%`}} },
      scales:{
        y:{ min:Math.min(...data.m)-3, max:Math.max(...data.m)+3,
            ticks:{callback:v=>v+'%',font:{size:10},color:'#9BA5B5'},
            grid:{color:'rgba(0,0,0,0.05)'} },
        x:{ ticks:{font:{size:10},color:'#9BA5B5'}, grid:{display:false} }
      }
    }
  });
}

// ════════════════════════════════════════════════════════
//  COMMUNITY FEATURE 6 — UNIVERSITY REVIEWS
// ════════════════════════════════════════════════════════
const REVIEW_CACHE = {};   // uniId -> [reviews] from DB
const RATING_AGG = {};     // uniId -> {sum,count} for card star ratings
function getReviews(uniId){ return REVIEW_CACHE[uniId] || []; }

async function loadReviews(uniId){
  if(!sbClient) return;
  try{
    const { data, error } = await sbClient.from('reviews')
      .select('id,rating,category,body,author,helpful,created_at')
      .eq('institution_id', uniId).order('created_at',{ascending:false});
    if(error) throw error;
    REVIEW_CACHE[uniId] = (data||[]).map(r=>({
      id:r.id, rating:r.rating, cat:r.category||'General', text:r.body,
      author:r.author||'Student', helpful:r.helpful||0,
      date:new Date(r.created_at).toLocaleDateString('en-PK',{month:'short',year:'numeric'})
    }));
    const sec=document.getElementById('rvSection-'+uniId);
    if(sec) sec.innerHTML = buildReviewsHTML(uniId);
  }catch(e){ /* keep whatever is cached */ }
}

let PROGRAM_INDEX = [];   // unique program names across all institutions (for search suggestions)
function buildProgramIndex(){
  const set = new Set();
  UNIVERSITIES.forEach(u => (u.programs||[]).forEach(p => { if(p && p.trim().length>2) set.add(p.trim()); }));
  PROGRAM_INDEX = [...set].sort((a,b)=>a.localeCompare(b));
}

async function loadRatingAggregates(){
  if(!sbClient) return;
  try{
    // Fast path: read tiny materialized view (one row per institution).
    // Old code pulled every review row just to compute averages — O(reviews)
    // network cost on every homepage hit.
    const { data, error } = await sbClient.from('review_aggregates')
      .select('institution_id,review_count,avg_rating');
    if(error) throw error;
    Object.keys(RATING_AGG).forEach(k=>delete RATING_AGG[k]);
    (data||[]).forEach(r=>{
      RATING_AGG[r.institution_id] = {
        sum: (r.avg_rating || 0) * (r.review_count || 0),
        count: r.review_count || 0
      };
    });
  }catch(e){
    // Fallback to direct count if the view isn't deployed yet
    try{
      const { data } = await sbClient.from('reviews').select('institution_id,rating');
      const agg={};
      (data||[]).forEach(r=>{ const a=agg[r.institution_id]||(agg[r.institution_id]={sum:0,count:0}); a.sum+=r.rating; a.count++; });
      Object.keys(RATING_AGG).forEach(k=>delete RATING_AGG[k]);
      Object.assign(RATING_AGG, agg);
    }catch(_){}
  }
}

let _rvStar = 0, _rvCat = '';
function rvPickStar(n, uniId) {
  _rvStar = n;
  const row = document.getElementById('rvStarPicker-'+uniId);
  if(!row) return;
  row.querySelectorAll('span').forEach((s,i)=>s.classList.toggle('on', i<n));
}
function rvPickCat(cat, uniId) {
  _rvCat = cat;
  document.querySelectorAll(`#rvCatRow-${uniId} .review-cat`).forEach(b=>b.classList.toggle('sel', b.dataset.cat===cat));
}
function toggleReviewForm(uniId) {
  const f = document.getElementById('rvForm-'+uniId);
  if(f){ f.classList.toggle('open'); _rvStar=0; _rvCat=''; }
}
async function submitReview(uniId) {
  if(!currentUser){ openAuthModal('login'); return; }
  const txt = document.getElementById('rvTxt-'+uniId).value.trim();
  if(txt.length < 5){ alert('Review must be at least 5 characters.'); return; }
  if(txt.length > 2000){ alert('Review is too long (max 2000 characters).'); return; }
  if(!_rvStar){ alert('Please select a star rating.'); return; }
  const row = { institution_id: uniId, rating: _rvStar, category: _rvCat||'General', body: txt, author: userDisplayName(currentUser) };
  const { error } = await sbClient.from('reviews').insert(row);
  if(error){ alert('Could not post review: '+error.message); return; }
  const uni = UNIVERSITIES.find(u=>u.id===uniId);
  notifyAdmin(`TaleemPK Review — ${uni?uni.name:('Uni #'+uniId)}`, {
    type: 'Review', university: uni?uni.full:('ID '+uniId),
    rating: _rvStar+'/5', category: _rvCat||'General', review: txt, by: userDisplayName(currentUser)
  });
  const a = RATING_AGG[uniId] || (RATING_AGG[uniId]={sum:0,count:0}); a.sum+=_rvStar; a.count++;
  toggleReviewForm(uniId);
  await loadReviews(uniId);
}
async function markHelpful(uniId, rvId) {
  if(!currentUser){ openAuthModal('login'); return; }
  // Optimistic update for instant feedback
  const arr = getReviews(uniId);
  const r = arr.find(x=>x.id===rvId);
  const prev = r ? (r.helpful||0) : 0;
  if(r) r.helpful = prev + 1;
  const el = document.getElementById('rvHelpful-'+rvId);
  if(el) el.textContent = '👍 Helpful (' + (r?r.helpful:1) + ')';
  // Persist via RPC (one vote per user, idempotent)
  if(sbClient){
    try{
      const { data, error } = await sbClient.rpc('mark_helpful', { rv_id: rvId });
      if(error) throw error;
      if(r && typeof data === 'number'){ r.helpful = data; }
      if(el) el.textContent = '👍 Helpful (' + (r?r.helpful:1) + ')';
    }catch(e){
      // Roll back the optimistic update so the UI matches reality
      if(r) r.helpful = prev;
      if(el) el.textContent = '👍 Helpful' + (prev?' ('+prev+')':'');
    }
  }
}
function starsHTML(n, total=5) {
  return Array.from({length:total},(_,i)=>i<n?'⭐':'☆').join('');
}
function buildReviewsHTML(uniId) {
  const reviews = getReviews(uniId);
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;
  const cats = ['Campus Life','Faculty','Hostel','Placements','General'];
  return `
    <div class="comm-header">
      <span class="comm-title">💬 Student Reviews</span>
      <button class="comm-add-btn" onclick="toggleReviewForm(${uniId})">+ Write Review</button>
    </div>
    ${avg ? `<div class="review-avg">
      <span class="review-stars-big">${starsHTML(Math.round(avg))}</span>
      <span class="review-avg-num">${avg}</span>
      <span class="review-avg-of">/ 5 &nbsp;·&nbsp; ${reviews.length} review${reviews.length!==1?'s':''}</span>
    </div>` : ''}
    <div class="review-form" id="rvForm-${uniId}">
      <div class="star-picker" id="rvStarPicker-${uniId}">
        ${[1,2,3,4,5].map(n=>`<span onclick="rvPickStar(${n},${uniId})">⭐</span>`).join('')}
      </div>
      <div class="review-cat-row" id="rvCatRow-${uniId}">
        ${cats.map(c=>`<button class="review-cat" data-cat="${c}" onclick="rvPickCat('${c}',${uniId})">${c}</button>`).join('')}
      </div>
      <textarea id="rvTxt-${uniId}" rows="3" maxlength="2000" minlength="5" placeholder="Share your experience — campus life, faculty, hostel, placements... (5–2000 characters)"></textarea>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <button class="review-submit-btn" onclick="submitReview(${uniId})">✓ Post Review</button>
        <button class="review-submit-btn" style="background:var(--gray-200);color:var(--navy);" onclick="toggleReviewForm(${uniId})">Cancel</button>
      </div>
    </div>
    <div class="review-list">
      ${reviews.length ? reviews.slice(0,5).map(r=>`
        <div class="review-card">
          <div class="review-card-top">
            <span class="review-card-stars">${starsHTML(r.rating)}</span>
            <span class="review-card-cat">${escHTML(r.cat)}</span>
            <span class="review-card-date">${r.author?('👤 '+escHTML(r.author)+' · '):''}${escHTML(r.date)}</span>
          </div>
          <div class="review-card-text">${escHTML(r.text)}</div>
          <div class="review-helpful" id="rvHelpful-${r.id}" onclick="markHelpful(${uniId},${r.id})">👍 Helpful${r.helpful?` (${r.helpful})`:''}</div>
        </div>
      `).join('') : `<div class="review-empty"><span class="empty-icon">💬</span><div class="empty-title">No reviews yet</div><div class="empty-sub">Help future applicants — share your honest experience.</div></div>`}
    </div>
  `;
}

// ════════════════════════════════════════════════════════
//  COMMUNITY FEATURE 7 — ALUMNI CONNECT
// ════════════════════════════════════════════════════════
const AL_KEY = 'tpk_alumni_v1';
function getAlumni(uniId){ try{return (JSON.parse(localStorage.getItem(AL_KEY)||'{}'))[uniId]||[];}catch{return[];} }
function saveAlumni(uniId, arr){ try{const d=JSON.parse(localStorage.getItem(AL_KEY)||'{}'); d[uniId]=arr; localStorage.setItem(AL_KEY,JSON.stringify(d));}catch{} }

const ALUMNI_EMOJIS = ['🧑‍💻','👩‍💼','👨‍🔬','👩‍🏫','👨‍💻','🧑‍🎓','👩‍🔬','👨‍🏫','🧑‍🏭','👩‍💻'];

function toggleAlumniForm(uniId) {
  const f = document.getElementById('alForm-'+uniId);
  if(f) f.classList.toggle('open');
}
function submitAlumni(uniId) {
  const name    = (document.getElementById('alName-'+uniId).value.trim()||'Anonymous');
  const batch   = document.getElementById('alBatch-'+uniId).value.trim();
  const field   = document.getElementById('alField-'+uniId).value.trim();
  const company = document.getElementById('alCompany-'+uniId).value.trim();
  const advice  = document.getElementById('alAdvice-'+uniId).value.trim();
  if(!batch||!field){ alert('Batch and current field are required.'); return; }
  const al = { id:Date.now(), name, batch, field, company, advice,
    emoji: ALUMNI_EMOJIS[Math.floor(Math.random()*ALUMNI_EMOJIS.length)] };
  const arr = getAlumni(uniId);
  arr.unshift(al);
  saveAlumni(uniId, arr);
  toggleAlumniForm(uniId);
  document.getElementById('alSection-'+uniId).innerHTML = buildAlumniHTML(uniId);
}
function buildAlumniHTML(uniId) {
  const alumni = getAlumni(uniId);
  return `
    <div class="comm-header">
      <span class="comm-title">🎓 Alumni Connect</span>
      <button class="comm-add-btn" onclick="toggleAlumniForm(${uniId})">+ Add Yourself</button>
    </div>
    <div class="alumni-form" id="alForm-${uniId}">
      <div class="alumni-form-row">
        <input class="alumni-inp" id="alName-${uniId}" placeholder="Your name (optional)">
        <input class="alumni-inp" id="alBatch-${uniId}" placeholder="Batch e.g. 2022 *">
      </div>
      <div class="alumni-form-row">
        <input class="alumni-inp" id="alField-${uniId}" placeholder="Current field/job *">
        <input class="alumni-inp" id="alCompany-${uniId}" placeholder="Company/org (optional)">
      </div>
      <textarea class="alumni-inp" id="alAdvice-${uniId}" rows="2" placeholder="Advice for juniors... (optional)" style="resize:none;margin-bottom:10px;"></textarea>
      <div style="display:flex;gap:8px;">
        <button class="review-submit-btn" onclick="submitAlumni(${uniId})">✓ Add Profile</button>
        <button class="review-submit-btn" style="background:var(--gray-200);color:var(--navy);" onclick="toggleAlumniForm(${uniId})">Cancel</button>
      </div>
    </div>
    ${alumni.length ? `<div class="alumni-grid">
      ${alumni.slice(0,8).map(a=>`
        <div class="alumni-card">
          <div class="alumni-avatar">${escHTML(a.emoji)}</div>
          <div class="alumni-name">${escHTML(a.name)}</div>
          <div class="alumni-batch">Batch ${escHTML(a.batch)}</div>
          <div class="alumni-role">${escHTML(a.field)}${a.company?' @ '+escHTML(a.company):''}</div>
          ${a.advice?`<div class="alumni-advice">"${escHTML(a.advice)}"</div>`:''}
        </div>
      `).join('')}
    </div>` : `<div class="alumni-empty">🎓 No alumni profiles yet — be the first to add yours!</div>`}
  `;
}

// ════════════════════════════════════════════════════════
//  COMMUNITY FEATURE 8 — Q&A SECTION
// ════════════════════════════════════════════════════════
const QA_CACHE = {};   // uniId -> [questions] (each with .answers[]) from DB
function getQA(uniId){ return QA_CACHE[uniId] || []; }
function fmtQADate(d){ try{ return new Date(d).toLocaleDateString('en-PK',{month:'short',day:'numeric'}); }catch(e){ return ''; } }

async function loadQA(uniId){
  if(!sbClient) return;
  try{
    const { data, error } = await sbClient.from('questions')
      .select('id,question,author,created_at,answers(id,body,author,votes,created_at)')
      .eq('institution_id', uniId).order('created_at',{ascending:false});
    if(error) throw error;
    QA_CACHE[uniId] = (data||[]).map(q=>({
      id:q.id, q:q.question, author:q.author||'Student', date:fmtQADate(q.created_at),
      answers:(q.answers||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).map(a=>({
        id:a.id, text:a.body, author:a.author||'Student', votes:a.votes||0, date:fmtQADate(a.created_at)
      }))
    }));
    const sec=document.getElementById('qaSection-'+uniId);
    if(sec) sec.innerHTML = buildQAHTML(uniId);
  }catch(e){ /* keep cache */ }
}

function toggleQAForm(uniId) {
  const f = document.getElementById('qaAskForm-'+uniId);
  if(f) f.classList.toggle('open');
}
async function submitQuestion(uniId) {
  if(!currentUser){ openAuthModal('login'); return; }
  const txt = document.getElementById('qaInput-'+uniId).value.trim();
  if(txt.length < 5){ alert('Question must be at least 5 characters.'); return; }
  if(txt.length > 500){ alert('Question is too long (max 500 characters).'); return; }
  const { error } = await sbClient.from('questions').insert({ institution_id:uniId, question:txt, author:userDisplayName(currentUser) });
  if(error){ alert('Could not post question: '+error.message); return; }
  const uni = UNIVERSITIES.find(u=>u.id===uniId);
  notifyAdmin(`TaleemPK Q&A — ${uni?uni.name:('Uni #'+uniId)}`, {
    type: 'Question', university: uni?uni.full:('ID '+uniId), question: txt, by: userDisplayName(currentUser)
  });
  toggleQAForm(uniId);
  await loadQA(uniId);
}
function toggleQAItem(qId) {
  const el = document.getElementById('qaItem-'+qId);
  if(el) el.classList.toggle('open');
}
async function submitAnswer(uniId, qId) {
  if(!currentUser){ openAuthModal('login'); return; }
  const txt = document.getElementById('qaAnsTxt-'+qId).value.trim();
  if(txt.length < 2){ alert('Please write your answer first.'); return; }
  if(txt.length > 2000){ alert('Answer is too long (max 2000 characters).'); return; }
  const { error } = await sbClient.from('answers').insert({ question_id:qId, body:txt, author:userDisplayName(currentUser) });
  if(error){ alert('Could not post answer: '+error.message); return; }
  await loadQA(uniId);
  const it=document.getElementById('qaItem-'+qId); if(it) it.classList.add('open');
}
async function voteAnswer(uniId, qId, ansId) {
  if(!currentUser){ openAuthModal('login'); return; }
  // Optimistic update
  const q = getQA(uniId).find(x=>x.id===qId);
  const ans = q && q.answers.find(a=>a.id===ansId);
  const prev = ans ? (ans.votes||0) : 0;
  if(ans){ ans.votes = prev + 1; }
  const el = document.getElementById('qaVote-'+ansId);
  if(el) el.textContent = '▲ ' + (ans?ans.votes:1);
  // Persist via RPC
  if(sbClient){
    try{
      const { data, error } = await sbClient.rpc('vote_answer', { ans_id: ansId });
      if(error) throw error;
      if(ans && typeof data === 'number'){ ans.votes = data; }
      if(el) el.textContent = '▲ ' + (ans?ans.votes:1);
    }catch(e){
      // Roll back if RPC failed
      if(ans) ans.votes = prev;
      if(el) el.textContent = '▲ ' + prev;
    }
  }
}
function buildQAHTML(uniId) {
  const questions = getQA(uniId);
  return `
    <div class="comm-header">
      <span class="comm-title">❓ Q&amp;A</span>
      <button class="comm-add-btn" onclick="toggleQAForm(${uniId})">+ Ask Question</button>
    </div>
    <div class="qa-ask-form" id="qaAskForm-${uniId}">
      <input id="qaInput-${uniId}" maxlength="500" minlength="5" placeholder="Type your question... e.g. Does NUST offer lateral entry? (5–500 chars)">
      <div style="margin-top:8px;display:flex;gap:8px;">
        <button class="review-submit-btn" onclick="submitQuestion(${uniId})">✓ Post Question</button>
        <button class="review-submit-btn" style="background:var(--gray-200);color:var(--navy);" onclick="toggleQAForm(${uniId})">Cancel</button>
      </div>
    </div>
    <div class="qa-list">
      ${questions.length ? questions.map(q=>`
        <div class="qa-item" id="qaItem-${q.id}">
          <div class="qa-question" onclick="toggleQAItem(${q.id})">
            <span style="color:var(--green);font-weight:800;font-size:1rem;margin-top:1px;">Q</span>
            <span class="qa-q-text">${escHTML(q.q)}<br><small style="color:var(--gray-400);font-weight:400;">👤 ${escHTML(q.author||'Student')} · ${escHTML(q.date)}</small></span>
            <div class="qa-meta">
              <span class="qa-ans-count">${q.answers.length} ans</span>
              <span class="qa-expand-icon">▾</span>
            </div>
          </div>
          <div class="qa-answers">
            ${q.answers.length ? q.answers.map(a=>`
              <div class="qa-answer">
                ${escHTML(a.text)}
                <div class="qa-answer-meta">
                  <span>${a.author?('👤 '+escHTML(a.author)+' · '):''}${escHTML(a.date)}</span>
                  <button class="qa-vote-btn" id="qaVote-${a.id}" onclick="voteAnswer(${uniId},${q.id},${a.id})">▲ ${a.votes||0}</button>
                </div>
              </div>
            `).join('') : `<div style="padding:10px 0;font-size:0.79rem;color:var(--gray-400);">No answers yet — be the first to respond!</div>`}
            <div class="qa-answer-form">
              <textarea id="qaAnsTxt-${q.id}" rows="2" maxlength="2000" minlength="2" placeholder="Write your answer... (max 2000 chars)"></textarea>
              <button class="qa-post-ans-btn" onclick="submitAnswer(${uniId},${q.id})">✓ Post Answer</button>
            </div>
          </div>
        </div>
      `).join('') : `<div class="qa-empty"><span class="empty-icon">🙋</span><div class="empty-title">No questions yet</div><div class="empty-sub">Ask anything — admissions, hostels, campus life.</div></div>`}
    </div>
  `;
}

// Multi-campus cities: show main city + count instead of a truncated slash-list
function cityShort(city){
  const parts = String(city||'').split('/').map(s=>s.trim()).filter(Boolean);
  if(parts.length <= 1) return city||'';
  return `${parts[0]} +${parts.length-1} campuses`;
}

function cardRating(uniId){
  const a = RATING_AGG[uniId];
  // No reviews → render nothing; empty grey stars on 260+ cards made the site look deserted
  if(!a || !a.count){ return ''; }
  const avg = a.sum/a.count;
  const rounded = Math.round(avg);
  const stars = '★★★★★'.slice(0,rounded) + '☆☆☆☆☆'.slice(0,5-rounded);
  return `<div class="card-rating"><span class="cr-stars filled">${stars}</span><span class="cr-num">${avg.toFixed(1)}</span><span class="cr-count">(${a.count})</span></div>`;
}

function renderCards(unis) {
  filteredCache = unis;
  const total = unis.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if(currentPage > totalPages) currentPage = totalPages;
  // "Load More" model: render cumulative 1..currentPage*PAGE_SIZE
  const end = currentPage * PAGE_SIZE;
  const pageUnis = unis.slice(0, end);

  const grid = document.getElementById('uniGrid');
  const count = document.getElementById('resultsCount');
  count.innerHTML = `Showing <span>${total}</span> universities`;

  if(total===0){
    grid.innerHTML = `<div class="grid-error">
      <div style="width:60px;height:60px;margin:0 auto 14px;background:#F5F7FA;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#9BA5B5;">${icon('search',{size:28})}</div>
      <h3>No universities match your filters</h3>
      <p>Try a different combination, or clear the filters to see all 270 universities.</p>
      <button onclick="clearAllFilters()">Clear Filters</button>
    </div>`;
    document.getElementById('pagination').innerHTML='';
    return;
  }

  grid.innerHTML = pageUnis.map(u => {
    const matchBadge = (() => {
      if(!assessMode || !assessData) return '';
      const surplus = assessData.pct - (u.meritMin||50);
      const m = getMatchLabel(surplus);
      return `<div class="match-badge ${m.cls}">${m.label}</div>`;
    })();
    return `
    <div class="uni-card fade-in ${u.rank && u.rank<=3 ? 'is-top3':''} ${compareList.find(c=>c.id===u.id)?'selected':''}" id="card-${u.id}" style="position:relative;cursor:pointer" onclick="openDetail(${u.id})">
      ${matchBadge}
      <div class="uni-card-top" style="${assessMode?'margin-top:28px':''}">
        <div class="uni-icon">${u.website ? `<img src="${escHTML(logoSrc(u))}" alt="${escHTML(u.name)}" loading="lazy" onload="checkLogoSize(this,'${escHTML(u.icon||'').replace(/'/g,'')}')" onerror="handleLogoError(this,'${escHTML(u.website||'').replace(/'/g,'')}','${escHTML(u.icon||'').replace(/'/g,'')}')">` : escHTML(u.icon||'')}</div>
        ${u.basic&&!DATA_UPDATES[u.id]?`<div class="uni-rank" style="background:rgba(0,200,83,0.12);color:var(--green);font-size:0.6rem;padding:3px 7px;">HEC ✓</div>`:
        u.rank?`<div class="uni-rank ${u.rank<=3?'top3':''}">${u.rank<=3?icon('trophy',{size:12})+' ':''}#${u.rank}</div>`:''}
      </div>
      <div class="uni-name">${escHTML(u.name)}</div>
      <div class="uni-location" title="${escHTML(u.city)}"><span class="uni-loc-text">${escHTML(cityShort(u.city))}</span></div>
      ${cardRating(u.id)}
      <div class="uni-tags">
        <span class="tag ${u.type}"><span data-icon="${u.type==='public'?'building2':'briefcase'}" data-size="12"></span>${u.type==='public'?t('tag_public'):t('tag_private')}</span>
        ${u.tags.filter(tg=>tg!=='public'&&tg!=='private'&&!['federal','punjab','sindh','kpk','balochistan','ajk','gilgitbaltistan'].includes(tg)).map(tg=>`<span class="tag ${tg}">${tg}</span>`).join('')}
      </div>
      <div class="uni-info">
        <div class="info-item">
          <div class="info-key">${t('fee_label')}</div>
          <div class="info-val">${u.fee}</div>
        </div>
        <div class="info-item">
          <div class="info-key">${t('merit_label')}</div>
          <div class="info-val">${u.entry}</div>
        </div>
      </div>
      <div class="uni-card-footer">
        <button class="btn-compare" onclick="toggleCompare(${u.id}, event);event.stopPropagation()">
          ${compareList.find(c=>c.id===u.id)?t('btn_added'):t('btn_compare')}
        </button>
        <button class="btn-details" onclick="openDetail(${u.id});event.stopPropagation()">${t('btn_details')}</button>
        <button class="btn-save ${isInShortlist(u.id)?'saved':''}" id="sl-btn-${u.id}" onclick="toggleShortlist(${u.id},event);event.stopPropagation()" title="Save to shortlist">${isInShortlist(u.id)?'❤️':'🤍'}</button>
      </div>
    </div>
  `;}).join('');

  renderPagination(totalPages);

  // Convert any new data-icon spans inside the freshly-rendered cards
  if (typeof hydrateIcons === 'function') hydrateIcons(grid);

  setTimeout(()=>{
    document.querySelectorAll('.fade-in').forEach((el,i)=>{
      setTimeout(()=>el.classList.add('visible'), i*40);
    });
  },50);
}

function renderPagination(totalPages) {
  // "Load More" button replaces page-numbers pagination
  const pg = document.getElementById('pagination');
  if(!pg) return;
  const shown = Math.min(currentPage*PAGE_SIZE, filteredCache.length);
  const total = filteredCache.length;
  if(shown >= total){
    pg.innerHTML = total ? `<span class="page-info">Showing all ${total} universities</span>` : '';
    return;
  }
  const remaining = total - shown;
  pg.innerHTML = `
    <button class="page-btn loadmore" onclick="loadMore()">Load ${Math.min(PAGE_SIZE, remaining)} More</button>
    <span class="page-info">Showing ${shown} of ${total}</span>`;
}
function loadMore(){
  currentPage++;
  renderCards(filteredCache);
}

function goToPage(n) {
  const totalPages = Math.ceil(filteredCache.length / PAGE_SIZE);
  if(n < 1 || n > totalPages) return;
  currentPage = n;
  renderCards(filteredCache);
  document.getElementById('universities').scrollIntoView({behavior:'smooth'});
}

function filterUnis(type, btn) {
  closeOtherTools();          // close any open tool panel (map/calendar/fee)
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  currentFilter = type;
  currentPage = 1;
  applyFilters();
}

function searchHero(doScroll) {
  closeOtherTools();          // close any open tool panel (map/calendar/fee)
  searchQuery = document.getElementById('heroSearch').value.toLowerCase();
  currentFilter = 'all';
  currentPage = 1;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.filter-btn').classList.add('active');
  applyFilters();
  // Only scroll when button clicked or Enter pressed — NOT on every keystroke
  if(doScroll && searchQuery) document.getElementById('universities').scrollIntoView({behavior:'smooth'});
}

// ── Live search + autocomplete suggestions ──
function onSearchInput(value){
  searchHero(false);           // live-filter the grid
  renderSuggestions(value);    // show matching universities + programs
}

function renderSuggestions(value){
  const box = document.getElementById('searchSuggestions');
  if(!box) return;
  const q = (value||'').trim().toLowerCase();
  if(q.length < 1){ hideSuggestions(); return; }

  // Matching universities (by name / full name)
  const unis = UNIVERSITIES
    .filter(u => u.name.toLowerCase().includes(q) || u.full.toLowerCase().includes(q))
    .slice(0, 6);

  // Broad category matches (apply the program filter)
  const cats = PROGRAM_FILTERS.filter(p => {
    const words = (p.label + ' ' + p.terms.join(' ')).toLowerCase().split(/[\s/()&,.-]+/);
    return words.some(w => w && w.startsWith(q));
  }).slice(0, 3);
  const catLabels = new Set(cats.map(c=>c.label.toLowerCase()));

  // Actual program names from the data (covers every program any university lists)
  const progNames = PROGRAM_INDEX
    .filter(p => p.toLowerCase().includes(q) && !catLabels.has(p.toLowerCase()))
    .slice(0, 5);

  if(!unis.length && !cats.length && !progNames.length){
    box.innerHTML = `<div class="sug-empty">No matches for “${escHTML(value)}”. Press Search to see all results.</div>`;
    box.classList.add('show');
    return;
  }

  const esc = s => String(s).replace(/`/g,"'").replace(/"/g,'&quot;');
  let html = '';
  unis.forEach(u => {
    // Renamed local var to avoid shadowing the global icon() helper
    const safeIcon = escHTML(u.icon || '').replace(/'/g, '');
    const safeWebsite = escHTML(u.website || '').replace(/'/g, '');
    const sugIcon = u.website
      ? `<img src="${escHTML(logoSrc(u))}" alt="" loading="lazy" onload="checkLogoSize(this,'${safeIcon}')" onerror="handleLogoError(this,'${safeWebsite}','${safeIcon}')">`
      : (safeIcon || '');
    html += `<div class="sug-item" onmousedown="selectSuggestion('uni',${u.id})">
      <span class="sug-icon">${sugIcon}</span>
      <span class="sug-text"><div class="sug-title">${escHTML(u.name)} — ${escHTML(u.full)}</div><div class="sug-sub">${escHTML(u.city)} · ${u.type==='public'?'Public':'Private'}</div></span>
      <span class="sug-type">University</span>
    </div>`;
  });
  cats.forEach(p => {
    html += `<div class="sug-item" onmousedown="selectSuggestion('program',\`${esc(p.label)}\`)">
      <span class="sug-icon">${icon('bookOpen',{size:14})}</span>
      <span class="sug-text"><div class="sug-title">${escHTML(p.label)}</div><div class="sug-sub">Browse universities offering this</div></span>
      <span class="sug-type">Program</span>
    </div>`;
  });
  progNames.forEach(p => {
    html += `<div class="sug-item" onmousedown="selectSuggestion('search',\`${esc(p)}\`)">
      <span class="sug-icon">📘</span>
      <span class="sug-text"><div class="sug-title">${p}</div><div class="sug-sub">Search universities offering this</div></span>
      <span class="sug-type">Program</span>
    </div>`;
  });
  box.innerHTML = html;
  box.classList.add('show');
}

function hideSuggestions(){
  const box = document.getElementById('searchSuggestions');
  if(box) box.classList.remove('show');
}

function selectSuggestion(type, val){
  hideSuggestions();
  if(type === 'uni'){
    openDetail(val);
  } else if(type === 'program'){
    // Broad category → apply the program filter
    const input = document.getElementById('heroSearch');
    if(input) input.value = '';
    searchQuery = '';
    const sel = document.getElementById('programFilter');
    if(sel){ sel.value = val; }
    filterByProgram(val);
    document.getElementById('universities').scrollIntoView({behavior:'smooth'});
  } else if(type === 'search'){
    // Specific program name → text search
    const sel = document.getElementById('programFilter');
    if(sel){ sel.value = ''; } currentProgram = '';
    const input = document.getElementById('heroSearch');
    if(input) input.value = val;
    searchHero(true);
  }
}

// Hide suggestions when clicking outside the search
document.addEventListener('click', function(e){
  const wrap = document.querySelector('.hero-search-wrap');
  if(wrap && !wrap.contains(e.target)) hideSuggestions();
});

function applyFilters() {
  let filtered = UNIVERSITIES;
  if(currentFilter !== 'all') {
    filtered = filtered.filter(u=>
      u.type===currentFilter ||
      u.tags.includes(currentFilter) ||
      (u.province && u.province.toLowerCase().replace(/[\s/-]/g,'')===currentFilter)
    );
  }
  if(searchQuery) {
    // Aliases: map what users type → what's stored in programs/tags
    const ALIASES = {
      'computer science':['cs','bscs','bs cs','computing','software','it'],
      'software engineering':['software','bsse','se','cs','computing'],
      'information technology':['it','bsit','bs it','cs','computing'],
      'electrical engineering':['electrical','bsee','ee','electronics','telecom'],
      'mechanical engineering':['mechanical','bsme','me','mechatronics'],
      'civil engineering':['civil','bsce','ce','construction'],
      'chemical engineering':['chemical','bsche','chem engg'],
      'medicine':['mbbs','medicine','medical','doctor'],
      'mbbs':['mbbs','medicine','medical'],
      'doctor':['mbbs','medicine','medical'],
      'business administration':['bba','mba','business','management','commerce'],
      'business':['bba','mba','business','management','commerce','accounting'],
      'law':['llb','law','legal','jurisprudence'],
      'pharmacy':['pharmacy','pharma','pharm','d.pharm'],
      'architecture':['architecture','arch','design'],
      'mathematics':['math','maths','mathematics','statistics'],
      'artificial intelligence':['ai','artificial intelligence','machine learning','data science'],
      'data science':['data science','data','analytics','ai','machine learning'],
      'economics':['economics','eco','econom'],
      'accounting':['accounting','acca','finance','bsaf'],
      'finance':['finance','accounting','bba','mba'],
      'psychology':['psychology','psych','behavioural'],
      'english':['english','literature','linguistics'],
      'physics':['physics','physical sciences'],
      'biology':['biology','bio','biosciences','life sciences'],
      'chemistry':['chemistry','chem','biochem'],
      'nursing':['nursing','nurse','midwifery'],
      'dentistry':['dentistry','bds','dental'],
      'agriculture':['agriculture','agri','food science'],
      'media':['media','journalism','mass comm','communication'],
      'fashion':['fashion','design','textile'],
      'islamic':['islamic','sharia','religious'],
    };

    // Build alias terms if query matches any key
    const aliasTerms = [];
    Object.entries(ALIASES).forEach(([key, vals]) => {
      if(key.includes(searchQuery) || searchQuery.includes(key)) {
        vals.forEach(v => aliasTerms.push(v));
      }
    });

    filtered = filtered.filter(u => {
      const q = searchQuery;
      // Direct: name, full name, city, province, type, tags
      if(u.name.toLowerCase().includes(q)) return true;
      if(u.full.toLowerCase().includes(q)) return true;
      if(u.city.toLowerCase().includes(q)) return true;
      if((u.province||'').toLowerCase().includes(q)) return true;
      if((u.type||'').toLowerCase().includes(q)) return true;
      if(u.tags.some(t=>t.toLowerCase().includes(q))) return true;
      // Direct program name match
      if(u.programs.some(p=>p.toLowerCase().includes(q))) return true;
      // Alias-based program match
      if(aliasTerms.length && u.programs.some(p=>aliasTerms.some(a=>p.toLowerCase().includes(a)))) return true;
      // Alias-based tag match
      if(aliasTerms.length && u.tags.some(t=>aliasTerms.some(a=>t.toLowerCase().includes(a)))) return true;
      return false;
    });
  }
  if(currentCity){
    filtered = filtered.filter(u => (u.city||'').toLowerCase().includes(currentCity.toLowerCase()));
  }
  if(currentProgram){
    const opt = PROGRAM_FILTERS.find(p => p.label === currentProgram);
    if(opt){
      filtered = filtered.filter(u => {
        const progs = (u.programs||[]).map(p=>p.toLowerCase());
        const tags  = (u.tags||[]).map(t=>t.toLowerCase());
        return opt.terms.some(term =>
          progs.some(p=>p.includes(term)) || tags.some(t=>t.includes(term))
        );
      });
    }
  }
  if(currentScholarship){
    filtered = filtered.filter(u => {
      const s = (u.scholarships||'').toLowerCase();
      if(currentScholarship==='need-blind') return s.includes('need-blind') || s.includes('need blind') || s.includes('no full fee');
      if(currentScholarship==='need-based') return s.includes('need');
      if(currentScholarship==='merit')      return s.includes('merit');
      if(currentScholarship==='any')        return s && !/contact|^—$/.test(s);
      return true;
    });
  }
  if(_slActive){ const sl=getShortlist(); filtered=filtered.filter(u=>sl.includes(u.id)); }
  // Sorting
  if(currentSort && currentSort!=='default'){
    filtered = filtered.slice().sort((a,b)=>{
      switch(currentSort){
        case 'fee-asc':  return (a.feeNum||Infinity) - (b.feeNum||Infinity);
        case 'fee-desc': return (b.feeNum||0) - (a.feeNum||0);
        case 'name':     return a.name.localeCompare(b.name);
        case 'merit-desc': return (b.meritMin||0) - (a.meritMin||0);
        case 'rank':     return (a.rank||9999) - (b.rank||9999);
        default: return 0;
      }
    });
  }
  renderCards(filtered);
  if(typeof updateClearBtn==='function') updateClearBtn();
}

function filterByScholarship(value){
  closeOtherTools();
  currentScholarship = value || '';
  currentPage = 1;
  const sel = document.getElementById('scholarshipFilter');
  if(sel) sel.setAttribute('data-active', currentScholarship ? '1' : '0');
  applyFilters();
}

function sortUnis(value){
  currentSort = value || 'default';
  currentPage = 1;
  const sel = document.getElementById('sortFilter');
  if(sel) sel.setAttribute('data-active', currentSort!=='default' ? '1' : '0');
  applyFilters();
}

function filterByProgram(value){
  closeOtherTools();
  currentProgram = value || '';
  currentPage = 1;
  const sel = document.getElementById('programFilter');
  if(sel) sel.setAttribute('data-active', currentProgram ? '1' : '0');
  applyFilters();
}

function populateProgramFilter(){
  const sel = document.getElementById('programFilter');
  if(!sel) return;
  sel.innerHTML = '<option value="">All Programs</option>' +
    PROGRAM_FILTERS.map(p=>`<option value="${p.label}">${p.label}</option>`).join('');
}

function clearAllFilters(){
  closeOtherTools();
  currentFilter='all'; currentCity=''; currentProgram=''; currentScholarship=''; currentSort='default'; searchQuery='';
  const heroSearch=document.getElementById('heroSearch'); if(heroSearch) heroSearch.value='';
  ['cityFilter','programFilter','scholarshipFilter','sortFilter'].forEach(id=>{
    const sel=document.getElementById(id);
    if(sel){ sel.value = (id==='sortFilter')?'default':''; sel.setAttribute('data-active','0'); }
  });
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  const firstBtn=document.querySelector('.filter-btn'); if(firstBtn) firstBtn.classList.add('active');
  currentPage=1;
  applyFilters();
  updateClearBtn();
  hideSuggestions();
}
function updateClearBtn(){
  const active = currentFilter!=='all' || currentCity || currentProgram || currentScholarship || currentSort!=='default' || searchQuery;
  const btn=document.getElementById('clearFiltersBtn');
  if(btn) btn.classList.toggle('show', !!active);
}

function filterByCity(value){
  closeOtherTools();          // close any open tool panel (map/calendar/fee)
  currentCity = value || '';
  currentPage = 1;
  const sel = document.getElementById('cityFilter');
  if(sel) sel.setAttribute('data-active', currentCity ? '1' : '0');
  applyFilters();
}

function populateCityFilter(){
  const sel = document.getElementById('cityFilter');
  if(!sel) return;
  // Split combined cities (e.g. "Karachi/Islamabad") and collect unique names
  const set = new Set();
  UNIVERSITIES.forEach(u=>{
    (u.city||'').split(/[\/,]|\+/).forEach(c=>{
      const n=c.trim();
      // skip blanks, online-only, and junk multi-campus labels (e.g. "5 cities", "others")
      if(n && n!=='Online' && !/\d|cities|others|campus|multiple/i.test(n)) set.add(n);
    });
  });
  const cities = [...set].sort((a,b)=>a.localeCompare(b));
  sel.innerHTML = '<option value="">All Cities</option>' +
    cities.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function toggleCompare(id, e) {
  e.stopPropagation();
  const uni = UNIVERSITIES.find(u=>u.id===id);
  const idx = compareList.findIndex(c=>c.id===id);
  if(idx > -1) {
    compareList.splice(idx,1);
  } else {
    if(compareList.length >= 3) {
      alert(t('alert_max'));
      return;
    }
    compareList.push(uni);
  }
  updateCompareBar();
  applyFilters();
}

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  const chips = document.getElementById('compareChips');
  if (!bar || !chips) return;
  chips.innerHTML = compareList.map(u=>`
    <div class="compare-chip">
      ${escHTML(u.icon || '')} ${escHTML(u.name)}
      <button onclick="removeFromCompare(${u.id})" aria-label="Remove">×</button>
    </div>
  `).join('');
  bar.classList.toggle('show', compareList.length > 0);
}

function removeFromCompare(id) {
  compareList = compareList.filter(c=>c.id!==id);
  updateCompareBar();
  applyFilters();
}

function progGroup(p){
  const s = (p||'').trim();
  // PhD / Doctorate — match anywhere a clear PhD prefix appears (handles
  // "PhD Mathematics", "Doctor of Philosophy", "PhD/Doctoral Studies", "DPhil ...")
  if (/^(phd|d\.?phil|doctor(ate)? of (philosophy|engineering)|mphil\/phd)\b/i.test(s)) return 'phd';
  // Graduate degrees — strict prefix match, common abbreviations
  if (/^(ms|m\.s|mba|emba|mphil|m\.phil|ma|m\.a|msc|m\.sc|master|pgd|postgraduate diploma|llm)\b/i.test(s)) return 'grad';
  return 'ug';
}
function groupedProgramsHTML(programs){
  if(!programs || !programs.length)
    return `<span style="color:var(--gray-400);font-size:0.85rem;">Visit the university website for a full program list.</span>`;
  const g = {ug:[], grad:[], phd:[]};
  programs.forEach(p => g[progGroup(p)].push(p));
  const sec = (title, arr) => arr.length
    ? `<div class="prog-group"><div class="prog-group-title">${title} <span class="prog-count">${arr.length}</span></div>
        <div class="programs-list">${arr.map(p=>`<span class="program-pill">${p}</span>`).join('')}</div></div>`
    : '';
  return sec('Undergraduate', g.ug) + sec('Graduate (MS / MBA)', g.grad) + sec('PhD', g.phd);
}

function openDetail(id) {
  // Track recently viewed (kept locally, max 8 entries, deduped)
  try{
    const k='tpk_recent_v1';
    let list = JSON.parse(localStorage.getItem(k)||'[]');
    list = [id, ...list.filter(x=>x!==id)].slice(0,8);
    localStorage.setItem(k, JSON.stringify(list));
  }catch(e){}
  // Save filter/scroll state so back-navigation restores where the user was
  try{
    sessionStorage.setItem('tpk_back_state', JSON.stringify({
      filter: currentFilter, city: currentCity, program: currentProgram,
      scholarship: currentScholarship, sort: currentSort,
      query: searchQuery, page: currentPage, scrollY: window.scrollY
    }));
  }catch(e){}
  // Canonical detail view is the dedicated university page.
  const _u = (window.INSTITUTIONS||[]).find(x=>x.id===id);
  window.location.href = _u ? '/university/'+(_u.name||'').toLowerCase().replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') : 'university.html?id='+id;
  return;
  /* ---- legacy modal (kept for reference, no longer used) ---- */
  const u = UNIVERSITIES.find(u=>u.id===id);
  const modal = document.getElementById('detailModal');
  // Pre-escape DB fields once for safe template interpolation
  const safeName = escHTML(u.name);
  const safeFull = escHTML(u.full);
  const safeCity = escHTML(u.city);
  const safeIcon = escHTML(u.icon || '').replace(/'/g, '');
  const safeWebsite = escHTML(u.website || '').replace(/'/g, '');
  const safeDescription = escHTML(u.description || '');
  modal.innerHTML = `
    <button class="modal-close" onclick="closeDetailModal()" aria-label="Close">×</button>
    <div class="detail-hero">
      <div class="detail-icon">${u.website ? `<img src="${escHTML(logoSrc(u))}" alt="${safeFull}" onload="checkLogoSize(this,'${safeIcon}')" onerror="handleLogoError(this,'${safeWebsite}','${safeIcon}')">` : safeIcon}</div>
      <div>
        <div class="detail-title">${safeFull}</div>
        <div class="detail-loc">${icon('mapPin',{size:14})} ${safeCity} &nbsp;·&nbsp; ${t('detail_est')} ${escHTML(u.established || '')}</div>
        <div class="uni-tags">${(u.tags||[]).map(tg=>`<span class="tag ${escHTML(tg).replace(/[^a-z0-9-]/gi,'')}">${escHTML(tg)}</span>`).join('')}</div>
      </div>
    </div>
    <p style="color:var(--gray-600);line-height:1.7;margin-bottom:24px;">${safeDescription}</p>
    <div class="detail-grid">
      <div class="detail-box"><div class="detail-box-title">${t('detail_fee')}</div><div class="detail-box-val">${u.fee}</div></div>
      <div class="detail-box"><div class="detail-box-title">${t('detail_entry')}</div><div class="detail-box-val">${u.entry}</div></div>
      <div class="detail-box"><div class="detail-box-title">${t('detail_merit')}</div><div class="detail-box-val">${u.merit}</div></div>
      <div class="detail-box"><div class="detail-box-title">${t('detail_seats')}</div><div class="detail-box-val">${u.seats}</div></div>
      <div class="detail-box"><div class="detail-box-title">${t('detail_scholarships')}</div><div class="detail-box-val" style="font-size:0.85rem">${u.scholarships}</div></div>
      <div class="detail-box"><div class="detail-box-title">${t('detail_hostel')}</div><div class="detail-box-val" style="font-size:0.85rem">${u.hostel}</div></div>
    </div>
    ${u.feeDetails && u.feeDetails.length ? `
    <div class="fee-table-section">
      <div class="detail-box-title" style="margin-bottom:12px;">💰 Detailed Fee Structure ${u.feeYear?`<span style="font-weight:400;color:var(--gray-400);font-size:0.78rem;">(${u.feeYear})</span>`:''}</div>
      <div class="fee-table">
        ${u.feeDetails.map(f=>`<div class="fee-row"><div class="fee-row-k">${f.label}</div><div class="fee-row-v">${f.value}</div></div>`).join('')}
      </div>
      ${u.feeNote?`<p class="fee-table-note">${u.feeNote}</p>`:''}
    </div>` : ''}
    <div style="margin-bottom:20px;">
      <div class="detail-box-title" style="margin-bottom:12px;">${t('detail_programs')}</div>
      ${groupedProgramsHTML(u.programs)}
    </div>
    <div>
      <div class="detail-box-title" style="margin-bottom:12px;">${t('detail_highlights')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${u.highlights.map(h=>`<span style="background:var(--navy);color:var(--white);padding:5px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;">${h}</span>`).join('')}
      </div>
    </div>
    <div class="merit-community-section">
      <div class="merit-community-header">
        <span class="merit-community-title">📊 Last Year's Closing Merit <span style="font-weight:400;color:var(--gray-400);font-size:0.78rem;">(Community Verified)</span></span>
        ${VERIFIED_MERIT[u.id] ? `<span class="merit-verified-tag">✅ Verified ${VERIFIED_MERIT[u.id].year}</span>` : ''}
        <button class="merit-submit-btn" onclick="openMeritSubmit(${u.id})">+ Submit Data</button>
      </div>
      ${VERIFIED_MERIT[u.id] ? renderVerifiedMerit(u.id) : `<p class="no-merit-msg">📭 No community data yet — be the first to share last year's merit list!</p>`}
    </div>
    ${MERIT_TRENDS[u.id] ? `<div class="trend-section"><div class="trend-title">📈 Merit Trend (Last 3 Years)</div><div class="trend-wrap"><canvas id="trend-${u.id}" height="120"></canvas></div></div>` : ''}
    <div class="comm-section" id="rvSection-${u.id}">${buildReviewsHTML(u.id)}</div>
    <div class="comm-section" id="alSection-${u.id}">${buildAlumniHTML(u.id)}</div>
    <div class="comm-section" id="qaSection-${u.id}">${buildQAHTML(u.id)}</div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--gray-200);text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      ${u.website?`<a href="https://www.${u.website}" target="_blank" style="background:var(--green);color:var(--navy);padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.9rem;">${t('detail_website_btn')}</a>`:`<span style="color:var(--gray-400);font-size:0.85rem;">🔗 Website coming soon — check HEC portal for details</span>`}
      <button onclick="shareUniversity(${u.id})" style="background:#25D366;color:#fff;padding:12px 22px;border:none;border-radius:10px;font-weight:700;font-size:0.9rem;cursor:pointer;">📤 Share on WhatsApp</button>
    </div>
  `;
  document.getElementById('detailModalOverlay').classList.add('show');
  if(MERIT_TRENDS[u.id]) setTimeout(()=>renderTrendChart(u.id), 100);
  loadReviews(u.id);   // fetch shared reviews from the database
  loadQA(u.id);        // fetch shared Q&A from the database
  try{ history.replaceState(null,'','#uni-'+id); }catch(e){}   // shareable URL
}

function shareUniversity(id){
  const u = UNIVERSITIES.find(x=>x.id===id);
  if(!u) return;
  const slug = (u.name||'').toLowerCase().replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const url = window.location.origin + '/university/' + slug;
  const fee = u.fee ? ` | Fee: ${u.fee}` : '';
  const city = u.city ? ` | ${u.city}` : '';
  const text = `🎓 *${u.full}*${city}${fee}\n\nDetails, merit list & programs 👇\n${url}\n\n_via TaleemPK — Pakistan's University Guide_`;
  if(navigator.share){
    navigator.share({ title: u.full, text: u.full + city + fee, url }).catch(()=>{
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    });
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }
}

function closeDetailModal(e) {
  if(!e || e.target.id==='detailModalOverlay' || e.target.classList.contains('modal-close')) {
    document.getElementById('detailModalOverlay').classList.remove('show');
    try{ history.replaceState(null,'',location.pathname+location.search); }catch(err){}
  }
}

// ════════════════════════════════════════════
//  COMPARE MODE v2 — beautiful side-by-side with winner highlights
// ════════════════════════════════════════════
function _meritNum(m){
  if(!m) return null;
  const nums = String(m).match(/(\d+(?:\.\d+)?)/g);
  if(!nums) return null;
  return Math.max(...nums.map(Number)); // higher merit = harder = better signal
}
function _seatsNum(s){
  if(!s) return null;
  const nums = String(s).match(/(\d+(?:,\d+)?)/g);
  if(!nums) return null;
  return parseInt(nums[0].replace(/,/g,''));
}

function openCompareModal() {
  if(compareList.length < 2) { alert(t('alert_min')); return; }
  const list = compareList;
  const modal = document.getElementById('compareModal');

  // Compute winners per metric
  const fees    = list.map(u=>u.feeNum||0).filter(x=>x>0);
  const minFee  = fees.length ? Math.min(...fees) : null;
  const ests    = list.map(u=>parseInt(u.established)||0).filter(x=>x>0);
  const oldest  = ests.length ? Math.min(...ests) : null;
  const merits  = list.map(u=>_meritNum(u.merit)).filter(x=>x!==null);
  const topMerit= merits.length ? Math.max(...merits) : null;
  const seats   = list.map(u=>_seatsNum(u.seats)).filter(x=>x!==null);
  const maxSeat = seats.length ? Math.max(...seats) : null;

  // Overall score: who wins most categories?
  const scores = list.map(u=>{
    let s=0;
    if(minFee!==null && u.feeNum===minFee) s++;
    if(oldest!==null && parseInt(u.established)===oldest) s++;
    if(topMerit!==null && _meritNum(u.merit)===topMerit) s++;
    if(maxSeat!==null && _seatsNum(u.seats)===maxSeat) s++;
    return s;
  });
  const maxScore = Math.max(...scores);
  const overallWinnerIdx = scores.indexOf(maxScore);

  // Group rows into categories
  const cats = [
    {
      title: icon('building2',{size:18,cls:'tpk-ic-green'}) + ' Overview',
      rows: [
        { label:'Full Name',       vals: list.map(u=>u.full || u.name) },
        { label:'City',            vals: list.map(u=>`<span style="display:inline-flex;align-items:center;gap:4px;">${icon('mapPin',{size:14})} ${u.city||'—'}</span>`) },
        { label:'Type',            vals: list.map(u=>u.type==='public'? `<span style="display:inline-flex;align-items:center;gap:4px;color:#1565C0;">${icon('building2',{size:14})} Public</span>` : `<span style="display:inline-flex;align-items:center;gap:4px;color:#C62828;">${icon('briefcase',{size:14})} Private</span>`) },
        { label:'Established',     vals: list.map(u=>u.established||'—'), winnerIdx: oldest!==null ? list.findIndex(u=>parseInt(u.established)===oldest) : -1, winnerLabel:'Oldest' },
      ]
    },
    {
      title: icon('dollarSign',{size:18,cls:'tpk-ic-green'}) + ' Cost',
      rows: [
        { label:'Fee per Semester', vals: list.map(u=>u.fee||'—'), winnerIdx: minFee!==null ? list.findIndex(u=>u.feeNum===minFee) : -1, winnerLabel:'Cheapest', bars: list.map(u=>u.feeNum||0), barLowerBetter:true },
        { label:'Scholarships',     vals: list.map(u=>u.scholarships||'—') },
        { label:'Hostel',           vals: list.map(u=>u.hostel||'—') },
      ]
    },
    {
      title: icon('scroll',{size:18,cls:'tpk-ic-green'}) + ' Admission',
      rows: [
        { label:'Entry Test',  vals: list.map(u=>u.entry||'—') },
        { label:'Merit / Cutoff', vals: list.map(u=>u.merit||'—'), winnerIdx: topMerit!==null ? list.findIndex(u=>_meritNum(u.merit)===topMerit) : -1, winnerLabel:'Most Competitive' },
        { label:'Total Seats', vals: list.map(u=>u.seats||'—'), winnerIdx: maxSeat!==null ? list.findIndex(u=>_seatsNum(u.seats)===maxSeat) : -1, winnerLabel:'Most Seats' },
      ]
    },
    {
      title: icon('bookOpen',{size:18,cls:'tpk-ic-green'}) + ' Programs',
      rows: [
        { label:'Top Programs', vals: list.map(u=>(u.programs||[]).slice(0,5).map(p=>`<span class="cmp-chip">${p}</span>`).join('')) },
        { label:'Total Programs', vals: list.map(u=>(u.programs||[]).length||'—'), winnerIdx: (()=>{ const counts=list.map(u=>(u.programs||[]).length); const m=Math.max(...counts); return counts.indexOf(m); })(), winnerLabel:'Most Variety' },
      ]
    },
    {
      title: icon('share',{size:18,cls:'tpk-ic-green'}) + ' Resources',
      rows: [
        { label:'Website', vals: list.map(u=>u.website? `<a href="https://www.${u.website}" target="_blank" rel="noopener noreferrer" style="color:#00A040;font-weight:700;display:inline-flex;align-items:center;gap:4px;">${icon('globe',{size:14})} ${u.website}</a>` : '—') },
        { label:'Details', vals: list.map(u=>{
          // Fallback to ?id= if for any reason u.name is missing — guarantees the link always works
          const slug = toSlugSafe(u.name);
          const href = slug ? `/university/${slug}` : `/university.html?id=${u.id}`;
          return `<a href="${href}" target="_blank" rel="noopener" style="color:#00A040;font-weight:700;display:inline-flex;align-items:center;gap:4px;">View Profile ${icon('arrowRight',{size:14})}</a>`;
        }) },
      ]
    }
  ];

  const shareUrl = `${location.origin}/?compare=${list.map(u=>u.id).join(',')}`;

  modal.innerHTML = `
    <button class="modal-close" onclick="closeCompareModal()" aria-label="Close">×</button>

    <!-- HEADER -->
    <div class="cmp-header">
      <div>
        <div class="cmp-eyebrow">SIDE-BY-SIDE COMPARISON</div>
        <h2 class="cmp-h2">Comparing ${list.length} Universities</h2>
      </div>
      <div class="cmp-actions">
        <button class="cmp-action-btn" onclick="shareCompareUrl()" title="Copy share link">${icon('share',{size:15})} Share</button>
        <button class="cmp-action-btn" onclick="printCompare()" title="Print or Save as PDF">${icon('printer',{size:15})} Print/PDF</button>
      </div>
    </div>

    <!-- UNIVERSITY CARDS ROW -->
    <div class="cmp-cards">
      ${list.map((u,i)=>`
        <div class="cmp-card ${i===overallWinnerIdx&&maxScore>0?'cmp-overall-winner':''}">
          ${i===overallWinnerIdx&&maxScore>0?`<div class="cmp-crown" title="Wins ${maxScore} of 4 measurable categories — not a quality verdict">${icon('crown',{size:14})} Most Wins (${maxScore}/4)</div>`:''}
          <div class="cmp-logo">${u.icon||icon('building2',{size:36,cls:'tpk-ic-navy'})}</div>
          <div class="cmp-name">${u.name}</div>
          <div class="cmp-loc">${icon('mapPin',{size:13})} ${u.city||'—'}</div>
          <div class="cmp-tags">
            <span class="cmp-tag ${u.type==='public'?'pub':'priv'}">${u.type==='public'?'Public':'Private'}</span>
            <span class="cmp-tag est">Est. ${u.established||'—'}</span>
          </div>
          <button class="cmp-remove" onclick="removeFromCompare(${u.id});closeCompareModal();setTimeout(openCompareModal,100);" title="Remove">${icon('x',{size:12})} Remove</button>
        </div>
      `).join('')}
    </div>

    <!-- COMPARISON CATEGORIES -->
    ${cats.map(cat=>`
      <div class="cmp-cat">
        <div class="cmp-cat-title">${cat.title}</div>
        ${cat.rows.map(row=>`
          <div class="cmp-row" style="grid-template-columns:160px repeat(${list.length},1fr);">
            <div class="cmp-row-label">${row.label}</div>
            ${row.vals.map((v,i)=>{
              const isWinner = row.winnerIdx===i;
              let bar = '';
              if(row.bars && row.bars[i]>0){
                const max = Math.max(...row.bars);
                const min = Math.min(...row.bars.filter(x=>x>0));
                const pct = row.barLowerBetter
                  ? (1 - ((row.bars[i]-min)/(max-min||1))) * 100
                  : ((row.bars[i]-min)/(max-min||1)) * 100;
                bar = `<div class="cmp-bar"><span style="width:${Math.max(15,pct)}%"></span></div>`;
              }
              const uniName = list[i] ? (list[i].name || '') : '';
              return `
                <div class="cmp-cell ${isWinner?'cmp-cell-winner':''}" data-uni="${escHTML(uniName)}">
                  ${isWinner?`<div class="cmp-win-badge">✨ ${row.winnerLabel||'Best'}</div>`:''}
                  <div class="cmp-uni-tag">${escHTML(uniName)}</div>
                  <div class="cmp-val">${v}</div>
                  ${bar}
                </div>`;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `).join('')}

    <!-- TIP FOOTER -->
    <div class="cmp-tip">
      <span style="display:inline-flex;align-items:center;gap:6px;color:#FFA726;">${icon('lightbulb',{size:16})}</span>
      <strong>What "Most Wins" means:</strong> it just counts how many of the 4 measurable categories
      (cheapest fee, highest cutoff merit, most seats, oldest, most variety) a university leads in.
      It is <em>not</em> an overall "best" verdict — visit each profile for the full picture before deciding.
      Share this comparison with friends or save it as PDF for offline review.
    </div>

    <!-- HIDDEN INPUT FOR SHARE -->
    <input id="cmpShareUrl" type="hidden" value="${shareUrl}">
  `;

  document.getElementById('compareModalOverlay').classList.add('show');
  if (typeof hydrateIcons === 'function') hydrateIcons(modal);

  // Update URL without reload
  try{ history.replaceState(null,'',`?compare=${list.map(u=>u.id).join(',')}`); }catch(e){}
}

// Helper: safe slug
function toSlugSafe(name){
  return (name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// Print/PDF the comparison — temporarily isolates the modal so nothing else prints
function printCompare(){
  // Idempotent cleanup — runs at most once even if multiple events fire
  let cleaned = false;
  const cleanup = ()=>{
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove('printing-compare');
    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('focus', cleanup);
  };
  document.body.classList.add('printing-compare');
  // Primary signal — fires reliably in Chromium/Firefox after print or cancel
  window.addEventListener('afterprint', cleanup, { once: true });
  // Secondary — Safari/iOS may only fire focus
  window.addEventListener('focus', cleanup, { once: true });
  // Hard fallback so we never leave the page broken
  setTimeout(cleanup, 30000);
  // Defer print to next 2 frames so the class actually paints
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    try { window.print(); } catch(e) { cleanup(); }
  }));
}

// Share comparison link
function shareCompareUrl(){
  const url = document.getElementById('cmpShareUrl')?.value || location.href;
  if(navigator.share){
    navigator.share({ title:'TaleemPK Compare', text:'Check out this university comparison on TaleemPK', url }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(()=>{
      const btn = event.target.closest('.cmp-action-btn');
      if(btn){ const orig=btn.innerHTML; btn.innerHTML='✅ Link Copied!'; setTimeout(()=>btn.innerHTML=orig,2000); }
    }).catch(()=>alert('Share link: '+url));
  }
}

// Load comparison from URL on page load — only ONCE per param value (per pageview)
// "Dismissed" key is set only when the user EXPLICITLY closes the modal,
// so coming back via the browser back button does reopen the comparison.
async function loadCompareFromURL(){
  const params = new URLSearchParams(location.search);
  const ids = params.get('compare');
  if(!ids) return;
  // Only skip if the user actively dismissed THIS exact comparison earlier in the session
  const dismissedKey = 'tpk_dismissed_compare_' + ids;
  if(sessionStorage.getItem(dismissedKey)) return;

  // Wait for UNIVERSITIES to hydrate (up to 8s; covers slow 3G/4G)
  const start = Date.now();
  while ((!Array.isArray(window.UNIVERSITIES) || UNIVERSITIES.length < 10)
         && Date.now() - start < 8000) {
    await new Promise(r => setTimeout(r, 200));
  }
  if (!Array.isArray(window.UNIVERSITIES) || !UNIVERSITIES.length) {
    console.warn('Compare auto-load: universities did not hydrate in time');
    return;
  }

  const idArr = ids.split(',').map(Number).filter(n => Number.isFinite(n) && n > 0);
  const found = idArr.map(id => UNIVERSITIES.find(u => u.id === id)).filter(Boolean);
  if (found.length < 2) {
    console.warn('Compare URL references missing universities:', idArr);
    return;
  }
  compareList = found.slice(0, 3);
  updateCompareBar();
  openCompareModal();
}
window.addEventListener('load', ()=>setTimeout(loadCompareFromURL, 400));

function closeCompareModal(e) {
  if(!e || e.target.id==='compareModalOverlay' || e.target.classList.contains('modal-close')) {
    document.getElementById('compareModalOverlay').classList.remove('show');
    document.body.classList.remove('printing-compare');
    // Remember that the user actively dismissed this comparison — back-button revisits
    // won't auto-reopen it for the rest of the session.
    try{
      const url = new URL(location.href);
      const ids = url.searchParams.get('compare');
      if (ids) {
        sessionStorage.setItem('tpk_dismissed_compare_' + ids, '1');
        url.searchParams.delete('compare');
        history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
    }catch(err){}
  }
}

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.1});

// ═══════════════════════════════════════════════════════════════
//  SUPABASE — load live institution data from the database
//  (anon key is public/safe for frontend. Falls back to built-in
//   data if the database is unreachable, so the site never breaks.)
// ═══════════════════════════════════════════════════════════════
// Prefer centralised config (window.TPK_CONFIG set by config.js) — keeps literal as fallback
// so the site still boots if config.js fails to load. To rotate the anon key safely,
// update config.js + the 4 literal fallbacks (see OPS-RUNBOOK.md §1).
const SUPABASE = {
  url: (window.TPK_CONFIG && window.TPK_CONFIG.SUPABASE_URL) || 'https://vpioffkkzwbfnmpxpwgc.supabase.co',
  key: (window.TPK_CONFIG && window.TPK_CONFIG.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE'
};

// ════════════════════════════════════════════════════════
//  XSS PROTECTION — escape every interpolated DB string
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  ICON SYSTEM — Lucide-style stroke icons (MIT licensed paths)
//  Use icon('name') instead of emojis for UI elements.
//  Emojis stay only in welcome/verdict/celebratory copy.
// ════════════════════════════════════════════════════════════
const TPK_ICONS = {
  calculator:    '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
  ruler:         '<path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0L2.7 18.7a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
  gift:          '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  calendar:      '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  map:           '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
  target:        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  heart:         '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  download:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  smartphone:    '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  building2:     '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  briefcase:     '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  shield:        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  bookOpen:      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  trendingUp:    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  dollarSign:    '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  mapPin:        '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  users:         '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  award:         '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  home:          '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  globe:         '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  share:         '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
  printer:       '<path d="M6 18h-1a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  x:             '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus:          '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check:         '<path d="M20 6 9 17l-5-5"/>',
  chevronDown:   '<path d="m6 9 6 6 6-6"/>',
  chevronRight:  '<path d="m9 18 6-6-6-6"/>',
  arrowRight:    '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  search:        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  helpCircle:    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  thumbsUp:      '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L15 2a1.5 1.5 0 0 1 1.49 1.46Z"/>',
  arrowUp:       '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  star:          '<polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.62 12 2 9.19 8.62 2 9.24 7.46 13.97 5.82 21"/>',
  graduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  flask:         '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  palette:       '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20 1.5 1.5 0 0 0 1.06-2.56l-.61-.62a1.5 1.5 0 0 1 1.06-2.56H17a5 5 0 0 0 5-5 10 10 0 0 0-10-10z"/>',
  code:          '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  wrench:        '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  stethoscope:   '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  lightbulb:     '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  crown:         '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  filter:        '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  user:          '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  logOut:        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  logIn:         '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
  bell:          '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  trophy:        '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/>',
  scroll:        '<path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M22 17H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z"/><path d="M2 17v0a2 2 0 0 0 2 2v0"/><path d="M22 17v0a2 2 0 0 0-2-2v0a2 2 0 0 1 0-4v0a2 2 0 0 0 2-2V9"/>',
  rocket:        '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  flame:         '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  flag:          '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>'
};

// Render an icon. Optional class string, size (px), and stroke width.
window.icon = function(name, opts){
  const svg = TPK_ICONS[name];
  if (!svg) return '';
  const o = opts || {};
  const size = o.size || 18;
  const sw = o.sw || 2;
  const cls = (o.cls || '') + ' tpk-ic';
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`;
};

// Replace every <span data-icon="name"></span> in a subtree with its SVG.
// Call after innerHTML updates that contain new data-icon spans.
window.hydrateIcons = function(root){
  (root || document).querySelectorAll('[data-icon]:not([data-icon-done])').forEach(el => {
    const name = el.getAttribute('data-icon');
    const size = parseInt(el.getAttribute('data-size') || '18', 10);
    el.innerHTML = icon(name, { size });
    el.setAttribute('data-icon-done', '1');
  });
  // For elements that want an icon prepended to their text (used with data-i18n
  // so the icon survives translation), prepend once.
  (root || document).querySelectorAll('[data-prefix-icon]:not([data-prefix-done])').forEach(el => {
    const name = el.getAttribute('data-prefix-icon');
    el.innerHTML = icon(name, { size: 14 }) + ' ' + el.innerHTML;
    el.setAttribute('data-prefix-done', '1');
  });
};
// Run once at parse end so static markup gets icons immediately
document.addEventListener('DOMContentLoaded', () => hydrateIcons());
// Also schedule one early frame in case scripts run before DCL
requestAnimationFrame(() => hydrateIcons());

window.escHTML = function(s){
  return String(s==null?'':s).replace(/[&<>"']/g,
    c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
};
// Only allow http(s) URLs — block javascript:, data:, etc.
window.safeUrl = function(u){
  if(!u) return '';
  try{ const x = new URL(u, location.origin);
    return /^https?:$/.test(x.protocol) ? x.href : '';
  }catch{ return ''; }
};

// Supabase JS client (for auth + community writes)
const sbClient = (window.supabase) ? window.supabase.createClient(SUPABASE.url, SUPABASE.key) : null;
let currentUser = null;
function userDisplayName(u){
  if(!u) return '';
  return (u.user_metadata && u.user_metadata.name) || (u.email ? u.email.split('@')[0] : 'User');
}

// ─── Auth UI ───
let _authMode = 'login';
function onAuthNavClick(){
  closeMobileMenu();
  if(currentUser){ doLogout(); } else { openAuthModal('login'); }
}
function openAuthModal(mode){ switchAuthTab(mode||'login'); document.getElementById('authOverlay').classList.add('show'); }
function closeAuthModal(){ document.getElementById('authOverlay').classList.remove('show'); const m=document.getElementById('authMsg'); if(m) m.className='auth-msg'; }
function switchAuthTab(mode){
  _authMode = mode;
  document.getElementById('authTabLogin').classList.toggle('active', mode==='login');
  document.getElementById('authTabSignup').classList.toggle('active', mode==='signup');
  document.getElementById('authNameWrap').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('authTitle').textContent = mode==='signup' ? 'Create your account 🎓' : 'Welcome back 👋';
  document.getElementById('authSub').textContent = mode==='signup' ? 'Join to write reviews and ask questions.' : 'Log in to write reviews and ask questions.';
  document.getElementById('authSubmitBtn').textContent = mode==='signup' ? 'Create Account' : 'Login';
}
function authFlash(text, ok){ const e=document.getElementById('authMsg'); e.textContent=text; e.className='auth-msg '+(ok?'ok':'err'); }
async function submitAuth(){
  if(!sbClient){ authFlash('Auth unavailable right now.', false); return; }
  const email=(document.getElementById('authEmail').value||'').trim();
  const password=document.getElementById('authPassword').value;
  if(!email||!password){ authFlash('Enter email and password.', false); return; }
  if(_authMode==='signup'){
    const name=(document.getElementById('authName').value||'').trim();
    const { error } = await sbClient.auth.signUp({ email, password, options:{ data:{ name } } });
    if(error){ authFlash(error.message, false); return; }
    authFlash('✅ Account created! Please check your inbox (and spam folder) for a confirmation email — click the link to activate your account, then come back here and log in.', true);
    setTimeout(()=>switchAuthTab('login'), 3500);
  } else {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    if(error){ authFlash(error.message, false); return; }
    currentUser = data.user; refreshAuthUI();
    closeAuthModal();
  }
}
async function doLogout(){ if(sbClient){ await sbClient.auth.signOut(); } currentUser=null; refreshAuthUI(); }
async function refreshAuthUI(){
  const btn=document.getElementById('authNavBtn');
  const desktopText = currentUser ? ('👤 '+userDisplayName(currentUser)+' · Logout') : 'Login / Sign Up';
  if(btn) btn.textContent = desktopText;
  const mBtn = document.getElementById('authNavBtnMobile');
  if(mBtn) mBtn.textContent = currentUser ? ('👤 '+userDisplayName(currentUser)+' · Logout') : '🔐 Login / Sign Up';
  // Sync shortlist from DB whenever auth state changes — awaited so the UI never lags one render behind
  if(typeof loadShortlistFromDB === 'function'){
    try{ await loadShortlistFromDB(); }catch(e){}
    if(typeof applyFilters === 'function') applyFilters();
  }
}
async function initAuth(){
  if(!sbClient) return;
  try{
    const { data } = await sbClient.auth.getSession();
    currentUser = data.session ? data.session.user : null;
    refreshAuthUI();
    sbClient.auth.onAuthStateChange((_e, session)=>{ currentUser = session ? session.user : null; refreshAuthUI(); });
  }catch(e){}
}

// Extract the lowest plausible cutoff % from a free-text merit string
function _parseMeritMin(s){
  if(!s) return 50;
  const nums = String(s).match(/\d+(?:\.\d+)?/g);
  if(!nums) return 50;
  // Pick the smallest plausible % (10–99 range) — closing merit is usually the lower of any cited numbers
  const valid = nums.map(Number).filter(n => n >= 10 && n <= 99);
  if(!valid.length) return 50;
  return Math.min(...valid);
}
function mapInstitution(row){
  return {
    id: row.id, rank: row.rank || 0, name: row.name, full: row.full_name,
    city: row.city, province: row.province, type: row.sector, icon: row.icon,
    tags: row.tags || [], fee: row.fee, feeNum: row.fee_num || 0,
    feeYear: row.fee_year || undefined, feeNote: row.fee_note || undefined,
    merit: row.merit,
    // Curated MERIT_MAP wins over free-text parsing — "NET-1 to NET-4" parses as 10 otherwise
    meritMin: (typeof MERIT_MAP !== 'undefined' && MERIT_MAP[row.id]) || _parseMeritMin(row.merit),
    entry: row.entry,
    programs: row.programs || [],
    seats: row.seats, established: row.established, website: row.website,
    logoUrl: row.logo_url || '',
    description: row.description, highlights: row.highlights || [],
    scholarships: row.scholarships, hostel: row.hostel,
    feeDetails: (row.fee_details || [])
      .sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
      .map(f=>({label:f.label, value:f.value}))
  };
}

function renderSkeletons(n){
  const grid = document.getElementById('uniGrid'); if(!grid) return;
  let html=''; for(let i=0;i<n;i++) html += `
    <div class="skel-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
        <div class="skel skel-circle"></div>
        <div class="skel" style="width:50px;height:18px;border-radius:20px;"></div>
      </div>
      <div class="skel skel-line" style="width:60%;height:18px;"></div>
      <div class="skel skel-line" style="width:40%;"></div>
      <div style="display:flex;gap:6px;margin:14px 0;">
        <div class="skel" style="width:60px;height:22px;border-radius:20px;"></div>
        <div class="skel" style="width:70px;height:22px;border-radius:20px;"></div>
      </div>
      <div class="skel skel-line"></div>
      <div class="skel skel-line" style="width:80%;"></div>
      <div style="display:flex;gap:8px;margin-top:16px;">
        <div class="skel" style="flex:1;height:36px;"></div>
        <div class="skel" style="flex:1;height:36px;"></div>
      </div>
    </div>`;
  grid.innerHTML = html;
}

function updateHeroStats(){
  const u = document.getElementById('statUnis'); if(u) u.textContent = UNIVERSITIES.length;
  const p = document.getElementById('statProgs'); if(p) p.textContent = (PROGRAM_INDEX?PROGRAM_INDEX.length:260)+'+';
  // city count: split / and dedupe
  const set = new Set();
  UNIVERSITIES.forEach(u=>(u.city||'').split(/[\/,]|\+/).forEach(c=>{
    const n=c.trim(); if(n && n!=='Online' && !/\d|cities|others|campus|multiple/i.test(n)) set.add(n);
  }));
  const c = document.getElementById('statCities'); if(c) c.textContent = set.size+'+';
}

function renderRecentlyViewed(){
  const el = document.getElementById('recentStrip'); if(!el) return;
  let ids=[]; try{ ids = JSON.parse(localStorage.getItem('tpk_recent_v1')||'[]'); }catch(e){}
  const items = ids.map(id=>UNIVERSITIES.find(u=>u.id===id)).filter(Boolean).slice(0,8);
  if(!items.length){ el.style.display='none'; return; }
  el.style.display='block';
  el.innerHTML = `<h4 style="display:flex;align-items:center;gap:8px;">${icon('arrowUp',{size:16,cls:'tpk-ic-green'})} Recently Viewed <button class="rec-clear" onclick="clearRecent()">Clear</button></h4>
    <div class="rec-row">${items.map(u=>{
      const safeLogo = escHTML(u.logoUrl || '');
      const safeWeb = escHTML(u.website || '');
      const safeIcon = escHTML(u.icon || '');
      const ic = u.logoUrl
        ? `<img src="${safeLogo}" alt="">`
        : (u.website ? `<img src="https://www.google.com/s2/favicons?domain=${safeWeb}&sz=64" alt="">` : `<span>${safeIcon}</span>`);
      return `<div class="rec-chip" onclick="openDetail(${u.id})">${ic}<span class="rec-chip-name">${escHTML(u.name)}</span></div>`;
    }).join('')}</div>`;
}
function clearRecent(){ try{ localStorage.removeItem('tpk_recent_v1'); }catch(e){} renderRecentlyViewed(); }

function renderGridError(msg){
  const grid = document.getElementById('uniGrid'); if(!grid) return;
  grid.innerHTML = `<div class="grid-error">
    <div style="font-size:2.4rem;margin-bottom:10px;">⚠️</div>
    <h3>Could not load universities</h3>
    <p>${msg||'Please check your connection and try again.'}</p>
    <button onclick="location.reload()">Retry</button>
  </div>`;
}

async function loadInstitutions(){
  renderSkeletons(8);   // show shimmer while fetching
  try{
    const r = await fetch(SUPABASE.url + '/rest/v1/institutions?select=*,fee_details(label,value,sort_order)&order=id.asc', {
      headers:{ apikey: SUPABASE.key, Authorization: 'Bearer ' + SUPABASE.key }
    });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const rows = await r.json();
    if(!Array.isArray(rows) || !rows.length) throw new Error('empty result');
    const mapped = rows.map(mapInstitution);
    UNIVERSITIES.length = 0;              // replace built-in data with live DB data
    mapped.forEach(u => UNIVERSITIES.push(u));
    console.log('✅ Loaded ' + UNIVERSITIES.length + ' institutions from Supabase');
    return true;
  }catch(e){
    console.warn('⚠️ Supabase load failed — using built-in data. (' + e.message + ')');
    if(!UNIVERSITIES.length){ renderGridError(e.message); return false; }
    return false;
  }
}

// ─── PWA: register service worker for offline + install ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        // Refresh page when a new SW takes over so users see the latest code
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
        // Check for updates every 30 minutes (user keeps tab open)
        setInterval(() => reg.update().catch(()=>{}), 30 * 60 * 1000);
      })
      .catch(err => console.warn('SW registration failed:', err.message));
  });
}

// ─── PWA Install Prompt ───
let _deferredInstallPrompt = null;
let _isAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches
                       || window.navigator.standalone === true;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredInstallPrompt = e;
  // Surface a subtle "Install app" toast after some engagement
  if (!sessionStorage.getItem('tpk_install_dismissed') && !_isAlreadyInstalled) {
    setTimeout(showInstallPrompt, 8000);
  }
  // Also reveal the always-on Install button in the nav
  const btn = document.getElementById('tpkInstallBtn');
  if (btn) btn.style.display = 'inline-flex';
});
window.addEventListener('appinstalled', () => {
  _deferredInstallPrompt = null;
  _isAlreadyInstalled = true;
  const btn = document.getElementById('tpkInstallBtn');
  if (btn) btn.style.display = 'none';
  const toast = document.getElementById('tpkInstallToast');
  if (toast) toast.remove();
});

// User explicitly clicked an install button somewhere
window.tpkInstall = async function(){
  if (_deferredInstallPrompt) {
    _deferredInstallPrompt.prompt();
    const { outcome } = await _deferredInstallPrompt.userChoice;
    if (outcome === 'dismissed') sessionStorage.setItem('tpk_install_dismissed','1');
    _deferredInstallPrompt = null;
    const btn = document.getElementById('tpkInstallBtn');
    if (btn) btn.style.display = 'none';
  } else {
    // No native prompt — show "Add to Home Screen" instructions
    showInstallInstructions();
  }
};

function showInstallPrompt(){
  if (!_deferredInstallPrompt || document.getElementById('tpkInstallToast') || _isAlreadyInstalled) return;
  const t = document.createElement('div');
  t.id = 'tpkInstallToast';
  t.style.cssText = 'position:fixed;bottom:90px;left:20px;right:20px;max-width:380px;margin:0 auto;background:#0A1628;color:#fff;padding:14px 16px;border-radius:14px;box-shadow:0 12px 30px rgba(10,22,40,.35);z-index:950;display:flex;gap:12px;align-items:center;font-family:Sora,sans-serif;animation:tpkSlide .3s';
  t.innerHTML = `<div style="font-size:1.8rem;">📲</div>
    <div style="flex:1;font-size:.84rem;line-height:1.35;">
      <b>Install TaleemPK</b><br>
      <span style="opacity:.7;font-size:.78rem;">Faster access, works offline, no app store needed.</span>
    </div>
    <button id="tpkInstallYes" style="background:#00C853;color:#0A1628;border:none;border-radius:9px;padding:8px 12px;font-weight:800;font-size:.78rem;cursor:pointer;font-family:inherit;">Install</button>
    <button id="tpkInstallNo" style="background:transparent;color:#9BA5B5;border:none;font-size:1.2rem;cursor:pointer;padding:4px;">×</button>`;
  document.body.appendChild(t);
  document.getElementById('tpkInstallYes').onclick = () => { t.remove(); tpkInstall(); };
  document.getElementById('tpkInstallNo').onclick = () => { t.remove(); sessionStorage.setItem('tpk_install_dismissed','1'); };
}

function showInstallInstructions(){
  if (document.getElementById('tpkInstallHelp')) return;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);

  let steps = '';
  if (isIOS && isSafari) {
    steps = `<ol style="margin:0 0 0 22px;padding:0;line-height:1.7;">
      <li>Tap the <b>Share</b> button at the bottom of Safari (▢↑)</li>
      <li>Scroll and tap <b>"Add to Home Screen"</b></li>
      <li>Tap <b>"Add"</b> top right</li>
    </ol>`;
  } else if (isAndroid) {
    steps = `<ol style="margin:0 0 0 22px;padding:0;line-height:1.7;">
      <li>Tap the <b>3-dot menu</b> top-right of Chrome</li>
      <li>Tap <b>"Install app"</b> or <b>"Add to Home screen"</b></li>
      <li>Confirm <b>"Install"</b></li>
    </ol>`;
  } else if (isFirefox) {
    steps = `<p>Firefox on desktop doesn't yet show install dialogs.<br>Use <b>Chrome</b>, <b>Edge</b>, or <b>Brave</b> to install TaleemPK as an app, or simply bookmark this page.</p>`;
  } else {
    steps = `<ol style="margin:0 0 0 22px;padding:0;line-height:1.7;">
      <li>Look at the <b>address bar</b> — click the <b>install icon (⊕)</b> on the right</li>
      <li>Or open the <b>3-dot menu → Install TaleemPK</b></li>
      <li>Confirm <b>"Install"</b></li>
    </ol>
    <p style="margin-top:10px;opacity:.7;font-size:.78rem;">Note: Some browsers only show this option after you've visited the site a couple of times.</p>`;
  }

  const m = document.createElement('div');
  m.id = 'tpkInstallHelp';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(10,22,40,.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px;font-family:Sora,sans-serif;';
  m.innerHTML = `<div style="background:#fff;border-radius:18px;padding:24px;max-width:420px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.3);">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <div style="font-size:1.8rem;">📲</div>
      <h3 style="margin:0;font-size:1.1rem;color:#0A1628;">Install TaleemPK</h3>
      <button style="margin-left:auto;background:none;border:none;font-size:1.4rem;color:#9BA5B5;cursor:pointer;" onclick="document.getElementById('tpkInstallHelp').remove()">×</button>
    </div>
    <p style="color:#5A6478;font-size:.86rem;margin:0 0 14px;">Install us as an app for faster access and offline use:</p>
    <div style="background:#F5F7FA;border-radius:10px;padding:14px;color:#0A1628;font-size:.86rem;">${steps}</div>
  </div>`;
  m.onclick = e => { if (e.target === m) m.remove(); };
  document.body.appendChild(m);
}

const _tpkSlideKf = document.createElement('style');
_tpkSlideKf.textContent = '@keyframes tpkSlide{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}';
document.head.appendChild(_tpkSlideKf);

(async function initApp(){
  initAuth();
  await loadInstitutions();
  buildProgramIndex();
  await loadRatingAggregates();
  populateCityFilter();
  populateProgramFilter();
  renderNews();
  // Restore filter/scroll state after back-navigation from a university page
  try{
    const _saved = JSON.parse(sessionStorage.getItem('tpk_back_state')||'null');
    if(_saved){
      sessionStorage.removeItem('tpk_back_state');
      currentFilter = _saved.filter||'all';
      currentCity = _saved.city||'';
      currentProgram = _saved.program||'';
      currentScholarship = _saved.scholarship||'';
      currentSort = _saved.sort||'default';
      searchQuery = _saved.query||'';
      currentPage = _saved.page||1;
      // Restore search input text
      const _inp = document.getElementById('heroSearch');
      if(_inp && searchQuery) _inp.value = searchQuery;
      // Restore active filter button
      document.querySelectorAll('.filter-btn').forEach(b=>{
        const _m = (b.getAttribute('onclick')||'').match(/filterUnis\('([^']+)'/);
        if(_m) b.classList.toggle('active', _m[1]===currentFilter);
      });
      // Restore dropdown values
      const _cy=document.getElementById('cityFilter'); if(_cy&&currentCity) _cy.value=currentCity;
      const _pr=document.getElementById('programFilter'); if(_pr&&currentProgram) _pr.value=currentProgram;
      const _so=document.getElementById('sortFilter'); if(_so&&currentSort!=='default') _so.value=currentSort;
      // Restore scroll after cards render
      const _sy = _saved.scrollY||0;
      if(_sy>0) setTimeout(()=>window.scrollTo({top:_sy,behavior:'instant'}),150);
    }
  }catch(e){}
  applyFilters();
  updateHeroStats();
  renderRecentlyViewed();
  // Deep link: open a university directly if URL has #uni-<id>
  const m = (location.hash||'').match(/^#uni-(\d+)/);
  if(m){ const uid=parseInt(m[1]); if(UNIVERSITIES.some(u=>u.id===uid)) setTimeout(()=>openDetail(uid),200); }
})();

// Back-to-top button visibility on scroll
window.addEventListener('scroll', function(){
  const btn = document.getElementById('backToTop');
  if(btn) btn.classList.toggle('show', window.scrollY > 500);
});
setTimeout(()=>{
  document.querySelectorAll('.hiw-step.fade-in').forEach(el=>observer.observe(el));
},500);

// ── Announcement ticker: hydrate from site_announcements (admin-approved scraped items) ──
// Falls back silently to the static HTML items if the table is empty/unreachable.
// Constant scroll speed regardless of content length — a fixed 35s duration made the
// ticker race whenever scraped items grew the track.
function setTickerSpeed(){
  const track = document.getElementById('anncTrack');
  if(!track) return;
  const half = track.scrollWidth / 2;          // loop distance (content is doubled)
  const secs = Math.max(30, Math.round(half / 60));  // ~60px per second
  track.style.animationDuration = secs + 's';
}
document.addEventListener('DOMContentLoaded', setTickerSpeed);

(async function hydrateAnnouncements(){
  try{
    const H = { apikey: SUPABASE.key, Authorization: 'Bearer ' + SUPABASE.key };
    // Admin-curated items first…
    const r = await fetch(SUPABASE.url + '/rest/v1/site_announcements?select=icon,text,url&active=eq.true&order=sort_order.asc,created_at.desc&limit=12', { headers: H });
    const rows = r.ok ? await r.json() : [];
    // …then the freshest scraped updates (last 30 days) auto-appended
    try{
      const since = new Date(Date.now() - 30*86400000).toISOString();
      const r2 = await fetch(SUPABASE.url + `/rest/v1/uni_updates?select=uni_name,title,url,kind&status=neq.dismissed&found_at=gte.${since}&order=found_at.desc&limit=8`, { headers: H });
      if(r2.ok){
        const icons = { announcement:'📢', deadline:'⏰', fee:'💰', program:'📚' };
        (await r2.json()).forEach(x => rows.push({ icon: icons[x.kind]||'📢', text: `${x.uni_name} — ${x.title}`, url: x.url }));
      }
    }catch(e){}
    if(!Array.isArray(rows) || !rows.length) return;
    const track = document.getElementById('anncTrack');
    if(!track) return;
    const item = a => {
      const body = `${a.icon||'📢'} ${escHTML(a.text)}`;
      return a.url ? `<a class="annc-item" href="${escHTML(a.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">${body}</a>`
                   : `<span class="annc-item">${body}</span>`;
    };
    const html = rows.map(item).join('');
    track.innerHTML = html + html;  // doubled for seamless marquee loop
    setTickerSpeed();
  }catch(e){ /* static fallback stays */ }
})();
