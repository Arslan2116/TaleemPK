#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Build /privacy, /terms and /disclaimer.

   The footer linked all three with href="#" and none of them existed. The text
   below describes what the site actually does — Google Analytics 4, Supabase
   accounts for the shortlist and reviews, no payments, no ad network — rather
   than a generic template. Change the CONTACT constant if the address changes.

     node scripts/build-legal-pages.js

   This is boilerplate written from the code, not legal advice. Have someone
   qualified read it before you rely on it.
   ─────────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://taleempk.pk';
const CONTACT = 'infotaleempk@gmail.com';
const WHATSAPP = '923353303999';
const UPDATED = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const STYLE = `
  :root{--navy:#0A1628;--navy-2:#112240;--green:#00C853;--green-dark:#0a6632;
        --g100:#F4F6F9;--g200:#E3E8EF;--g400:#9BA5B5;--g600:#5A6474;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Sora',system-ui,sans-serif;color:var(--navy);background:#fff;line-height:1.75;}
  a{color:var(--green-dark);}
  nav{background:var(--navy);padding:0 5%;height:60px;display:flex;align-items:center;
      justify-content:space-between;position:sticky;top:0;z-index:10;}
  nav .logo{color:#fff;font-weight:800;font-size:1.2rem;}
  nav .logo span{color:var(--green);}
  nav a.home{color:rgba(255,255,255,.8);font-size:.85rem;text-decoration:none;}
  .hero{background:linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;padding:44px 5% 34px;}
  .hero-in{max-width:780px;margin:0 auto;}
  .crumbs{font-size:.78rem;color:rgba(255,255,255,.55);margin-bottom:12px;}
  .crumbs a{color:var(--green);text-decoration:none;}
  h1{font-size:clamp(1.5rem,4vw,2.1rem);font-weight:800;}
  .updated{color:rgba(255,255,255,.65);font-size:.84rem;margin-top:10px;}
  main{max-width:780px;margin:0 auto;padding:34px 5% 70px;}
  h2{font-size:1.12rem;font-weight:800;margin:30px 0 10px;}
  p{margin-bottom:14px;font-size:.94rem;color:#243044;}
  ul{margin:0 0 16px 22px;}
  li{margin-bottom:7px;font-size:.94rem;color:#243044;}
  .note{background:var(--g100);border-left:3px solid var(--green);border-radius:10px;
        padding:15px 17px;margin:22px 0;font-size:.9rem;}
  footer{background:var(--navy);color:rgba(255,255,255,.55);text-align:center;padding:24px;font-size:.82rem;}
  footer a{color:var(--green);text-decoration:none;}
`;

