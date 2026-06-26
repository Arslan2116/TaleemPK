// Generates sql/06-insert-new-unis.sql — INSERT statements for the genuinely-new
// universities (new-unis.json) with all fields the Kaggle dataset provides:
// name, full_name, type, sector, city, province, website, programs[], tags[],
// icon, description. Fee/rank/established are left NULL for the nightly data agent
// to enrich later. Run AFTER build-missing-unis.js. User runs the SQL in Supabase.
const fs=require('fs');
function pc(t){const rows=[];let row=[],cur='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}else{if(c==='"')q=true;else if(c===','){row.push(cur);cur=''}else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur=''}else if(c==='\r'){}else cur+=c}}if(cur||row.length){row.push(cur);rows.push(row)}return rows}
function obj(f){const r=pc(fs.readFileSync(f,'utf8'));const h=r[0].map(x=>x.replace(/^﻿/,'').trim());return r.slice(1).filter(x=>x.some(c=>c&&c.trim())).map(x=>{const o={};h.forEach((k,i)=>o[k]=(x[i]||'').trim());return o})}

const news=JSON.parse(fs.readFileSync('new-unis.json','utf8'));
const deps=obj('Departments.csv');
const depByUni={};
deps.forEach(d=>{const id=parseInt(d.university_id);if(!d.department_name)return;(depByUni[id]=depByUni[id]||new Set()).add(d.department_name)});

const q = s => "'" + String(s==null?'':s).replace(/'/g,"''") + "'";
const arr = list => list.length ? "ARRAY[" + list.map(q).join(',') + "]::text[]" : "'{}'::text[]";
// Title-case names that arrive in ALL CAPS (e.g. "INSTITUTE OF SOUTHERN PUNJAB")
function fixName(s){
  if(!s) return s;
  const letters=s.replace(/[^A-Za-z]/g,'');
  const upper=(s.match(/[A-Z]/g)||[]).length;
  if(letters && upper/letters.length > 0.7){
    return s.toLowerCase().replace(/\b([a-z])/g,(m,c)=>c.toUpperCase())
      .replace(/\b(Of|And|The|For|In|At)\b/g,m=>m.toLowerCase())
      .replace(/^([a-z])/,(m,c)=>c.toUpperCase());
  }
  return s;
}
function sectorOf(t){ return /public|govt|government/i.test(t||'') ? 'public' : 'private'; }
function tagsFor(sector, progs){
  const blob=progs.join(' ').toLowerCase();
  const tags=[sector];
  if(/engineer/.test(blob)) tags.push('engineering');
  if(/medic|health|nursing|pharm|dental|veterinary|medical/.test(blob)) tags.push('medical');
  if(/business|management|commerce|account|finance|bba|mba/.test(blob)) tags.push('business');
  if(/computer|software|computing|\bcs\b|artificial|data scien|information tech/.test(blob)) tags.push('cs');
  if(/\blaw\b|legal/.test(blob)) tags.push('law');
  if(/art|design|architect|media|fashion/.test(blob)) tags.push('arts');
  if(/agricultur/.test(blob)) tags.push('agriculture');
  return [...new Set(tags)];
}

let out =
`-- ============================================================================
-- 06-insert-new-unis.sql  —  add ${news.length} universities from the Kaggle dataset
-- not previously in TaleemPK (de-duped against all 218 existing institutions).
-- id is auto-assigned. fee/rank/established left NULL for the nightly data agent.
-- Run in Supabase SQL Editor (admin). Idempotent: skips a row whose name+city
-- already exists, so re-running is safe.
-- ============================================================================
\n`;

news.forEach(u=>{
  const dsId=parseInt(u.university_id);
  const progs=[...(depByUni[dsId]||new Set())].slice(0,30);
  const name=u.Abbreviation || u.university_name;
  const full=fixName(u.university_name);
  const sector=sectorOf(u.university_type);
  const type='university';   // `type` is always 'university' in TaleemPK; public/private lives in `sector`
  const tags=tagsFor(sector, progs);
  const desc=`${full} is a ${sector} ${/college|institute|academy/i.test(full)?'institution':'university'} located in ${u.city}${u.province?', '+u.province:''}, Pakistan.`;
  out +=
`INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT ${q(name)}, ${q(full)}, ${q(type)}, ${q(sector)}, ${q(u.city)}, ${q(u.province)}, ${u.official_website?q(u.official_website):'NULL'}, '🏛️', ${arr(progs)}, ${arr(tags)}, ${q(desc)}
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower(${q(name)}) AND lower(city)=lower(${q(u.city)}));\n`;
});

out += `\n-- After running: re-run build-match-map.js → build-merit-data.js → build-gpa-data.js\n-- → build-university-pages.js → build-seo-pages.js → generate-sitemap.js, then commit.\n`;

if(!fs.existsSync('sql')) fs.mkdirSync('sql');
fs.writeFileSync('sql/06-insert-new-unis.sql', out);
console.log(`Wrote sql/06-insert-new-unis.sql — ${news.length} INSERTs`);
// preview first 2
console.log('\n--- preview ---\n'+out.split('\n').slice(8,16).join('\n'));
