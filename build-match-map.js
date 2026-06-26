// Matches TaleemPK Supabase universities (id 1-218) to the Kaggle dataset
// universities (university_id 1-266) by abbreviation + full name.
// Writes match-map.json: { taleempk_id: dataset_university_id }
// Run: node build-match-map.js
const https = require('https');
const fs = require('fs');

const SB = 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';

function getSB(p){return new Promise((res,rej)=>{https.get(`${SB}/rest/v1/${p}`,{headers:{apikey:ANON,Authorization:'Bearer '+ANON}},r=>{let d='';r.on('data',c=>c&&(d+=c));r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej)})}

// minimal CSV parser (handles quoted fields with commas)
function parseCSV(text){
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++} else q=false } else cur+=c }
    else { if(c==='"')q=true; else if(c===','){row.push(cur);cur=''} else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur=''} else if(c==='\r'){} else cur+=c }
  }
  if(cur||row.length){row.push(cur);rows.push(row)}
  return rows;
}
function csvObjects(file){
  const rows=parseCSV(fs.readFileSync(file,'utf8'));
  const head=rows[0].map(h=>h.replace(/^﻿/,'').trim());
  return rows.slice(1).filter(r=>r.some(c=>c&&c.trim())).map(r=>{const o={};head.forEach((h,i)=>o[h]=(r[i]||'').trim());return o});
}

const norm = s => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
// Strip ONLY truly generic structural words — keep distinctive domain words
// (national, computer, sciences, technology, agriculture…) so short cores like
// "national" can't false-match unrelated unis (FAST vs NUST bug).
const normName = s => (s||'').toLowerCase()
  .replace(/\b(university|institute|of|the|college|for|and)\b/g,'')
  .replace(/[^a-z0-9]+/g,'');

(async()=>{
  const tpk = await getSB('institutions?select=id,name,full_name&order=id&limit=500');
  const ds  = csvObjects('Universities.csv'); // university_id, university_name, Abbreviation
  console.log(`TaleemPK unis: ${tpk.length} | Dataset unis: ${ds.length}`);

  // index dataset by abbreviation + normalised full name
  const byAbbr={}, byName={};
  ds.forEach(d=>{
    const id=parseInt(d.university_id);
    if(d.Abbreviation) byAbbr[norm(d.Abbreviation)]=id;
    if(d.university_name) byName[normName(d.university_name)]=id;
  });

  const map={}; const unmatched=[];
  tpk.forEach(u=>{
    let dsId = byAbbr[norm(u.name)]                    // 1. abbreviation == name
            || byName[normName(u.full_name)]           // 2. full name match
            || byName[normName(u.name)]                // 3. name as full
            || null;
    // 4. loose: substantial bidirectional containment with a length guard
    //    (both cores must be long, and the shorter must be >=70% of the longer)
    if(!dsId && u.full_name){
      const core=normName(u.full_name);
      if(core.length>=10){
        const hit=ds.find(d=>{
          const dc=normName(d.university_name);
          if(dc.length<10) return false;
          const [shortS,longS] = core.length<=dc.length ? [core,dc] : [dc,core];
          return longS.includes(shortS) && shortS.length/longS.length>=0.7;
        });
        if(hit)dsId=parseInt(hit.university_id);
      }
    }
    if(dsId) map[u.id]=dsId; else unmatched.push(`${u.id}: ${u.name} (${u.full_name})`);
  });

  const matched=Object.keys(map).length;
  fs.writeFileSync('match-map.json', JSON.stringify(map,null,0));
  console.log(`\nMatched: ${matched}/${tpk.length} (${Math.round(matched/tpk.length*100)}%)`);
  console.log(`Unmatched: ${unmatched.length}`);
  unmatched.slice(0,40).forEach(u=>console.log('  ✗ '+u));
  console.log('\nWrote match-map.json');
})().catch(e=>{console.error('FAILED:',e.message);process.exit(1)});
