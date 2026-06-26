// Generates sql/09-batch-enrich-8.sql from a batch JSON of {id, keepName, data}.
// Per uni: UPDATE institutions (only provided fields) + replace fee_details rows.
// Normalizes "field:x"/"sector:x"/"region:x" tags to TaleemPK's flat vocabulary,
// strips [reference:N] citation markers, and skips non-numeric fee amounts.
// Usage: node build-batch-enrich.js <path-to-batch.json>
const fs = require('fs');
const batch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const clean = s => (s == null ? null : String(s).replace(/\s*\[reference:\d+\]/g, '').replace(/\s+\./g, '.').trim());
const q = s => "'" + clean(s).replace(/'/g, "''") + "'";
const arr = list => list.length ? "ARRAY[" + list.map(q).join(',') + "]::text[]" : "'{}'::text[]";

// map dataset "namespace:value" tags → TaleemPK flat tags (filter vocab + descriptors)
const TAGMAP = {
  'computing':'cs','engineering-technology':'engineering','health-sciences':'medical',
  'allied-health':'medical','nursing':'medical','public-health':'medical','psychology':'sciences',
  'commerce':'business','social-sciences':'arts','humanities':'arts','arts-design':'arts',
  'islamic-studies':'islamic','sufism':'islamic','fashion':'arts'
};
function normTags(tags){
  const out = [];
  (tags||[]).forEach(t=>{
    let v = t.includes(':') ? t.split(':')[1] : t;
    v = TAGMAP[v] || v;
    if(v==='kpk') v='kpk';
    out.push(v);
  });
  return [...new Set(out)];
}

let sql = `-- ============================================================================
-- 09-batch-enrich-8.sql — enrich 8 existing universities with full official data.
-- All target existing rows by id (verified); names/slugs unchanged. Run in Supabase.
-- ============================================================================\n`;

batch.forEach(u => {
  const d = u.data, id = u.id;
  const set = [];
  if(d.identity.full_name) set.push(`full_name = ${q(d.identity.full_name)}`);
  if(d.identity.website)   set.push(`website = ${q(d.identity.website)}`);
  if(d.identity.established) set.push(`established = ${parseInt(d.identity.established)}`);
  const m = d.money||{};
  if(m.fee)      set.push(`fee = ${q(m.fee)}`);
  set.push(`fee_num = ${m.fee_num==null?'NULL':parseInt(m.fee_num)}`);
  if(m.fee_year) set.push(`fee_year = ${q(m.fee_year)}`);
  if(m.fee_note) set.push(`fee_note = ${q(m.fee_note)}`);
  const a = d.admissions||{};
  if(a.entry) set.push(`entry = ${q(a.entry)}`);
  if(a.merit) set.push(`merit = ${q(a.merit)}`);
  if(a.seats) set.push(`seats = ${q(a.seats)}`);
  if(d.programs && d.programs.length) set.push(`programs = ${arr(d.programs)}`);
  const tags = normTags(d.tags);
  if(tags.length) set.push(`tags = ${arr(tags)}`);
  const e = d.extras||{};
  if(e.scholarships) set.push(`scholarships = ${q(e.scholarships)}`);
  if(e.hostel) set.push(`hostel = ${q(e.hostel)}`);
  if(e.description) set.push(`description = ${q(e.description)}`);
  if(e.highlights && e.highlights.length) set.push(`highlights = ${arr(e.highlights)}`);

  sql += `\n-- #${id} ${u.keepName} — ${d.identity.full_name}\n`;
  sql += `UPDATE institutions SET\n  ${set.join(',\n  ')}\nWHERE id = ${id};\n`;

  const fd = (m.fee_details||[]).filter(r => typeof r.amount === 'number');
  sql += `DELETE FROM fee_details WHERE institution_id = ${id};\n`;
  if(fd.length){
    sql += `INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES\n`;
    sql += fd.map((r,i)=>`  (${id}, ${q(r.description)}, ${parseInt(r.amount)}, ${i})`).join(',\n') + ';\n';
  }
});

sql += `\n-- After running: node build-university-pages.js && node generate-sitemap.js, then commit.\n`;
if(!fs.existsSync('sql')) fs.mkdirSync('sql');
fs.writeFileSync('sql/09-batch-enrich-8.sql', sql);
console.log(`Wrote sql/09-batch-enrich-8.sql — ${batch.length} universities`);
console.log('Total fee_detail rows:', batch.reduce((n,u)=>n+(u.data.money.fee_details||[]).filter(r=>typeof r.amount==='number').length,0));
