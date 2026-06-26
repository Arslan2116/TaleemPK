// Finds Kaggle-dataset universities genuinely absent from TaleemPK (not just
// unmatched by the strict matcher), de-duping against ALL 218 existing unis with a
// lenient token/abbr/city comparison. Prints: NEW (safe to insert) vs DUP (already
// exists under a different name — skip). Writes new-unis.json for the SQL builder.
const https=require('https'), fs=require('fs');
const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';
function getSB(p){return new Promise((res,rej)=>{https.get('https://vpioffkkzwbfnmpxpwgc.supabase.co/rest/v1/'+p,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}},r=>{let d='';r.on('data',c=>c&&(d+=c));r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej)})}
function pc(t){const rows=[];let row=[],cur='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}else{if(c==='"')q=true;else if(c===','){row.push(cur);cur=''}else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur=''}else if(c==='\r'){}else cur+=c}}if(cur||row.length){row.push(cur);rows.push(row)}return rows}
function obj(f){const r=pc(fs.readFileSync(f,'utf8'));const h=r[0].map(x=>x.replace(/^﻿/,'').trim());return r.slice(1).filter(x=>x.some(c=>c&&c.trim())).map(x=>{const o={};h.forEach((k,i)=>o[k]=(x[i]||'').trim());return o})}

const STOP=new Set(['university','institute','of','the','college','for','and','sciences','science','technology','&','islamabad','karachi','lahore','pakistan']);
const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const tokens=s=>(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w));
function tokenSim(a,b){const A=new Set(tokens(a)),B=new Set(tokens(b));if(!A.size||!B.size)return 0;let inter=0;A.forEach(x=>{if(B.has(x))inter++});return inter/Math.min(A.size,B.size);}

(async()=>{
  const tpk=await getSB('institutions?select=id,name,full_name,city&limit=500');
  const unis=obj('Universities.csv');
  const map=JSON.parse(fs.readFileSync('match-map.json','utf8'));
  const usedDs=new Set(Object.values(map).map(Number));
  const matchedTpkIds=new Set(Object.keys(map).map(Number));
  const missing=unis.filter(u=>!usedDs.has(parseInt(u.university_id)));
  // A missing dataset uni can ONLY duplicate an UNMATCHED TaleemPK uni — matched
  // ones already have a dataset counterpart. Comparing against all 218 produced
  // false positives via shared generic words ("Management Sciences" etc.).
  const unmatchedTpk=tpk.filter(t=>!matchedTpkIds.has(t.id));
  console.log(`Unmatched TaleemPK unis to dedup against: ${unmatchedTpk.length}`);

  // Manually-confirmed duplicates the fuzzy matcher mis-assigned (verified against
  // the 25 unmatched TaleemPK unis by city + distinctive name).
  const MANUAL_DUP=new Set(['CITYUNIVERSITY','IBA-SUK','SBBUVAS','SMBBMU','SABSU']);

  const NEW=[], DUP=[];
  missing.forEach(d=>{
    if(MANUAL_DUP.has(d.Abbreviation)){ DUP.push({d,best:{name:'(manual)',full_name:'confirmed duplicate'},bestScore:'1.00'}); return; }
    let best=null, bestScore=0;
    unmatchedTpk.forEach(t=>{
      const s1=tokenSim(d.university_name, t.full_name);
      const s2=tokenSim(d.university_name, t.name);
      const abbrEq = norm(d.Abbreviation)===norm(t.name) ? 1 : 0;
      const sc=Math.max(s1,s2,abbrEq);
      if(sc>bestScore){bestScore=sc;best=t;}
    });
    const sameCity = best && norm(best.city)===norm(d.city);
    if(bestScore>=0.8 || (bestScore>=0.6 && sameCity)){
      DUP.push({d, best, bestScore:bestScore.toFixed(2)});
    } else {
      NEW.push({d, nearest:best?best.name:'-', score:bestScore.toFixed(2)});
    }
  });

  console.log(`Missing: ${missing.length}  →  NEW (insert): ${NEW.length}  |  DUP (skip): ${DUP.length}\n`);
  console.log('=== LIKELY DUPLICATES (already in TaleemPK — will SKIP) ===');
  DUP.forEach(x=>console.log(`  ~${x.bestScore}  ${x.d.Abbreviation} "${x.d.university_name}"  ≈  TaleemPK "${x.best.name}" (${x.best.full_name})`));
  console.log('\n=== GENUINELY NEW (will INSERT) ===');
  NEW.forEach(x=>console.log(`  +  ${x.d.Abbreviation.padEnd(14)} ${x.d.city.padEnd(14)} ${x.d.university_name}   [nearest TaleemPK: ${x.nearest} ${x.score}]`));

  fs.writeFileSync('new-unis.json', JSON.stringify(NEW.map(x=>x.d),null,0));
  console.log(`\nWrote new-unis.json (${NEW.length} unis)`);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
