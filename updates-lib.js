/* ───────────────────────────────────────────────────────────────
   TaleemPK — scraped-update helpers, shared by the university pages
   and the /updates feed. Loaded before university.js / updates.html.
   The junk filter mirrors scrape.py's is_junk — keep the two in sync.
   ─────────────────────────────────────────────────────────────── */
const UPD_CATS = [
  { key:'merit',    icon:'📊', label:'Merit Lists & Results', re:/merit\s*list|result|selected\s*candidates|selection\s*list/i },
  { key:'deadline', icon:'⏰', label:'Deadlines & Tests',      re:/deadline|last\s*date|date\s*extended|entry\s*test|admission\s*test|test\s*date|\bnat\b|\bnts\b|roll\s*(no|number|slip)|schedule/i },
  { key:'fee',      icon:'💰', label:'Fee Updates',            re:/fee\b|fees\b|fee\s*structure|dues|challan/i },
  { key:'program',  icon:'📚', label:'New Programs',           re:/new\s*program|launch|introduc|now\s*offering|degree\s*program|phd\s*program|ms\s*program/i },
  { key:'admission',icon:'🎓', label:'Admissions & Notices',   re:/admission|apply|open|notice|prospectus|induction|registration/i },
];
// Display-time junk guard (mirrors the scraper filter) — so even if something slips
// into the DB, it never appears on a university page. Keep in sync with scrape.py is_junk.
const UPD_HARD = /(recruit|vacanc|\bhiring\b|\blecturer\b|\bprofessor\b|position[s]?\s*(of|for)|of\s*lecturer|appointment|tender|quotation|procurement|committee\s*meeting|\bminutes\b|dissertation|thesis\s*defen|\bviva\b|pedagogical|non[-\s]*teaching|\bpromotion\b|\b(19\d2|200\d|201\d|202[0-4])\b)/i;
const UPD_USEFUL = /(scholarship|merit\s*list|fee\s*structure|admission.*open|admissions?\s*(fall|spring|20[2-9]\d)|entry\s*test|last\s*date|deadline|apply\s*by|test\s*date|test.*announc|result.*announc|fellowship)/i;
const UPD_ACADEMIC = /(summer\s*vacation|winter\s*vacation|academic\s*calendar|teaching\s*faculty|faculty\s*member|semester[-\s]*(i{1,3}|iv|v|\d)|semester\s*exam|examination\s*notification|exam\s*20\d\d|date\s*sheet|time\s*table|syllabus|convocation|seminar|workshop|webinar|guest\s*lecture|\bsports\b|society|\bclub\b|roll\s*(no|number)?\s*slip|visiting\s*faculty|list\s*of\s*graduates|certificate\s*course|guidelines?\s*\/?\s*faqs?|department\b|dept\b|instructions\s*(and|for)|dissertation)/i;
function isJunkUpdate(t){
  t = String(t||'').trim();
  if(UPD_HARD.test(t)) return true;
  if(UPD_USEFUL.test(t)) return false;
  if(t.length < 15) return true;
  if(UPD_ACADEMIC.test(t)) return true;
  return false;
}
// Parse a date out of a title (e.g. "15 August 2026", "Aug 15, 2026", "15-08-2026")
function updParseDate(text){
  const MON='jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  let m = text.match(new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s+(${MON})[a-z]*\\.?,?\\s*(20\\d{2})?`,'i'))
       || text.match(new RegExp(`(${MON})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(20\\d{2})?`,'i'));
  if(m){
    const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    const dayFirst=/^\d/.test(m[1]);
    const day=parseInt(dayFirst?m[1]:m[2]);
    const mon=months[(dayFirst?m[2]:m[1]).slice(0,3).toLowerCase()];
    const year=m[3]?parseInt(m[3]):new Date().getFullYear();
    if(day>=1&&day<=31) return new Date(year,mon,day);
  }
  const iso=text.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if(iso) return new Date(+iso[1],+iso[2]-1,+iso[3]);
  return null;
}
// Prefer explicit numeric date (the actual deadline) over ambiguous month-name text.
function updNumericDate(t){
  let m = String(t).match(/(20\d{2})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3]);
  m = String(t).match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/);
  if(m) return new Date(+m[3], +m[2]-1, +m[1]);
  return null;
}
// Deadline-type item whose date has passed → expired
function isExpiredUpdate(title){
  const t=String(title||'');
  if(!/deadline|last\s*date|last\s*day|apply\s*by|closing|admission[s]?\s*close|extended\s*(till|to|upto)|till\s+\d/i.test(t)) return false;
  const d=updNumericDate(t) || updParseDate(t);
  if(!d) return false;
  return d < new Date(Date.now() - 86400000); // >1 day past
}
function classifyUpdate(title, kind){
  const t = String(title||'');
  if(kind === 'fee') return UPD_CATS[2];
  if(kind === 'deadline') return UPD_CATS[1];
  for(const c of UPD_CATS){ if(c.re.test(t)) return c; }
  return { key:'other', icon:'📢', label:'Other Announcements' };
}
