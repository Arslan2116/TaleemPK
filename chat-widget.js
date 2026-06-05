/* ───────────────────────────────────────────────────────────────
   TaleemPK Assistant — floating chat widget
   Loaded on index.html + university.html. Talks to the Cloudflare
   Worker (set CHAT_API below to your Worker URL).
   ─────────────────────────────────────────────────────────────── */
(function(){
  const CHAT_API = (window.TPK_CONFIG && window.TPK_CONFIG.CHAT_API)
    || 'https://api.taleempk.pk/';

  const STORAGE_KEY  = 'tpk_chat_msgs';
  const MAX_HISTORY  = 8;     // last N turns kept in memory + storage
  const MAX_CHARS    = 1500;  // per-message char cap when persisting
  let messages = [];
  try{ messages = JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'[]'); }catch(e){}

  // ── Inject styles
  const css = `
    .tpk-chat-fab{ position:fixed; right:20px; bottom:20px; z-index:900; /* chat-fab */
      width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#00C853,#00A040); color:#0A1628;
      box-shadow:0 12px 30px rgba(0,200,83,.35); font-size:1.6rem;
      display:flex; align-items:center; justify-content:center; transition:transform .2s; }
    .tpk-chat-fab:hover{ transform:scale(1.08); }
    .tpk-chat-fab .tpk-badge{ position:absolute; top:-2px; right:-2px;
      background:#FF4757; color:#fff; font-size:.6rem; font-weight:800;
      padding:2px 6px; border-radius:10px; }
    .tpk-chat-panel{ position:fixed; right:20px; bottom:90px; z-index:901; /* chat-panel */
      width:380px; max-width:calc(100vw - 32px); height:560px; max-height:calc(100vh - 110px);
      background:#fff; border-radius:18px; box-shadow:0 22px 60px rgba(10,22,40,.28);
      display:none; flex-direction:column; overflow:hidden; font-family:'Sora',system-ui,sans-serif; color:#0A1628; }
    .tpk-chat-panel.open{ display:flex; }
    .tpk-chat-head{ background:#0A1628; color:#fff; padding:14px 16px;
      display:flex; align-items:center; gap:10px; }
    .tpk-chat-avatar{ width:36px; height:36px; border-radius:50%; background:#00C853;
      display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
    .tpk-chat-title{ font-weight:800; font-size:.95rem; line-height:1.1; }
    .tpk-chat-sub{ font-size:.7rem; color:rgba(255,255,255,.6); display:flex; align-items:center; gap:5px; }
    .tpk-chat-sub::before{ content:''; width:7px; height:7px; border-radius:50%; background:#00C853; box-shadow:0 0 6px #00C853; }
    .tpk-chat-x{ margin-left:auto; background:transparent; border:none; color:#fff; font-size:1.2rem; cursor:pointer; opacity:.7; }
    .tpk-chat-x:hover{ opacity:1; }
    .tpk-chat-body{ flex:1; overflow-y:auto; padding:16px; background:#F5F7FA; }
    .tpk-msg{ margin-bottom:10px; max-width:85%; padding:10px 13px; border-radius:14px; font-size:.88rem; line-height:1.5; }
    .tpk-msg.user{ background:#0A1628; color:#fff; margin-left:auto; border-bottom-right-radius:5px; }
    .tpk-msg.bot{ background:#fff; color:#0A1628; border:1px solid #E8ECF2; border-bottom-left-radius:5px; }
    .tpk-msg a{ color:#00A040; text-decoration:underline; }
    .tpk-typing{ display:inline-flex; gap:4px; padding:8px 0; }
    .tpk-typing span{ width:6px; height:6px; border-radius:50%; background:#9BA5B5; animation:tpk-dot 1s infinite ease-in-out; }
    .tpk-typing span:nth-child(2){ animation-delay:.15s; }
    .tpk-typing span:nth-child(3){ animation-delay:.3s; }
    @keyframes tpk-dot{ 0%,80%,100%{ transform:scale(.6); opacity:.4; } 40%{ transform:scale(1); opacity:1; } }
    .tpk-suggest{ display:flex; flex-wrap:wrap; gap:6px; padding:10px 16px; background:#fff; border-top:1px solid #E8ECF2; }
    .tpk-suggest button{ background:#F5F7FA; border:1px solid #E8ECF2; border-radius:30px;
      padding:6px 12px; font-size:.74rem; font-weight:600; color:#5A6478; cursor:pointer; font-family:inherit; }
    .tpk-suggest button:hover{ border-color:#00C853; color:#0A1628; }
    .tpk-chat-input{ display:flex; gap:8px; padding:12px; background:#fff; border-top:1px solid #E8ECF2; }
    .tpk-chat-input textarea{ flex:1; resize:none; min-height:42px; max-height:120px;
      padding:10px 12px; border:1.5px solid #E8ECF2; border-radius:10px;
      font-family:inherit; font-size:.88rem; color:#0A1628; outline:none; }
    .tpk-chat-input textarea:focus{ border-color:#00C853; }
    .tpk-chat-input button{ background:#00C853; color:#0A1628; border:none; border-radius:10px;
      padding:0 16px; font-weight:800; cursor:pointer; font-family:inherit; }
    .tpk-chat-input button:disabled{ opacity:.5; cursor:wait; }
    .tpk-disclaimer{ font-size:.65rem; color:#9BA5B5; text-align:center; padding:6px 10px; background:#fff; border-top:1px solid #E8ECF2; }
    /* Hide FAB when panel is open so it doesn't overlap input */
    body.tpk-chat-open .tpk-chat-fab,
    body:has(.tpk-chat-panel.open) .tpk-chat-fab{ display:none; }
    /* Prevent background scroll when chat fullscreen on mobile */
    @media(max-width:600px){
      body.tpk-chat-open{ overflow:hidden; }
    }
    /* On the university page on mobile a sticky action bar exists at the bottom — lift the FAB above it */
    body.has-sticky .tpk-chat-fab{ bottom:78px; }
    body.has-sticky .tpk-chat-panel{ bottom:148px; }
    @media(max-width:600px){
      /* Full-screen chat on mobile — no awkward gaps, no overlap */
      .tpk-chat-panel{
        right:0; left:0; bottom:0; top:0;
        width:100vw; max-width:100vw;
        height:100vh; max-height:100vh;
        height:100dvh; max-height:100dvh; /* dynamic viewport — accounts for mobile browser chrome */
        border-radius:0;
      }
      body.has-sticky .tpk-chat-panel{ bottom:0; height:100dvh; }
      .tpk-chat-head{ padding:12px 14px; padding-top:max(12px, env(safe-area-inset-top)); }
      .tpk-chat-body{ padding:12px; }
      .tpk-suggest{ padding:8px 12px; gap:5px; max-height:80px; overflow-x:auto; flex-wrap:nowrap; }
      .tpk-suggest button{ white-space:nowrap; flex-shrink:0; font-size:.72rem; padding:5px 10px; }
      .tpk-chat-input{ padding:10px; padding-bottom:max(10px, env(safe-area-inset-bottom)); }
      .tpk-chat-input textarea{ min-height:40px; font-size:.9rem; }
      .tpk-disclaimer{ display:none; } /* Save vertical space on mobile */
      .tpk-chat-fab{ right:14px; bottom:14px; width:54px; height:54px; font-size:1.4rem; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Inject HTML
  const fab = document.createElement('button');
  fab.className = 'tpk-chat-fab';
  fab.setAttribute('aria-label','Open TaleemPK Assistant');
  fab.innerHTML = '💬<span class="tpk-badge" id="tpkUnreadBadge" style="display:none">1</span>';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'tpk-chat-panel';
  panel.innerHTML = `
    <div class="tpk-chat-head">
      <div class="tpk-chat-avatar">🎓</div>
      <div>
        <div class="tpk-chat-title">TaleemPK Assistant</div>
        <div class="tpk-chat-sub">Online · Asks about universities</div>
      </div>
      <button class="tpk-chat-x" aria-label="Close">×</button>
    </div>
    <div class="tpk-chat-body" id="tpkBody"></div>
    <div class="tpk-suggest" id="tpkSuggest">
      <button>I have 75% in FSc — best CS unis?</button>
      <button>MDCAT prep plan</button>
      <button>CS vs Software Engineering</button>
      <button>Scholarships for MBBS</button>
      <button>Career after BBA</button>
      <button>NUST vs GIKI</button>
    </div>
    <div class="tpk-chat-input">
      <textarea id="tpkInput" placeholder="Ask anything about Pakistani universities…" rows="1"></textarea>
      <button id="tpkSend">Send</button>
    </div>
    <div class="tpk-disclaimer">AI assistant — answers based on TaleemPK's verified data. Verify critical info on official sites.</div>
  `;
  document.body.appendChild(panel);

  const body  = panel.querySelector('#tpkBody');
  const input = panel.querySelector('#tpkInput');
  const send  = panel.querySelector('#tpkSend');
  const suggestEl = panel.querySelector('#tpkSuggest');

  function open(){
    panel.classList.add('open');
    document.body.classList.add('tpk-chat-open');
    document.getElementById('tpkUnreadBadge').style.display='none';
    setTimeout(()=>input.focus(),100);
  }
  function close(){
    panel.classList.remove('open');
    document.body.classList.remove('tpk-chat-open');
  }
  fab.addEventListener('click', ()=> panel.classList.contains('open') ? close() : open());
  panel.querySelector('.tpk-chat-x').addEventListener('click', close);

  // ── Render & escape
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function md(t){
    // very small markdown: **bold**, [text](url), line breaks, • list
    return esc(t)
      .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,t,u)=>{
        const safe = u.startsWith('http') ? u : 'university.html'+u;
        return `<a href="${safe}" target="${u.startsWith('http')?'_blank':'_self'}" rel="noopener">${esc(t)}</a>`;
      })
      .replace(/\n/g,'<br>');
  }

  function renderAll(){
    body.innerHTML = '';
    if(!messages.length){
      body.innerHTML = `<div class="tpk-msg bot">Salam! 👋 I'm <b>TaleemPK Assistant</b> — your education advisor for Pakistan.<br><br>I can help with:<br>🏫 University choice & fees<br>📝 Entry tests (ECAT, MDCAT, NET, NTS…)<br>🎓 Field & career advice<br>💰 Scholarships<br>📊 Comparisons & shortlists<br><br>Try a suggestion below or ask me anything.</div>`;
      return;
    }
    messages.forEach(m=>{
      const d=document.createElement('div');
      d.className='tpk-msg '+(m.role==='user'?'user':'bot');
      d.innerHTML = md(m.content);
      body.appendChild(d);
    });
    body.scrollTop = body.scrollHeight;
  }
  renderAll();

  function addMsg(role, content){
    messages.push({role, content});
    // Trim per-message + total history before persisting to avoid quota exceptions.
    // sessionStorage has a ~5 MB total budget shared with the whole site.
    try{
      const compact = messages.slice(-MAX_HISTORY).map(m => ({
        role: m.role,
        content: String(m.content||'').slice(0, MAX_CHARS)
      }));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    }catch(e){
      // Quota or disabled storage — drop oldest and retry once
      try{
        const compact = messages.slice(-4).map(m => ({ role:m.role, content: String(m.content||'').slice(0,500) }));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
      }catch(_){}
    }
    renderAll();
  }

  async function ask(q){
    if(!q || !q.trim()) return;
    addMsg('user', q.trim());
    input.value=''; send.disabled=true; suggestEl.style.display='none';

    // typing indicator
    const t = document.createElement('div'); t.className='tpk-msg bot'; t.id='tpkTyping';
    t.innerHTML='<div class="tpk-typing"><span></span><span></span><span></span></div>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;

    try{
      const r = await fetch(CHAT_API, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages })
      });
      if(!r.ok) throw new Error('HTTP '+r.status);
      const d = await r.json();
      document.getElementById('tpkTyping')?.remove();
      addMsg('assistant', d.reply || 'Sorry, I could not generate a reply.');
    }catch(e){
      document.getElementById('tpkTyping')?.remove();
      addMsg('assistant', '⚠️ Sorry, I had trouble connecting. Please try again in a moment.');
    }finally{
      send.disabled=false; input.focus();
    }
  }

  // wiring
  send.addEventListener('click', ()=>ask(input.value));
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(input.value); }
  });
  suggestEl.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>ask(b.textContent));
  });

  // Auto-grow textarea
  input.addEventListener('input', ()=>{
    input.style.height='auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
})();
