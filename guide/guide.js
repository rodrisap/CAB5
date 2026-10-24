/* FSM Study Guide — CodePath-style course site */
(function () {
  var G = window.FSM_GUIDE, FSM = window.FSM, R = window.FSMReader;
  var esc = FSM.fmt.esc;
  var pageEl = document.getElementById('page'), side = document.getElementById('sidebar'), scrim = document.getElementById('scrim');

  /* ---------- storage ---------- */
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var done = load('fsm.guide.done');

  /* ---------- theme ---------- */
  function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  try { applyTheme(localStorage.getItem('fsm.theme')); } catch (e) {}
  document.getElementById('themeBtn').onclick = function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark'; applyTheme(next); try { localStorage.setItem('fsm.theme', next); } catch (e) {}
  };

  /* ---------- pages & order ---------- */
  var byId = {}; G.pages.forEach(function (p) { byId[p.id] = p; });
  byId.books = { id: 'books', group: 'Start', title: 'My books', special: 'books' };
  byId.formulas = { id: 'formulas', group: 'Start', title: 'Formula sheet', special: 'formulas' };
  byId.glossary = { id: 'glossary', group: 'Start', title: 'Glossary', special: 'glossary' };
  byId.notes = { id: 'notes', group: 'Start', title: 'My notes', special: 'notes' };
  byId.cards = { id: 'cards', group: 'Start', title: 'Flashcards', special: 'cards' };
  var FC = window.FSMCards;
  var NT = window.FSMNotes;
  var NAV = [
    { g: 'Start', ids: ['start', 'notes', 'cards', 'books', 'formulas', 'glossary'] },
    { g: 'Managerial Finance · 70%', ids: ['fin_w1', 'fin_w2', 'fin_w3', 'fin_w4', 'fin_w5', 'fin_w6', 'case', 'exam'] },
    { g: 'Supply Chain Management · 30%', ids: ['scm_ch1', 'scm_ch2', 'scm_ch3', 'scm_ch5', 'scm_ch9', 'scm_ch11'] }
  ];
  var ORDER = []; NAV.forEach(function (n) { ORDER = ORDER.concat(n.ids); });
  var STUDY = ORDER.filter(function (id) { return byId[id] && !byId[id].special || id === 'exam'; });

  function renderSidebar(cur) {
    var n = STUDY.filter(function (id) { return done['page:' + id]; }).length;
    var dueN = FC.due().length;
    var h = (dueN ? '<button type="button" class="due-banner" id="sbReview">🃏 <b>' + dueN + '</b> flashcard' + (dueN === 1 ? '' : 's') + ' due · review now</button>' : '') + '<div class="prog small muted">' + n + ' / ' + STUDY.length + ' sections done</div><div class="prog bar"><i style="width:' + Math.round(100 * n / STUDY.length) + '%"></i></div>';
    var cnt = {}; NT.all().forEach(function (x) { cnt[x.page] = (cnt[x.page] || 0) + 1; });
    NAV.forEach(function (sec) {
      h += '<h4>' + sec.g + '</h4>';
      sec.ids.forEach(function (id) {
        var p = byId[id]; if (!p) return;
        h += '<a href="#' + id + '" class="' + (id === cur ? 'active' : '') + '"><span><span class="wk">' + esc(p.label || '') + '</span> ' + esc(p.title) + '</span>' + '<span>' + (id === 'cards' ? (FC.due().length ? '<span class="ndue">' + FC.due().length + ' due</span>' : (FC.all().length ? '<span class="ncount">' + FC.all().length + '</span>' : '')) : id === 'notes' ? (NT.all().length ? '<span class="ncount">' + NT.all().length + '</span>' : '') : (cnt[id] ? '<span class="ncount" title="Your notes">✎' + cnt[id] + '</span>' : '')) + (done['page:' + id] ? '<span class="done">✓</span>' : '') + '</span></a>';
      });
    });
    side.innerHTML = h;
    var sbr = document.getElementById('sbReview'); if (sbr) sbr.onclick = function () { closeMenu(); FC.review(); };
  }
  function closeMenu() { side.classList.remove('open'); scrim.classList.remove('open'); }
  document.getElementById('menuBtn').onclick = function () { side.classList.add('open'); scrim.classList.add('open'); };
  scrim.onclick = closeMenu;

  /* ---------- reading rows ---------- */
  function pagesFor(r) { return R.pages(r.id) || (r.pages ? { from: r.pages[0], to: r.pages[1], preset: true } : null); }
  var READ = {};
  function summaryHTML(id) {
    var S = (window.FSM_SUMMARIES || {})[id]; if (!S) return '';
    var h = '';
    if (S.exec) h += '<div class="sum-exec"><div class="sum-label">Executive summary</div>' + S.exec.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div><div class="sum-label">Double-check</div>';
    h += '<p class="sum-big">In one line: ' + S.big + '</p>';
    S.parts.forEach(function (pt) { h += '<h4>' + pt.h + '</h4><ul>' + pt.li.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; });
    if (S.example) h += '<div class="sum-ex">' + exampleHTML('Example — try it first', S.example.q, S.example.steps) + '</div>';
    if (S.remember) h += '<div class="sum-rem"><b>Remember for the exam</b><ul>' + S.remember.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    return h;
  }
  function readingRow(r) {
    READ[r.id] = r;
    var pg = pagesFor(r), link = R.link(r.book);
    var book = R.BOOKS[r.book];
    return '<div class="reading' + (done['read:' + r.id] ? ' done' : '') + '" data-rid="' + r.id + '" data-book="' + r.book + '">' +
      '<div class="meta"><b>' + esc(r.ref) + ' — ' + esc(r.title) + '</b><small>' + esc(book.title) + (pg ? ' · PDF pages ' + pg.from + '–' + pg.to + (pg.preset ? ' (pre-set for your PDF)' : '') : '') + '</small>' + (r.note ? '<div class="small">' + esc(r.note) + '</div>' : '') + '</div>' +
      '<div class="acts">' + ((window.FSM_SUMMARIES || {})[r.id] ? '<button type="button" class="ghost act-sum">Summary</button>' : '') + '<button type="button" class="act-open">Open in my book</button><button type="button" class="ghost act-pages">' + (pg ? 'Edit pages' : 'Set pages') + '</button>' +
      '<label class="check"><input type="checkbox" class="act-done"' + (done['read:' + r.id] ? ' checked' : '') + '> Read</label></div>' +
      '<div class="pages-form" style="display:none;flex-basis:100%"><span class="small">PDF pages</span><input type="number" min="1" class="pf-from" value="' + (pg ? pg.from : '') + '" placeholder="from"><input type="number" min="1" class="pf-to" value="' + (pg ? pg.to : '') + '" placeholder="to"><button type="button" class="ghost pf-save">Save</button><span class="small muted">Use the page numbers your PDF viewer shows (they can differ from the printed numbers).</span></div>' +
      ((window.FSM_SUMMARIES || {})[r.id] ? '<div class="sum-panel" style="display:none">' + summaryHTML(r.id) + '</div>' : '') + '</div>';
  }
  function wireReadings(rootEl) {
    rootEl.querySelectorAll('.reading').forEach(function (row) {
      var rid = row.getAttribute('data-rid'), book = row.getAttribute('data-book');
      row.querySelector('.act-done').onchange = function (e) { done['read:' + rid] = e.target.checked; store('fsm.guide.done', done); row.classList.toggle('done', e.target.checked); };
      row.querySelector('.act-pages').onclick = function () { var f = row.querySelector('.pages-form'); f.style.display = f.style.display === 'none' ? 'flex' : 'none'; };
      row.querySelector('.pf-save').onclick = function () {
        var a = parseInt(row.querySelector('.pf-from').value, 10), b = parseInt(row.querySelector('.pf-to').value, 10);
        if (!a) { R.pages(rid, null); } else R.pages(rid, a, b && b >= a ? b : a);
        route();
      };
      var sb = row.querySelector('.act-sum');
      if (sb) sb.onclick = function () { var sp = row.querySelector('.sum-panel'), open = sp.style.display === 'none'; sp.style.display = open ? 'block' : 'none'; sb.textContent = open ? 'Hide summary' : 'Summary'; };
      row.querySelector('.act-open').onclick = function () { openReading(rid, book, row.querySelector('b').textContent); };
    });
  }

  /* ---------- reader overlay ---------- */
  function openReading(rid, book, title) {
    var pg = READ[rid] ? pagesFor(READ[rid]) : R.pages(rid), link = R.link(book);
    R.get(book).then(function (rec) {
      if (!rec) {
        if (link) { window.open(link, '_blank', 'noopener'); return; }
        if (confirm('You haven\'t added your copy of “' + R.BOOKS[book].title + '” yet. Go to My books to add it?')) location.hash = '#books';
        return;
      }
      if (!pg && !confirm('No pages set for this reading yet — open the book at page 1? (Use “Set pages” to jump straight to the right part next time.)')) return;
      R.url(book).then(function (u) { showReader(u + '#page=' + (pg ? pg.from : 1), title, pg, rid); });
    }).catch(function () { alert('Your browser blocked local storage, so the book can\'t be opened from here.'); });
  }
  function showReader(src, title, pg, rid) {
    var ov = document.createElement('div');
    ov.className = 'reader-ov';
    ov.innerHTML = '<div class="reader-head"><div><b>' + esc(title) + '</b>' + (pg ? '<span class="small muted"> · read pages ' + pg.from + '–' + pg.to + '</span>' : '') + '</div><div class="acts">' + (summaryHTML(rid) ? '<button type="button" class="ghost" id="rdSum">Summary</button>' : '') + '<a class="btn ghost" target="_blank" rel="noopener" href="' + src + '">Open full screen</a><button type="button" class="ghost" id="rdNote">✎ Note</button><button type="button" class="ghost" id="rdDone">Mark as read</button><button type="button" id="rdClose">Close</button></div></div><div class="reader-body"><iframe title="Book" src="' + src + '"></iframe>' + (summaryHTML(rid) ? '<aside class="reader-sum" hidden><div class="sum-panel">' + summaryHTML(rid) + '</div></aside>' : '') + '</div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function close() { ov.remove(); document.body.style.overflow = ''; }
    wireExamples(ov);
    ov.querySelector('#rdClose').onclick = close;
    ov.querySelector('#rdNote').onclick = function () { NT.open(); };
    var rs = ov.querySelector('#rdSum');
    if (rs) rs.onclick = function () { var a = ov.querySelector('.reader-sum'); a.hidden = !a.hidden; rs.textContent = a.hidden ? 'Summary' : 'Hide summary'; };
    ov.querySelector('#rdDone').onclick = function () { done['read:' + rid] = true; store('fsm.guide.done', done); close(); route(); };
  }
  var css = document.createElement('style');
  css.textContent = '.reader-ov{position:fixed;inset:0;z-index:90;background:var(--bg);display:flex;flex-direction:column}.reader-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap;background:var(--surface)}.reader-head .acts{display:flex;gap:6px;flex-wrap:wrap}.reader-head .btn,.reader-head button{min-height:38px;padding:7px 12px}.reader-body{flex:1;display:flex;min-height:0}.reader-ov iframe{flex:1;border:0;width:100%;background:#fff;min-width:0}.reader-sum{width:min(440px,45%);overflow:auto;border-left:1px solid var(--line);background:var(--surface)}.reader-sum .sum-panel{border:0;margin:0}@media(max-width:700px){.reader-body{flex-direction:column}.reader-sum{width:auto;max-height:55%;border-left:0;border-top:1px solid var(--line);order:-1}}';
  document.head.appendChild(css);

  /* ---------- worked examples: question first, solution on demand ---------- */
  function exampleHTML(title, qHtml, steps) {
    return '<div class="example">' + (title ? '<div class="ex-title">' + esc(title) + '</div>' : '') + '<div class="body"><p class="ex-q">' + qHtml + '</p>' +
      '<ol class="ex-steps">' + steps.map(function (s) { return '<li hidden>' + s + '</li>'; }).join('') + '</ol>' +
      '<div class="ex-acts"><button type="button" class="ghost ex-next">Show next step</button><button type="button" class="ex-all">Show solution</button><span class="small muted ex-count">' + steps.length + ' steps</span></div></div></div>';
  }
  function wireExamples(el) {
    el.querySelectorAll('.example').forEach(function (ex) {
      var lis = ex.querySelectorAll('.ex-steps li'), nb = ex.querySelector('.ex-next'), ab = ex.querySelector('.ex-all'), cnt = ex.querySelector('.ex-count');
      if (!nb) return;
      function shown() { var n = 0; lis.forEach(function (li) { if (!li.hidden) n++; }); return n; }
      function sync() { var n = shown(); nb.style.display = n >= lis.length ? 'none' : ''; ab.textContent = n >= lis.length ? 'Hide solution' : 'Show solution'; cnt.textContent = n ? n + ' / ' + lis.length + ' steps shown' : lis.length + ' steps'; ex.classList.toggle('revealed', n > 0); }
      nb.onclick = function () { for (var i = 0; i < lis.length; i++) if (lis[i].hidden) { lis[i].hidden = false; break; } sync(); };
      ab.onclick = function () { var all = shown() >= lis.length; lis.forEach(function (li) { li.hidden = all; }); sync(); };
    });
  }

  /* ---------- page rendering ---------- */
  function practiceLink(topic) { return '../practice/skills.html#topic=' + topic; }
  function renderStudyPage(p) {
    var h = '<div class="crumb">' + esc(p.group) + (p.label ? ' · ' + esc(p.label) : '') + '</div><h1>' + esc(p.title) + '</h1>';
    if (p.html) h += p.html;
    if (p.glance) h += '<div class="glance"><div class="box"><h3>This week at a glance</h3><ul>' + p.glance.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="box"><h3>After this you can…</h3><ul>' + (p.goals || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
    if (p.readings && p.readings.length) h += '<h2>What to read</h2>' + p.readings.map(readingRow).join('');
    if (p.sections) p.sections.forEach(function (s) {
      if (/^Official solution/.test(s.h)) h += '<h2>' + esc(s.h) + '</h2><div class="sol-gate"><p class="small muted">Work it out yourself first (use the case exam to practise), then reveal and compare.</p><button type="button" class="sol-btn">Show official solution</button><div class="sol-body" hidden>' + s.html + '</div></div>';
      else h += '<h2>' + esc(s.h) + '</h2>' + s.html;
    });
    if (p.formulas && p.formulas.length) h += '<h2>Formula cards</h2>' + p.formulas.map(function (f) { return '<div class="fcard"><b>' + esc(f.n) + '</b><br><span class="f">' + esc(f.f) + '</span><div class="when"><b>When:</b> ' + esc(f.when) + '</div><div class="when"><b>Watch out:</b> ' + esc(f.trap) + '</div></div>'; }).join('');
    if (p.examples && p.examples.length) h += '<h2>Worked examples</h2><p class="small muted">Solve each one on paper first. Stuck? Reveal one step at a time. Done? Show the full solution and compare.</p>' + p.examples.map(function (e) { return exampleHTML(e.title, esc(e.q), e.steps); }).join('');
    var MQ = { fin_w1: [['q1-legal', 'Q1 Legal forms + effective tax (Mock 1)'], ['q1-market', 'Q1 Bid/ask + raising funds (Mock 2)']], fin_w3: [['q2-ccc', 'Q2 Cash conversion cycle + resources (Mocks 1 & 2)'], ['q3-credit', 'Q3 Relaxing the credit policy (Mock 1)']], fin_w4: [['q3-options', 'Q3 Three funding options (Mock 2)']], fin_w5: [['q4-leverage', 'Q4 DOL, DFL, DTL (Mocks 1 & 2)'], ['q5-wacc', 'Q5 WACC + project decision (Mock 1)']], fin_w6: [['q5-tax', 'Q5 Double taxation (Mock 2)'], ['q6-templates', 'Q6 Balance sheet after purchase + consolidation (Mock 1)'], ['q6-explain', 'Q6 Why eliminate + consolidation (Mock 2)']], scm_ch3: [['q7-logistics', 'Q7 Logistics definition + 7 Rs (Mock 2)']], scm_ch5: [['q8-criteria', 'Q8 Supplier selection criteria (Mock 1)'], ['q9-tlc', 'Q9 Total landed cost (Mock 1)']], scm_ch9: [['q7-inventory', 'Q7 Cutting inventory + new supplier (Mock 1)'], ['q8-supplier', 'Q8 New supplier impact (Mock 2)']], scm_ch11: [['q9-mode', 'Q9 Transport modes + distant supplier (Mock 2)']] };
    var MX = { fin_w1: [['q1-taxforms', 'Sole proprietor vs corporation: tax'], ['q1-cashaccrual', 'Cash vs accrual']], fin_w2: [['q1-ratios', 'Financial ratios from the statements']], fin_w3: [['q2-opcycle', 'Operating cycle + CCC'], ['q3-discount', 'Introducing an early-payment discount']], fin_w4: [['q3-payables', 'Accounts payable: take the discount?']], fin_w5: [['q4-epsforecast', 'EPS at different EBIT levels + DFL']], fin_w6: [['q5-fx', 'Exchange rates + forward contract'], ['q5-equity', 'Equity method'], ['q6-full', 'Full consolidation']], scm_ch3: [['q7-utilities', 'Value-added roles of logistics']], scm_ch5: [['q8-quadrant', 'Types of purchases (quadrant)']], scm_ch9: [['q7-approaches', 'JIT, EOQ, MRP, DRP, VMI'], ['q8-abc', 'ABC classification']], scm_ch11: [['q9-fob', 'Terms of sale (FOB)'], ['q9-scorecard', 'Carrier scorecard']] };
    var mq = (MQ[p.id] || []).concat((MX[p.id] || []).map(function (m) { return [m[0], m[1] + ' (slides, not in the mocks)']; }));
    if (mq.length) h += '<div class="practice-cta"><div><b>Practise the exam questions for this week</b><div class="small">Worded exactly like the mock exam, new numbers every time.</div><ul class="small" style="margin:6px 0 0;padding-left:1.2em">' + mq.map(function (m) { return '<li><a href="../practice/index.html#q=' + m[0] + '">' + esc(m[1]) + '</a></li>'; }).join('') + '</ul></div><a class="btn" href="../practice/index.html#q=' + mq[0][0] + '">Start →</a></div>';
    if (p.practice) h += '<p class="small muted" style="margin-top:8px">Want to train one step at a time? <a href="' + practiceLink(p.practice) + '">Short topic drills for ' + esc(p.label || p.title) + '</a>.</p>';
    if (p.special === 'exam') h += '<div class="practice-cta"><div><b>Exam simulation</b><div class="small">Timed, mixed, formula sheet available, feedback only at the end.</div></div><a class="btn" href="../practice/case.html">Start exam simulation →</a></div>';
    if (p.id !== 'start') { var mn = NT.forPage(p.id).length; h += '<div class="notes-cta"><div><b>✎ Your notes for this page</b><div class="small muted">' + (mn ? mn + ' note' + (mn === 1 ? '' : 's') + ' so far.' : 'Write the 2–3 things you want to remember, in your own words.') + '</div></div><button type="button" class="ghost" id="pgNote">' + (mn ? 'Open notes' : 'Write a note') + '</button></div>'; }
    if (p.id !== 'start') h += '<label class="check markdone"><input type="checkbox" id="pageDone"' + (done['page:' + p.id] ? ' checked' : '') + '> <b>Mark this section as done</b></label>';
    var i = ORDER.indexOf(p.id), prev = ORDER[i - 1], next = ORDER[i + 1];
    h += '<div class="pagenav">' + (prev ? '<a class="btn ghost" href="#' + prev + '">← ' + esc(byId[prev].title) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#' + next + '">' + esc(byId[next].title) + ' →</a>' : '') + '</div>';
    pageEl.innerHTML = h;
    wireReadings(pageEl);
    wireExamples(pageEl);
    pageEl.querySelectorAll('.sol-gate').forEach(function (g) { var b = g.querySelector('.sol-btn'), body = g.querySelector('.sol-body'); b.onclick = function () { body.hidden = !body.hidden; b.textContent = body.hidden ? 'Show official solution' : 'Hide official solution'; b.className = body.hidden ? 'sol-btn' : 'sol-btn ghost'; }; });
    var pn = document.getElementById('pgNote'); if (pn) pn.onclick = function () { NT.open(); };
    var pd = document.getElementById('pageDone');
    if (pd) pd.onchange = function () { done['page:' + p.id] = pd.checked; store('fsm.guide.done', done); renderSidebar(p.id); };
  }

  function allReadings() { var out = []; ORDER.forEach(function (id) { var p = byId[id]; if (p && p.readings) p.readings.forEach(function (r) { out.push({ r: r, p: p }); }); }); return out; }

  function renderBooks() {
    var h = '<div class="crumb">Start</div><h1>My books</h1><p>Add <b>your own</b> PDF copy of each textbook once. It is stored only in this browser on this device (nothing is uploaded) and opens at the pages you set for each reading. If you only have the e-book on the publisher\'s platform, paste its link instead.</p>';
    ['zs', 'langley'].forEach(function (b) {
      h += '<div class="card bookcard" data-book="' + b + '"><div><b>' + esc(R.BOOKS[b].title) + '</b><div class="small muted">' + esc(R.BOOKS[b].sub) + '</div></div><div class="bk-status small">Checking…</div>' +
        '<div class="btnrow"><label class="btn">Choose PDF<input type="file" accept="application/pdf" class="bk-file" hidden></label><button type="button" class="ghost bk-remove">Remove</button></div>' +
        '<div class="pages-form"><span class="small">…or an online e-book link:</span><input type="text" class="bk-link" style="width:min(380px,100%)" placeholder="https://…" value="' + esc(R.link(b)) + '"><button type="button" class="ghost bk-linksave">Save link</button></div></div>';
    });
    h += '<h2>Set the pages for each reading</h2><p class="small muted">Open your PDF, find where each part starts and ends (use the page number your PDF viewer shows), and enter it once. Your edition\'s page numbers may differ, so nothing is pre-filled.</p>';
    h += allReadings().map(function (x) { return '<div class="small muted" style="margin-top:10px">' + esc(x.p.label + ' · ' + x.p.title) + '</div>' + readingRow(x.r); }).join('');
    h += '<div class="callout info"><b>Phone tip</b>On iPhone/iPad, “Open full screen” may always start at page 1 — scroll to the page shown at the top. Chrome, Edge and Firefox on a laptop jump straight to the right page.</div>';
    pageEl.innerHTML = h;
    wireReadings(pageEl);
    wireExamples(pageEl);
    pageEl.querySelectorAll('.bookcard').forEach(function (card) {
      var b = card.getAttribute('data-book'), st = card.querySelector('.bk-status');
      function refresh() {
        R.get(b).then(function (rec) { st.innerHTML = rec ? '<span class="status-ok">✓ Added:</span> ' + esc(rec.name) + ' (' + Math.round(rec.size / 1048576) + ' MB)' : '<span class="status-no">No PDF added yet.</span>'; })
          .catch(function () { st.textContent = 'This browser blocks local file storage (private mode?). Use the link option instead.'; });
      }
      refresh();
      card.querySelector('.bk-file').onchange = function (e) { var f = e.target.files[0]; if (!f) return; st.textContent = 'Saving…'; R.save(b, f).then(refresh).catch(function () { st.textContent = 'Could not save — the file may be too large for this browser\'s storage.'; }); };
      card.querySelector('.bk-remove').onclick = function () { if (confirm('Remove this book from this browser?')) R.remove(b).then(refresh); };
      card.querySelector('.bk-linksave').onclick = function () { R.link(b, card.querySelector('.bk-link').value.trim()); this.textContent = 'Saved'; };
    });
  }

  function renderFormulas() {
    pageEl.innerHTML = '<div class="crumb">Start</div><h1>Formula sheet</h1><p class="muted">This is the formula sheet you get in the exam. Learn <i>when</i> to use each line — the week pages have formula cards with the traps.</p>' +
      FSM.FORMULAS.map(function (g) { return '<h2>' + esc(g.group) + '</h2><div class="tablewrap"><table>' + g.items.map(function (it) { return '<tr><td><b>' + esc(it[0]) + '</b></td><td><code>' + esc(it[1]) + '</code></td></tr>'; }).join('') + '</table></div>'; }).join('') +
      '<div class="callout"><b>Not on the sheet — learn these yourself</b>Credit-policy net effect (ΔCM − Δcosts − ΔA/R × required return) · A/R = (sales − discounts) × ACP/365 · discount loan rate = X/(100 − X) · break-even = FC/(P − VC) · consolidation steps and goodwill · dividend tax credit (not below 0) · total landed cost.</div>';
  }

  function glossaryItems() {
    var items = [];
    Object.keys(FSM.skills).forEach(function (k) {
      var s = FSM.skills[k]; if (s.kind !== 'concept') return;
      var t = FSM.topics.filter(function (x) { return x.id === s.topic; })[0] || {};
      s.items.forEach(function (it) { items.push({ term: it.term, def: it.defs[0], page: t.guide || s.topic, where: t.title }); });
    });
    var seen = {};
    return items.filter(function (x) { var k = x.term.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; }).sort(function (a, b) { return a.term.localeCompare(b.term); });
  }
  function renderGlossary() {
    var items = glossaryItems();
    pageEl.innerHTML = '<div class="crumb">Start</div><h1>Glossary</h1><p class="muted">' + items.length + ' key terms from finance and supply chain. Type to filter.</p><input type="search" id="gfilter" placeholder="Filter terms…" style="width:100%;max-width:420px"><dl class="gloss" id="glist"></dl>';
    var list = document.getElementById('glist');
    function draw(q) {
      q = (q || '').toLowerCase();
      list.innerHTML = items.filter(function (x) { return !q || (x.term + ' ' + x.def).toLowerCase().indexOf(q) >= 0; }).map(function (x) {
        return '<dt>' + esc(x.term) + '</dt><dd>' + esc(x.def) + ' <small>· <a href="#' + x.page + '">' + esc(x.where) + '</a></small></dd>';
      }).join('') || '<p class="muted">No matches.</p>';
    }
    draw('');
    document.getElementById('gfilter').oninput = function (e) { draw(e.target.value); };
  }

  /* ---------- my notes page ---------- */
  var noteFilter = { q: '', star: false };
  function noteGroups() {
    var titles = {}, order = ['general'].concat(ORDER, ['practice', 'case-exam']);
    var groups = {};
    NT.all().forEach(function (n) { (groups[n.page] = groups[n.page] || []).push(n); titles[n.page] = byId[n.page] ? (byId[n.page].label ? byId[n.page].label + ' · ' : '') + byId[n.page].title : n.title; });
    Object.keys(groups).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });
    return order.filter(function (k) { return groups[k]; }).map(function (k) { return { id: k, title: titles[k], notes: groups[k].sort(function (a, b) { return a.t - b.t; }) }; });
  }
  function notesMarkdown() {
    var out = '# My FSM notes\n\nExported ' + new Date().toLocaleString() + '\n';
    noteGroups().forEach(function (g) {
      out += '\n## ' + g.title + '\n';
      g.notes.forEach(function (n) { out += '\n' + (n.star ? '★ ' : '') + (n.quote ? '> ' + n.quote + '\n\n' : '') + n.text + '\n'; });
    });
    return out;
  }
  function download(name, text, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function renderNotes() {
    var total = NT.all().length, stars = NT.all().filter(function (n) { return n.star; }).length;
    pageEl.innerHTML = '<div class="crumb">Start</div><h1>My notes</h1>' +
      '<p class="muted">Everything you wrote down, grouped by topic. Add notes on any page with the <b>✎ Notes</b> button (bottom right), or select text on a page and tap <b>＋ Add to notes</b>. Notes you write here go under “General”.</p>' +
      '<div class="notes-tools"><input type="search" id="nfilter" placeholder="Search your notes…" value="' + esc(noteFilter.q) + '"><label class="check"><input type="checkbox" id="nstar"' + (noteFilter.star ? ' checked' : '') + '> ★ Only important (' + stars + ')</label></div>' +
      '<div class="btnrow notes-btns"><button type="button" id="nAdd">＋ New general note</button><button type="button" class="ghost" id="nMd"' + (total ? '' : ' disabled') + '>Download as text (.md)</button><button type="button" class="ghost" id="nPrint"' + (total ? '' : ' disabled') + '>Print</button><button type="button" class="ghost" id="nBak"' + (total ? '' : ' disabled') + '>Download backup</button><label class="btn ghost">Restore backup<input type="file" accept=".json,application/json" id="nRes" hidden></label></div>' +
      '<div id="nlist"></div>' +
      '<div class="callout info"><b>Your notes stay in this browser</b>They are saved on this device only (nothing is uploaded, and clearing your browser data deletes them). To use them on your phone or laptop too, tap <i>Download backup</i> here and <i>Restore backup</i> on the other device. Do a backup before the exam week.</div>';
    function draw() {
      var q = noteFilter.q.toLowerCase(), h = '';
      noteGroups().forEach(function (g) {
        var ns = g.notes.filter(function (n) { return (!noteFilter.star || n.star) && (!q || (n.text + ' ' + n.quote + ' ' + g.title).toLowerCase().indexOf(q) >= 0); });
        if (!ns.length) return;
        var link = byId[g.id] ? '#' + g.id : g.id === 'practice' ? '../practice/index.html' : g.id === 'case-exam' ? '../practice/case.html' : '';
        h += '<h2>' + (link ? '<a href="' + link + '">' + esc(g.title) + '</a>' : esc(g.title)) + ' <span class="small muted">(' + ns.length + ')</span></h2>' + ns.map(function (n) { return NT.noteHTML(n, false); }).join('');
      });
      var L = document.getElementById('nlist');
      L.innerHTML = h || (total ? '<p class="muted">No notes match.</p>' : '<div class="card"><b>No notes yet.</b><p class="small muted" style="margin:6px 0 0">Open a week, read a section, then press <b>✎ Notes</b> and write the key point in your own words — the formula, when you use it, and the trap.</p></div>');
      NT.wireNotes(L);
    }
    draw();
    document.getElementById('nfilter').oninput = function (e) { noteFilter.q = e.target.value; draw(); };
    document.getElementById('nstar').onchange = function (e) { noteFilter.star = e.target.checked; draw(); };
    document.getElementById('nAdd').onclick = function () { NT.open(); };
    document.getElementById('nMd').onclick = function () { download('fsm-notes.md', notesMarkdown(), 'text/markdown'); };
    document.getElementById('nPrint').onclick = function () {
      var w = window.open('', '_blank'); if (!w) return;
      w.document.write('<!doctype html><meta charset="utf-8"><title>My FSM notes</title><style>body{font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:30px auto;padding:0 16px;color:#111}h2{border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:26px}.n{margin:10px 0;padding:6px 10px;border-left:3px solid #ccc}.n.s{border-color:#c90}.q{color:#555;font-style:italic}ul{margin:2px 0}</style><h1>My FSM notes</h1>' +
        noteGroups().map(function (g) { return '<h2>' + esc(g.title) + '</h2>' + g.notes.map(function (n) { return '<div class="n' + (n.star ? ' s' : '') + '">' + (n.quote ? '<div class="q">“' + esc(n.quote) + '”</div>' : '') + (n.star ? '★ ' : '') + NT.fmt(n.text) + '</div>'; }).join(''); }).join(''));
      w.document.close(); w.focus(); w.print();
    };
    document.getElementById('nBak').onclick = function () { download('fsm-notes-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(NT.all(), null, 1), 'application/json'); };
    document.getElementById('nRes').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (txt) {
        var inc = JSON.parse(txt); if (!Array.isArray(inc)) throw new Error('bad');
        var cur = NT.all(), have = {}; cur.forEach(function (n) { have[n.id] = 1; });
        var added = 0; inc.forEach(function (n) { if (n && n.id && typeof n.text === 'string' && !have[n.id]) { cur.push(n); added++; } });
        NT.replaceAll(cur); alert(added + ' note' + (added === 1 ? '' : 's') + ' restored.');
      }).catch(function () { alert('That file is not a notes backup.'); });
    };
  }
  NT.onChange(function () {
    var hsh = decodeURIComponent(location.hash.replace(/^#/, '')) || 'start';
    if (hsh === 'notes') { var f = document.activeElement && document.activeElement.id === 'nfilter'; renderNotes(); if (f) { var el = document.getElementById('nfilter'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
    renderSidebar(byId[hsh] ? hsh : '');
  });

  /* ---------- flashcards page ---------- */
  var cardFilter = '';
  function renderCards() {
    var all = FC.all(), due = FC.due(), now = Date.now();
    var soon = all.filter(function (c) { return c.due > now && c.due < now + 7 * 86400000; }).length;
    var hasF = all.some(function (c) { return c.deck === 'formulas'; }), hasG = all.some(function (c) { return c.deck === 'glossary'; });
    var h = '<div class="crumb">Start</div><h1>Flashcards</h1><p class="muted">I made a course deck for you, built around the mock exams (see below). You can add your own cards too, for anything you keep forgetting. Each card comes back right before you would forget it: after 1, 3, 7, 14 and 30 days if you know it, within minutes if you don\'t. When cards are due, you see it on the ✎ Notes button and in the sidebar, on every page.</p>';
    h += '<div class="cards-stats"><div class="card"><div class="big-n">' + due.length + '</div><div class="small muted">due now</div></div><div class="card"><div class="big-n">' + soon + '</div><div class="small muted">due this week</div></div><div class="card"><div class="big-n">' + all.length + '</div><div class="small muted">cards in total</div></div></div>';
    h += '<div class="btnrow notes-btns">' + (due.length ? '<button type="button" id="cRev">Review all ' + due.length + ' due card' + (due.length === 1 ? '' : 's') + ' (≈ ' + Math.max(1, Math.round(due.length * 0.4)) + ' min)</button>' : '<button type="button" disabled>Nothing due right now ✓</button>') + '<button type="button" class="ghost" id="cAdd">＋ New card</button></div>';
    var cn = all.filter(function (c) { return c.deck === 'course'; }), cnSeen = cn.filter(function (c) { return c.n; }).length;
    h += '<div class="card"><b>Review by week</b> <span class="small muted">· course deck written for this exam: methods, formulas and traps</span><p class="small" style="margin:6px 0 0">' + (FC.course.on() ? cn.length + ' cards · ' + cnSeen + ' studied so far. Review one week at a time, or everything at once.' : 'Switched off.') + '</p>' + (FC.course.on() ? '<div class="weekpick">' + FC.course.pages.map(function (pg) { var tot = all.filter(function (c) { return c.page === pg; }).length, d = due.filter(function (c) { return c.page === pg; }).length; if (!tot) return ''; return '<button type="button" class="wk' + (d ? ' on' : '') + '" data-rw="' + pg + '"' + (d ? '' : ' disabled') + '>' + FC.course.label[pg] + ' <small>' + (d ? d + ' due' : 'nothing due') + '</small></button>'; }).join('') + '</div>' : '') + '<div class="btnrow notes-btns" style="margin-top:8px">' + (FC.course.on() ? '<button type="button" class="ghost" id="cCourseOff">Remove course deck</button>' : '<button type="button" id="cCourseOn">Add the course deck (' + FC.course.total() + ' cards)</button>') + '</div></div>';
    h += '<div class="card"><b>Extra decks</b> <span class="small muted">(optional, 20 new cards a day)</span><div class="btnrow notes-btns" style="margin-top:8px">' +
      (hasF ? '<button type="button" class="ghost" data-rm="formulas">Remove formula-sheet deck</button>' : '<button type="button" class="ghost" data-add="formulas">＋ Formula sheet (' + FSM.FORMULAS.reduce(function (n, g) { return n + g.items.length; }, 0) + ' cards)</button>') +
      (hasG ? '<button type="button" class="ghost" data-rm="glossary">Remove glossary deck</button>' : '<button type="button" class="ghost" data-add="glossary">＋ Glossary terms (' + glossaryItems().length + ' cards)</button>') + '</div></div>';
    h += '<div class="notes-tools"><input type="search" id="cfilter" placeholder="Search your cards…" value="' + esc(cardFilter) + '"></div><div id="clist"></div>';
    h += '<div class="btnrow notes-btns"><button type="button" class="ghost" id="cBak"' + (all.length ? '' : ' disabled') + '>Download backup</button><label class="btn ghost">Restore backup<input type="file" accept=".json,application/json" id="cRes" hidden></label></div><div class="callout info"><b>Your cards stay in this browser</b>Use Download backup / Restore backup to move them to your phone or laptop (the same way as your notes).</div>';
    pageEl.innerHTML = h;
    function draw() {
      var q = cardFilter.toLowerCase(), groups = {}, order = [];
      FC.all().filter(function (c) { return !q || (c.front + ' ' + c.back + ' ' + c.title).toLowerCase().indexOf(q) >= 0; }).sort(function (a, b) { var pa = FC.course.pages.indexOf(a.deck === 'mine' || a.deck === 'course' ? a.page : 'zz'), pb = FC.course.pages.indexOf(b.deck === 'mine' || b.deck === 'course' ? b.page : 'zz'); pa = pa < 0 ? 99 : pa; pb = pb < 0 ? 99 : pb; return pa - pb || a.due - b.due; }).forEach(function (c) {
        var k = c.deck === 'mine' || c.deck === 'course' ? c.page : 'deck:' + c.deck; if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(c);
      });
      var label = function (k) { return k === 'deck:course' ? 'Course deck' : k === 'deck:formulas' ? 'Formula-sheet deck' : k === 'deck:glossary' ? 'Glossary deck' : byId[k] ? (byId[k].label ? byId[k].label + ' · ' : '') + byId[k].title : (groups[k][0].title || 'General'); };
      document.getElementById('clist').innerHTML = order.length ? order.map(function (k) {
        var g = groups[k];
        return '<details class="cgroup"' + (order.length <= 3 || k.indexOf('deck:') ? ' open' : '') + '><summary><b>' + esc(label(k)) + '</b> <span class="small muted">(' + g.length + (g.filter(function (c) { return c.due <= Date.now(); }).length ? ', ' + g.filter(function (c) { return c.due <= Date.now(); }).length + ' due' : '') + ')</span></summary>' +
          g.slice(0, 200).map(function (c) { return '<div class="nt-note" data-cid="' + c.id + '"><div class="nt-body"><b>' + FC.fmt(c.front) + '</b><div class="muted" style="margin-top:4px">' + FC.fmt(c.back) + '</div></div><div class="nt-meta"><span>' + (c.due <= Date.now() ? '<b style="color:var(--warn)">due now</b>' : 'next ' + FC.whenText(c.due)) + (c.n ? ' · reviewed ' + c.n + '×' : '') + '</span><span><button type="button" class="ghost c-edit">Edit</button> <button type="button" class="ghost c-del">Delete</button></span></div></div>'; }).join('') + (g.length > 200 ? '<p class="small muted">…and ' + (g.length - 200) + ' more (use search).</p>' : '') + '</details>';
      }).join('') : (FC.all().length ? '<p class="muted">No cards match.</p>' : '<div class="card"><b>No cards yet.</b><p class="small muted" style="margin:6px 0 0">Tap <b>＋ New card</b>, select text on any page and tap <b>＋ Flashcard</b>, or turn a note into a card with <b>→ Card</b>.</p></div>');
      pageEl.querySelectorAll('.c-del').forEach(function (b) { b.onclick = function () { FC.remove(b.closest('[data-cid]').getAttribute('data-cid')); }; });
      pageEl.querySelectorAll('.c-edit').forEach(function (b) { b.onclick = function () {
        var el = b.closest('[data-cid]'), id = el.getAttribute('data-cid'), c = FC.all().filter(function (x) { return x.id === id; })[0]; if (!c) return;
        el.querySelector('.nt-body').innerHTML = '<label class="small muted">Front</label><textarea class="ce-f" style="width:100%;box-sizing:border-box;min-height:50px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text)"></textarea><label class="small muted">Back</label><textarea class="ce-b" style="width:100%;box-sizing:border-box;min-height:70px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text)"></textarea><div style="display:flex;gap:6px;margin-top:6px"><button type="button" class="ce-s">Save</button><button type="button" class="ghost ce-x">Cancel</button></div>';
        el.querySelector('.ce-f').value = c.front; el.querySelector('.ce-b').value = c.back;
        el.querySelector('.ce-s').onclick = function () { FC.update(id, { front: el.querySelector('.ce-f').value.trim(), back: el.querySelector('.ce-b').value.trim() }); };
        el.querySelector('.ce-x').onclick = draw;
      }; });
    }
    draw();
    document.getElementById('cfilter').oninput = function (e) { cardFilter = e.target.value; draw(); };
    var rv = document.getElementById('cRev'); if (rv) rv.onclick = function () { FC.review(); };
    document.getElementById('cAdd').onclick = function () { NT.openCard({}); };
    pageEl.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () {
      var d = b.getAttribute('data-add'), list = [];
      if (d === 'formulas') FSM.FORMULAS.forEach(function (g) { g.items.forEach(function (it) { list.push({ front: 'Formula: ' + it[0] + '?', back: it[1], deck: 'formulas', title: 'Formula sheet · ' + g.group }); }); });
      else glossaryItems().forEach(function (x) { list.push({ front: 'What is “' + x.term + '”?', back: x.def, deck: 'glossary', title: 'Glossary · ' + x.where }); });
      FC.addMany(list);
    }; });
    pageEl.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { if (confirm('Remove this deck (and its review progress)? Your own cards stay.')) FC.removeDeck(b.getAttribute('data-rm')); }; });
    pageEl.querySelectorAll('[data-rw]').forEach(function (b) { b.onclick = function () { FC.review(b.getAttribute('data-rw')); }; });
    var co = document.getElementById('cCourseOff'); if (co) co.onclick = function () { if (confirm('Remove the course deck and its review progress? Your own cards stay.')) FC.course.remove(); };
    var cn2 = document.getElementById('cCourseOn'); if (cn2) cn2.onclick = function () { FC.course.restore(); };
    document.getElementById('cBak').onclick = function () { download('fsm-flashcards-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(FC.all(), null, 1), 'application/json'); };
    document.getElementById('cRes').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (txt) {
        var inc = JSON.parse(txt); if (!Array.isArray(inc)) throw new Error('bad');
        var cur = FC.all(), have = {}; cur.forEach(function (c) { have[c.id] = 1; });
        var added = 0; inc.forEach(function (c) { if (c && c.id && typeof c.front === 'string' && !have[c.id]) { cur.push(c); added++; } });
        FC.replaceAll(cur); alert(added + ' card' + (added === 1 ? '' : 's') + ' restored.');
      }).catch(function () { alert('That file is not a flashcards backup.'); });
    };
  }
  FC.onChange(function () {
    var hsh = decodeURIComponent(location.hash.replace(/^#/, '')) || 'start';
    if (hsh === 'cards') { var f = document.activeElement && document.activeElement.id === 'cfilter'; renderCards(); if (f) { var el = document.getElementById('cfilter'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
    renderSidebar(byId[hsh] ? hsh : '');
  });

  /* ---------- search ---------- */
  function strip(html) { return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' '); }
  var INDEX = ORDER.filter(function (id) { return byId[id] && !byId[id].special || id === 'exam' || id === 'start'; }).map(function (id) {
    var p = byId[id];
    var txt = [p.title, (p.glance || []).join(' '), (p.goals || []).join(' '), strip(p.html), (p.sections || []).map(function (s) { return s.h + ' ' + strip(s.html); }).join(' '), (p.formulas || []).map(function (f) { return f.n + ' ' + f.f + ' ' + f.when + ' ' + f.trap; }).join(' '), (p.examples || []).map(function (e) { return e.title + ' ' + e.q + ' ' + strip(e.steps.join(' ')); }).join(' '), (p.readings || []).map(function (r) { return r.ref + ' ' + r.title + ' ' + r.note; }).join(' ')].join(' ');
    return { id: id, title: p.title, label: p.label, txt: txt };
  });
  function renderSearch(q) {
    var ql = q.toLowerCase().trim();
    var words = ql.split(/\s+/).filter(Boolean);
    var res = INDEX.map(function (e) {
      var low = e.txt.toLowerCase(), score = 0;
      words.forEach(function (w) { var i = -1, c = 0; while ((i = low.indexOf(w, i + 1)) >= 0 && c < 50) c++; score += c; if (e.title.toLowerCase().indexOf(w) >= 0) score += 10; });
      if (!words.every(function (w) { return low.indexOf(w) >= 0; })) score = 0;
      var at = low.indexOf(words[0] || '');
      var snip = at >= 0 ? e.txt.substr(Math.max(0, at - 70), 200) : '';
      return { e: e, score: score, snip: snip };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    var gl = glossaryItems().filter(function (x) { return words.every(function (w) { return (x.term + ' ' + x.def).toLowerCase().indexOf(w) >= 0; }); }).slice(0, 8);
    function hl(s) { var out = esc(s); words.forEach(function (w) { if (w.length > 1) out = out.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); }); return out; }
    var mine = NT.all().filter(function (n) { return words.every(function (w) { return (n.text + ' ' + n.quote).toLowerCase().indexOf(w) >= 0; }); }).slice(0, 10);
    var h = '<h1>Search: “' + esc(q) + '”</h1>';
    h += res.length ? '<ul class="results">' + res.map(function (x) { return '<li><a href="#' + x.e.id + '"><b>' + esc((x.e.label ? x.e.label + ' · ' : '') + x.e.title) + '</b></a><div class="snip">…' + hl(x.snip) + '…</div></li>'; }).join('') + '</ul>' : '<p class="muted">No pages match.</p>';
    if (mine.length) h += '<h2>Your notes</h2>' + mine.map(function (n) { return '<div class="nt-note' + (n.star ? ' star' : '') + '"><div class="small muted"><a href="#' + (byId[n.page] ? n.page : 'notes') + '">' + esc(n.title) + '</a></div>' + (n.quote ? '<div class="nt-q">“' + hl(n.quote) + '”</div>' : '') + '<div class="nt-body">' + hl(n.text) + '</div></div>'; }).join('');
    if (gl.length) h += '<h2>Glossary</h2><dl class="gloss">' + gl.map(function (x) { return '<dt>' + hl(x.term) + '</dt><dd>' + hl(x.def) + ' <small>· <a href="#' + x.page + '">' + esc(x.where) + '</a></small></dd>'; }).join('') + '</dl>';
    pageEl.innerHTML = h;
  }
  var sbox = document.getElementById('search'), st;
  sbox.oninput = function () { clearTimeout(st); st = setTimeout(function () { var v = sbox.value.trim(); if (v.length >= 2) location.hash = '#search=' + encodeURIComponent(v); }, 300); };

  /* ---------- router ---------- */
  function route() {
    closeMenu();
    var hsh = decodeURIComponent(location.hash.replace(/^#/, '')) || 'start';
    if (hsh.indexOf('search=') === 0) { renderSidebar(''); NT.setPage('general', 'General notes'); renderSearch(hsh.slice(7)); return; }
    if (!byId[hsh]) hsh = 'start';
    renderSidebar(hsh);
    var p = byId[hsh];
    if (p.special === 'books') renderBooks();
    else if (p.special === 'formulas') renderFormulas();
    else if (p.special === 'glossary') renderGlossary();
    else if (p.special === 'notes') renderNotes();
    else if (p.special === 'cards') renderCards();
    else renderStudyPage(p);
    if (p.special === 'notes' || p.special === 'books' || p.special === 'cards') NT.setPage('general', 'General notes'); else NT.setPage(p.id, (p.label ? p.label + ' · ' : '') + p.title);
    document.title = p.title + ' · FSM Study Guide';
  }
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });
  route();
})();
