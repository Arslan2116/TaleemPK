// TaleemPK i18n strings + early UI logic (extracted from index.html).

/* ╔══════════════════════════════════════════════════════════════╗
   ║           SITE CONFIG — EDIT ONLY THIS SECTION              ║
   ║   Change logo, links, contact info — everything from here   ║
   ╚══════════════════════════════════════════════════════════════╝ */
const SITE_CONFIG = {

  // ── Branding ──────────────────────────────────────────────────
  site_name:      'TaleemPK',           // Site name shown in nav & footer
  site_tagline:   "Pakistan's #1 University Comparison Platform",
  logo_url:       'logo.png',           // Logo image in the same folder. Leave empty ('') to use text logo
                                        // OR paste a full URL: 'https://yoursite.com/logo.png'

  // ── Contact ───────────────────────────────────────────────────
  email:          'info@taleempk.com',
  whatsapp:       '923353303999',       // No + or spaces (e.g. 923001234567)
  city:           'Karachi, Pakistan',
  support_hours:  'Mon–Sat, 9 AM – 6 PM PKT',

  // ── Social Media Links ─────────────────────────────────────────
  social: {
    facebook:   'https://www.facebook.com/profile.php?id=61590794361386',
    instagram:  'https://www.instagram.com/taleempk.official/',
    twitter:    'https://x.com/TaleemPK_',
    youtube:    '',
    whatsapp:   'https://wa.me/923353303999',
  },

  // ── Form Submission ───────────────────────────────────────────
  formspree_endpoint: '',   // e.g. 'https://formspree.io/f/xabcdefg'

  // ── Footer Links ─────────────────────────────────────────────
  footer_links: {
    privacy:    '#',   // e.g. 'https://yoursite.com/privacy'
    terms:      '#',
    hec:        '#',
  }
};

/* ╔══════════════════════════════════════════════════════════════╗
   ║   BLOG / NEWS POSTS — ADD OR EDIT ARTICLES HERE              ║
   ║   To add a new post: copy one { } block and edit the fields. ║
   ║   Newest post should be at the TOP of the list.              ║
   ╚══════════════════════════════════════════════════════════════╝ */
const NEWS_POSTS = [
  {
    id: 4,
    title: "Entry Test Preparation: A Smart Study Plan for ECAT & MDCAT",
    category: "Test Prep",
    icon: "📝",
    date: "2026-05-30",
    author: "TaleemPK Team",
    excerpt: "Entry tests can make or break your admission. Here is a practical, week-by-week strategy to prepare for ECAT and MDCAT without burning out.",
    url: "/blog/entry-test-preparation-ecat-mdcat",
    body: `
      <p>For most engineering and medical aspirants, the entry test carries the highest weightage in the final merit. A focused study plan matters more than long, unstructured hours.</p>
      <h3>Step 1: Know the Pattern</h3>
      <p>Download the official syllabus for <strong>ECAT</strong> (engineering) or <strong>MDCAT</strong> (medical). Both are largely based on the FSc curriculum, so your textbooks are your best resource.</p>
      <h3>Step 2: Build a Weekly Plan</h3>
      <ul>
        <li><strong>Weeks 1–4:</strong> Cover the full syllabus subject by subject.</li>
        <li><strong>Weeks 5–8:</strong> Solve past papers and topic-wise MCQs daily.</li>
        <li><strong>Final 2 weeks:</strong> Full-length timed mock tests to build speed and accuracy.</li>
      </ul>
      <h3>Step 3: Review Your Mistakes</h3>
      <p>Maintain an error log. Revising the questions you got wrong is the fastest way to improve your score.</p>
      <p><em>Tip: Use the Admission Predictor on TaleemPK to see which universities match your expected aggregate.</em></p>
    `
  },
  {
    id: 1,
    title: "How to Calculate Your University Aggregate (Merit) in Pakistan",
    category: "Admission Guide",
    icon: "📊",
    date: "2026-05-28",
    author: "TaleemPK Team",
    excerpt: "Most universities weigh Matric, Intermediate, and the entry test differently. Learn the standard aggregate formula and how to estimate your merit before applying.",
    url: "/blog/university-aggregate-merit-pakistan",
    // Body supports simple HTML: <p>, <h3>, <ul>/<li>, <strong>
    body: `
      <p>Your <strong>aggregate</strong> (also called merit percentage) decides which universities you can get into. Each university uses its own weightage, but the most common formula in Pakistan is:</p>
      <ul>
        <li><strong>Matric:</strong> 10%</li>
        <li><strong>Intermediate / FSc:</strong> 40%</li>
        <li><strong>Entry Test (e.g. ECAT, MDCAT, NTS):</strong> 50%</li>
      </ul>
      <h3>Example</h3>
      <p>If a student scores 85% in Matric, 80% in FSc, and 70% in the entry test, the aggregate is roughly (8.5 + 32 + 35) = <strong>75.5%</strong>.</p>
      <p>Always check each university's official prospectus, as weightage varies — engineering and medical universities especially rely heavily on the entry test.</p>
    `
  },
  {
    id: 2,
    title: "Top Scholarships for Pakistani University Students in 2026",
    category: "Scholarships",
    icon: "🎓",
    date: "2026-05-20",
    author: "TaleemPK Team",
    excerpt: "From the HEC Need-Based Scholarship to Ehsaas Undergraduate Scholarships — a quick overview of major funding options and who qualifies.",
    url: "/blog/scholarships-pakistan-2026",
    body: `
      <p>Higher education can be expensive, but several scholarships make it affordable for deserving students:</p>
      <ul>
        <li><strong>Ehsaas Undergraduate Scholarship:</strong> Covers tuition and a living stipend for students from low-income families.</li>
        <li><strong>HEC Need-Based Scholarships:</strong> Offered through partner universities for financially deserving students.</li>
        <li><strong>University Merit Scholarships:</strong> Most universities offer fee waivers for top-scoring students.</li>
      </ul>
      <p>Apply early and keep your documents (income certificate, transcripts) ready. Deadlines are usually announced right after admission results.</p>
      <p><em>Tip: Use the Fee Calculator on TaleemPK to estimate your costs after a scholarship discount.</em></p>
    `
  },
  {
    id: 3,
    title: "Public vs Private Universities: Which One Is Right for You?",
    category: "Career Advice",
    icon: "⚖️",
    date: "2026-05-12",
    author: "TaleemPK Team",
    excerpt: "Lower fees and prestige, or modern facilities and flexibility? We break down the real trade-offs between public and private universities in Pakistan.",
    url: "/blog/public-vs-private-universities-pakistan",
    body: `
      <p>Choosing between a public and private university is one of the biggest decisions for students. Here's a balanced look:</p>
      <h3>Public Universities</h3>
      <ul>
        <li>Much lower tuition fees</li>
        <li>Strong reputation and large alumni networks</li>
        <li>Higher merit requirements and more competition</li>
      </ul>
      <h3>Private Universities</h3>
      <ul>
        <li>Modern facilities and smaller class sizes</li>
        <li>Flexible admission criteria</li>
        <li>Higher fees (scholarships can help)</li>
      </ul>
      <p>Use the <strong>Compare</strong> tool on TaleemPK to put your shortlisted universities side by side before deciding.</p>
    `
  }
];