function page({ slug, title, desc, h1, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/${slug}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/${slug}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@TaleemPK_">
<meta name="twitter:title" content="${esc(title)}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="theme-color" content="#0A1628">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: h1, item: `${SITE}/${slug}` }]})}</script>
<style>${STYLE}</style>
</head>
<body>
<nav><a class="logo" href="/">Taleem<span>PK</span></a><a class="home" href="/">← All Universities</a></nav>
<div class="hero"><div class="hero-in">
  <div class="crumbs"><a href="/">Home</a> › ${esc(h1)}</div>
  <h1>${esc(h1)}</h1>
  <div class="updated">Last updated ${UPDATED}</div>
</div></div>
<main>
${body}
</main>
<footer>© ${YEAR} TaleemPK · <a href="/">Compare Universities in Pakistan</a> ·
  <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/disclaimer">Disclaimer</a></footer>
</body>
</html>
`;
}

const NOTE = `<div class="note">This page describes how the site works today. If something here
does not match what you see, the page is wrong — please tell us and we will correct it.</div>`;

const PRIVACY = `
<p>TaleemPK is a free university comparison site for students in Pakistan. This page explains
what we collect, why, and what you can do about it.</p>
${NOTE}

<h2>What you can do without giving us anything</h2>
<p>Browsing, searching, comparing universities, the fee and merit calculators and the Admission
Predictor all work without an account. We do not ask you to sign up to read anything on this site.</p>

<h2>What we collect</h2>
<ul>
  <li><strong>If you create an account</strong> — your email address, the name you type, and a
      password we never see in readable form. Accounts are handled by Supabase, our database
      provider. We use this to keep your shortlist and to attach your name to a review or question
      you post.</li>
  <li><strong>If you post a review or a question</strong> — what you wrote, and the name on your
      account, both shown publicly on that university's page.</li>
  <li><strong>Analytics</strong> — we use Google Analytics 4 to count visits and see which pages
      are useful. It records things like the pages you open, roughly where you are (city level),
      and what kind of device you used. We do not use it to identify you.</li>
  <li><strong>On your own device</strong> — your recently viewed universities, your comparison
      list and your language preference are kept in your browser's local storage. They never
      reach us, and clearing your browser data removes them.</li>
</ul>

<h2>What we do not collect</h2>
<ul>
  <li>No payment or card details — nothing on this site costs money.</li>
  <li>No marks, grades or documents. The Admission Predictor works out your result in your
      browser and we never receive the number you type.</li>
  <li>No CNIC, address or phone number.</li>
</ul>

<h2>Who else sees it</h2>
<p>We do not sell your data and we do not share it with advertisers. It reaches only the services
that run the site: Supabase (database and accounts), Google Analytics (visit statistics) and
Cloudflare (hosting and delivery). Each holds it under its own terms.</p>

<h2>Cookies</h2>
<p>We set no advertising cookies. Google Analytics sets its own cookies to tell repeat visits from
new ones; blocking them in your browser does not stop the site working.</p>

<h2>Your choices</h2>
<ul>
  <li>Ask us to delete your account and everything attached to it — email
      <a href="mailto:${CONTACT}">${CONTACT}</a> from the address you signed up with.</li>
  <li>Ask for a copy of what your account holds.</li>
  <li>Delete a review or question you posted, from the university's page while signed in.</li>
  <li>Use the site with an ad blocker or analytics blocker — everything still works.</li>
</ul>

<h2>Children</h2>
<p>This site is aimed at students applying to university, generally 16 and over. We do not
knowingly create accounts for children under 13. If you believe we have, write to us and we
will remove it.</p>

<h2>Changes</h2>
<p>If this page changes we will update the date at the top. Substantial changes will be noted
on the site itself.</p>

<h2>Contact</h2>
<p>Email <a href="mailto:${CONTACT}">${CONTACT}</a> or message us on
<a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>.</p>
`;

const TERMS = `
<p>By using TaleemPK you accept what follows. It is short on purpose.</p>
${NOTE}

<h2>What this site is</h2>
<p>TaleemPK collects publicly available information about universities in Pakistan — fees, merit
criteria, entry tests, programmes and deadlines — and puts it in one place so you can compare it.
It is free, and we intend to keep it free.</p>

<h2>What this site is not</h2>
<p>We are not affiliated with the Higher Education Commission or with any university listed here.
We cannot process your application, influence an admission decision, or tell you whether you will
be accepted. Nobody at TaleemPK can get you a seat, and anyone claiming otherwise is not us.</p>

<h2>Accuracy</h2>
<p>We check the data and correct it when we find it wrong, but universities change fees and merit
rules whenever they like, and sometimes without announcing it. <strong>Always confirm on the
university's own website or admissions office before you apply, pay anything, or make a
decision.</strong> The Admission Predictor is an estimate from past merit figures, not a promise.</p>

<h2>Your account</h2>
<ul>
  <li>Keep your password to yourself; what happens under your account is your responsibility.</li>
  <li>One person, one account.</li>
  <li>We may suspend an account being used to post abuse, spam or impersonation.</li>
</ul>

<h2>What you post</h2>
<p>Reviews and questions are yours, and you keep them. By posting you allow us to display them on
this site. Do not post anything false, abusive, defamatory, or anything that identifies someone
else without their consent. We remove content that breaks this, and we may remove a review we
have good reason to believe is fake.</p>

<h2>What you may not do</h2>
<ul>
  <li>Scrape or bulk-copy the site to rebuild it elsewhere.</li>
  <li>Try to break, overload or gain unauthorised access to the site or its database.</li>
  <li>Present our data as your own.</li>
</ul>
<p>Quoting a figure with a link back to the page is fine and welcome.</p>

<h2>Liability</h2>
<p>The site is provided as it is. We are not liable for a decision you make from information here,
including a missed deadline, a fee that turned out different, or an application that did not
succeed. This does not limit any liability that cannot be limited by law.</p>

<h2>Changes</h2>
<p>We may change these terms; the date at the top says when we last did. Continuing to use the
site means you accept the current version.</p>

<h2>Governing law</h2>
<p>These terms are governed by the laws of Pakistan.</p>

<h2>Contact</h2>
<p>Email <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
`;

const DISCLAIMER = `
<p>Read this before you rely on anything on this site for an admission decision.</p>
${NOTE}

<h2>We are not HEC, and not a university</h2>
<p>TaleemPK is an independent site. We have no affiliation with, endorsement from, or authority
delegated by the Higher Education Commission of Pakistan or by any university, college or
institute listed here. University names and logos belong to those institutions and are used only
to identify them.</p>

<h2>"HEC-recognized" means what HEC says</h2>
<p>Where a university is described as HEC-recognized, that reflects HEC's own published list at
the time we recorded it. Recognition status changes, and a charter can be granted, suspended or
withdrawn. <strong>Check the current status on
<a href="https://www.hec.gov.pk" target="_blank" rel="noopener nofollow">hec.gov.pk</a></strong>
before you enrol anywhere.</p>

<h2>Fees and merit change</h2>
<p>Fees, merit formulas, entry test requirements, seat counts and deadlines on this site are
collected from university websites and prospectuses. They go out of date. A figure here may be
from a previous intake even where we have tried to keep it current. The university's own
admissions office is the only authority on what it charges and what it requires.</p>

<h2>The Admission Predictor estimates</h2>
<p>It compares the aggregate you enter against recorded past merit figures. Actual merit moves
every year with the number of applicants and the difficulty of the test. Treat the result as a
rough shortlist, never as a prediction of admission.</p>

<h2>Reviews are opinions</h2>
<p>Reviews and answers are written by visitors and represent their views, not ours. We moderate
what is reported to us but we cannot verify every account.</p>

<h2>Links to other sites</h2>
<p>We link to university websites and official portals for your convenience. We do not control
them and are not responsible for what they contain.</p>

<h2>Tell us when we are wrong</h2>
<p>If a figure here is wrong, write to <a href="mailto:${CONTACT}">${CONTACT}</a> or message us on
<a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>. Wrong data is
worse than no data, and we would rather fix it than leave it up.</p>
`;

const PAGES = [
  { slug: 'privacy', h1: 'Privacy Policy', title: 'Privacy Policy | TaleemPK',
    desc: 'What TaleemPK collects, why, and what you can ask us to delete.', body: PRIVACY },
  { slug: 'terms', h1: 'Terms of Use', title: 'Terms of Use | TaleemPK',
    desc: 'The terms you accept by using TaleemPK — what the site is, and what it is not.', body: TERMS },
  { slug: 'disclaimer', h1: 'HEC & Data Disclaimer', title: 'HEC & Data Disclaimer | TaleemPK',
    desc: 'TaleemPK is independent of HEC and of every university listed. Fees and merit change — verify before you apply.', body: DISCLAIMER },
];

for (const p of PAGES) {
  fs.writeFileSync(path.join(ROOT, p.slug + '.html'), page(p));
  console.log('wrote', p.slug + '.html');
}

// Sitemap
const sm = path.join(ROOT, 'sitemap.xml');
let xml = fs.readFileSync(sm, 'utf8');
let added = 0;
for (const p of PAGES) {
  const loc = `${SITE}/${p.slug}`;
  if (!xml.includes(`<loc>${loc}</loc>`)) {
    xml = xml.replace('</urlset>', `<url><loc>${loc}</loc><lastmod>${UPDATED}</lastmod>`
      + `<changefreq>yearly</changefreq><priority>0.3</priority></url></urlset>`);
    added++;
  }
}
if (added) { fs.writeFileSync(sm, xml); console.log(`sitemap: ${added} urls added`); }