/* ── Apply Config on load ─────────────────────────────────────── */
// ── Announcement Bar ──
(function() {
  const bar = document.getElementById('announcBar');
  const nav = document.querySelector('nav');
  if (!bar) return;

  // Dismissed this session?
  if (sessionStorage.getItem('anncDismissed')) {
    bar.classList.add('hidden');
    if (nav) nav.style.top = '0';
    document.body.classList.add('annc-hidden');
    return;
  }

  // Duplicate ticker items for seamless infinite scroll
  const track = document.getElementById('anncTrack');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  // Update nav top when bar is visible
  if (nav) nav.style.top = '36px';
})();

function dismissAnnouncBar() {
  const bar = document.getElementById('announcBar');
  const nav = document.querySelector('nav');
  if (!bar) return;
  bar.classList.add('hidden');
  if (nav) nav.style.top = '0';
  document.body.classList.add('annc-hidden');
  sessionStorage.setItem('anncDismissed', '1');
}

document.addEventListener('DOMContentLoaded', function() {
  // Social links
  const s = SITE_CONFIG.social;
  const socialAnchors = document.querySelectorAll('.footer-social a');
  const socialKeys = ['facebook','instagram','twitter','youtube','whatsapp'];
  socialAnchors.forEach((a, i) => {
    const url = s[socialKeys[i]];
    if(url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.style.display = ''; }
    else { a.style.display = 'none'; }   // Hide icons with no link (avoids dead '#' clicks)
  });

  // Contact info
  const contactSpans = document.querySelectorAll('.footer-contact-item span');
  if(contactSpans[0]) contactSpans[0].textContent = SITE_CONFIG.city;
  if(contactSpans[1]) contactSpans[1].textContent = SITE_CONFIG.email;
  if(contactSpans[3]) contactSpans[3].textContent = SITE_CONFIG.support_hours;

  // Footer bottom links — apply real URLs; hide any that are still placeholder ('#' / empty)
  const fl = SITE_CONFIG.footer_links;
  const bottomLinks = document.querySelectorAll('.footer-bottom-links a');
  const blMap = [fl.privacy, fl.terms, fl.hec];
  bottomLinks.forEach((a, i) => {
    const url = blMap[i];
    if(url && url !== '#') { a.href = url; a.style.display = ''; }
    else { a.style.display = 'none'; }
  });

  // Logo image (if set) — replace text logos with image in nav & footer
  if(SITE_CONFIG.logo_url) {
    // Nav logo
    const navLogo = document.querySelector('.nav-logo');
    if(navLogo) {
      navLogo.innerHTML = `<img src="${SITE_CONFIG.logo_url}" alt="${SITE_CONFIG.site_name}" style="height:42px;width:auto;object-fit:contain;display:block;">`;
    }
    // Footer logo
    const footerLogo = document.querySelector('.footer-logo');
    if(footerLogo) {
      footerLogo.innerHTML = `<img src="${SITE_CONFIG.logo_url}" alt="${SITE_CONFIG.site_name}" style="height:48px;width:auto;object-fit:contain;display:block;margin-bottom:4px;">`;
    }
  }

  // Formspree endpoint override (config takes priority over hardcoded value)
  if(SITE_CONFIG.formspree_endpoint) {
    window._formspreeEndpoint = SITE_CONFIG.formspree_endpoint;
  }
});

const T = {
  en: {
    nav_universities:'Universities', nav_compare:'Compare', nav_how:'How It Works', nav_cta:'View Universities',
    hero_badge:"Pakistan's #1 Education Comparison Platform",
    hero_h1:'Choose the Right <span>University</span> <span class="hero-dash">—</span><br>All Info in One Place',
    hero_urdu:'فیس، میرٹ، پروگرام — سب کچھ ایک جگہ',
    hero_sub:'Data on 270 HEC-recognized universities in Pakistan — fees, merit, programs. Compare side-by-side and decide your future.',
    hero_search_placeholder:'Search university or program…',
    hero_search_btn:'Search',
    stat1_label:'Top Universities', stat2_label:'Programs Listed', stat3_label:'Students Helped', stat4_label:'Cities Covered',
    filter_label:'Filter:', filter_all:'All (270)', filter_public:'Public', filter_private:'Private',
    filter_engineering:'Engineering', filter_medical:'Medical', filter_business:'Business',
    filter_federal:'Federal', filter_punjab:'Punjab', filter_sindh:'Sindh',
    filter_kpk:'KPK', filter_balochistan:'Balochistan', filter_ajk:'AJK', filter_gb:'GB',
    fee_label:'FEE/SEMESTER', merit_label:'MERIT / ENTRY',
    btn_compare:'+ Compare', btn_added:'✓ Added', btn_details:'Details →',
    tag_public:'Public', tag_private:'Private',
    hiw_label:'Simple Process', hiw_title:'Make the Right<br>Decision in 3 Steps',
    hiw_sub:'Comprehensive university data for Pakistan — all in one place',
    step1_num:'STEP 01', step1_title:'Search', step1_desc:'Find universities by city, program, or fee range. 270 HEC-recognized institutions listed.',
    step2_num:'STEP 02', step2_title:'Compare', step2_desc:'Compare 2–3 universities side-by-side — fees, merit, programs, and location all at once.',
    step3_num:'STEP 03', step3_title:'Decide', step3_desc:'Make a confident decision with complete information. No guessing, no confusion.',
    step4_num:'COMING SOON', step4_title:'AI Predictor', step4_desc:'Enter your aggregate — AI will predict your admission chances at each university.',
    compare_bar_title:'⚖️ Compare List:', compare_bar_btn:'Compare Now →',
    footer_tagline:"Pakistan's #1 Education Comparison Platform",
    footer_link1:'Universities', footer_link2:'Compare', footer_link3:'Admission Calendar', footer_link4:'Scholarships', footer_link5:'About',
    footer_copy:'© 2026 TaleemPK — All rights reserved | Karachi, Pakistan',
    detail_fee:'Fee Per Semester', detail_entry:'Entry Test', detail_merit:'Merit Required',
    detail_seats:'Seats Per Year', detail_scholarships:'Scholarships', detail_hostel:'Hostel',
    detail_programs:'📚 Programs Offered', detail_highlights:'✨ Highlights',
    detail_website_btn:'🌐 Visit Official Website →', detail_est:'Est.',
    compare_modal_label:'Side-by-Side Comparison', compare_modal_title:'University Comparison',
    compare_tip:'💡 The <strong>green</strong> highlight shows the most affordable fee option. The right choice depends on your program, merit, and budget.',
    row_university:'University', row_city:'City', row_type:'Type', row_fee:'Fee/Semester',
    row_entry:'Entry Test', row_merit:'Merit Required', row_programs:'Top Programs',
    row_seats:'Seats/Year', row_scholarships:'Scholarships', row_hostel:'Hostel',
    row_established:'Established', row_website:'Website',
    alert_max:'You can compare a maximum of 3 universities!',
    alert_min:'Please select at least 2 universities to compare!',
    showing: c => `Showing <span>${c}</span> universities`,
  },
};
const E = T.en;
function t(key) { return E[key] ?? key; }

