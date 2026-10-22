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
  var NAV = [
    { g: 'Start', ids: ['start', 'books', 'formulas', 'glossary'] },
    { g: 'Managerial Finance · 70%', ids: ['fin_w1', 'fin_w2', 'fin_w3', 'fin_w4', 'fin_w5', 'fin_w6', 'case', 'exam'] },
    { g: 'Supply Chain Management · 30%', ids: ['scm_ch1', 'scm_ch2', 'scm_ch3', 'scm_ch5', 'scm_ch9', 'scm_ch11'] }
  ];
  var ORDER = []; NAV.forEach(function (n) { ORDER = ORDER.concat(n.ids); });
  var STUDY = ORDER.filter(function (id) { return byId[id] && !byId[id].special || id === 'exam'; });

  function renderSidebar(cur) {
    var n = STUDY.filter(function (id) { return done['page:' + id]; }).length;
    var h = '<div class="prog small muted">' + n + ' / ' + STUDY.length + ' sections done</div><div class="prog bar"><i style="width:' + Math.round(100 * n / STUDY.length) + '%"></i></div>';
    NAV.forEach(function (sec) {
      h += '<h4>' + sec.g + '</h4>';
      sec.ids.forEach(function (id) {
        var p = byId[id]; if (!p) return;
        h += '<a href="#' + id + '" class="' + (id === cur ? 'active' : '') + '"><span><span class="wk">' + esc(p.label || '') + '</span> ' + esc(p.title) + '</span>' + (done['page:' + id] ? '<span class="done">✓</span>' : '') + '</a>';
      });
    });
    side.innerHTML = h;
  }
  function closeMenu() { side.classList.remove('open'); scrim.classList.remove('open'); }
  document.getElementById('menuBtn').onclick = function () { side.classList.add('open'); scrim.classList.add('open'); };
  scrim.onclick = closeMenu;

  /* ---------- reading rows ---------- */
  function readingRow(r) {
    var pg = R.pages(r.id), link = R.link(r.book);
    var book = R.BOOKS[r.book];
    return '<div class="reading' + (done['read:' + r.id] ? ' done' : '') + '" data-rid="' + r.id + '" data-book="' + r.book + '">' +
      '<div class="meta"><b>' + esc(r.ref) + ' — ' + esc(r.title) + '</b><small>' + esc(book.title) + (pg ? ' · pages ' + pg.from + '–' + pg.to : '') + '</small>' + (r.note ? '<div class="small">' + esc(r.note) + '</div>' : '') + '</div>' +
      '<div class="acts"><button type="button" class="act-open">Open in my book</button><button type="button" class="ghost act-pages">' + (pg ? 'Edit pages' : 'Set pages') + '</button>' +
      '<label class="check"><input type="checkbox" class="act-done"' + (done['read:' + r.id] ? ' checked' : '') + '> Read</label></div>' +
      '<div class="pages-form" style="display:none;flex-basis:100%"><span class="small">PDF pages</span><input type="number" min="1" class="pf-from" value="' + (pg ? pg.from : '') + '" placeholder="from"><input type="number" min="1" class="pf-to" value="' + (pg ? pg.to : '') + '" placeholder="to"><button type="button" class="ghost pf-save">Save</button><span class="small muted">Use the page numbers your PDF viewer shows (they can differ from the printed numbers).</span></div></div>';
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
      row.querySelector('.act-open').onclick = function () { openReading(rid, book, row.querySelector('b').textContent); };
    });
  }

  /* ---------- reader overlay ---------- */
  function openReading(rid, book, title) {
    var pg = R.pages(rid), link = R.link(book);
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
    ov.innerHTML = '<div class="reader-head"><div><b>' + esc(title) + '</b>' + (pg ? '<span class="small muted"> · read pages ' + pg.from + '–' + pg.to + '</span>' : '') + '</div><div class="acts"><a class="btn ghost" target="_blank" rel="noopener" href="' + src + '">Open full screen</a><button type="button" class="ghost" id="rdDone">Mark as read</button><button type="button" id="rdClose">Close</button></div></div><iframe title="Book" src="' + src + '"></iframe>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function close() { ov.remove(); document.body.style.overflow = ''; }
    ov.querySelector('#rdClose').onclick = close;
    ov.querySelector('#rdDone').onclick = function () { done['read:' + rid] = true; store('fsm.guide.done', done); close(); route(); };
  }
  var css = document.createElement('style');
  css.textContent = '.reader-ov{position:fixed;inset:0;z-index:90;background:var(--bg);display:flex;flex-direction:column}.reader-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap;background:var(--surface)}.reader-head .acts{display:flex;gap:6px;flex-wrap:wrap}.reader-head .btn,.reader-head button{min-height:38px;padding:7px 12px}.reader-ov iframe{flex:1;border:0;width:100%;background:#fff}';
  document.head.appendChild(css);

  /* ---------- page rendering ---------- */
  function practiceLink(topic) { return '../practice/index.html#topic=' + topic; }
  function renderStudyPage(p) {
    var h = '<div class="crumb">' + esc(p.group) + (p.label ? ' · ' + esc(p.label) : '') + '</div><h1>' + esc(p.title) + '</h1>';
    if (p.html) h += p.html;
    if (p.glance) h += '<div class="glance"><div class="box"><h3>This week at a glance</h3><ul>' + p.glance.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="box"><h3>After this you can…</h3><ul>' + (p.goals || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
    if (p.readings && p.readings.length) h += '<h2>What to read</h2>' + p.readings.map(readingRow).join('');
    if (p.sections) p.sections.forEach(function (s) { h += '<h2>' + esc(s.h) + '</h2>' + s.html; });
    if (p.formulas && p.formulas.length) h += '<h2>Formula cards</h2>' + p.formulas.map(function (f) { return '<div class="fcard"><b>' + esc(f.n) + '</b><br><span class="f">' + esc(f.f) + '</span><div class="when"><b>When:</b> ' + esc(f.when) + '</div><div class="when"><b>Watch out:</b> ' + esc(f.trap) + '</div></div>'; }).join('');
    if (p.examples && p.examples.length) h += '<h2>Worked examples</h2><p class="small muted">Try each one yourself first, then open the solution.</p>' + p.examples.map(function (e) { return '<details class="example"><summary>' + esc(e.title) + '</summary><div class="body"><p>' + esc(e.q) + '</p><ol>' + e.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div></details>'; }).join('');
    if (p.practice) h += '<div class="practice-cta"><div><b>Practice this</b><div class="small">Drill until every skill shows “Mastered”.</div></div><a class="btn" href="' + practiceLink(p.practice) + '">Open practice for ' + esc(p.label || p.title) + ' →</a></div>';
    if (p.special === 'exam') h += '<div class="practice-cta"><div><b>Exam simulation</b><div class="small">Timed, mixed, formula sheet available, feedback only at the end.</div></div><a class="btn" href="../practice/index.html#exam">Start exam simulation →</a></div>';
    if (p.id !== 'start') h += '<label class="check markdone"><input type="checkbox" id="pageDone"' + (done['page:' + p.id] ? ' checked' : '') + '> <b>Mark this section as done</b></label>';
    var i = ORDER.indexOf(p.id), prev = ORDER[i - 1], next = ORDER[i + 1];
    h += '<div class="pagenav">' + (prev ? '<a class="btn ghost" href="#' + prev + '">← ' + esc(byId[prev].title) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#' + next + '">' + esc(byId[next].title) + ' →</a>' : '') + '</div>';
    pageEl.innerHTML = h;
    wireReadings(pageEl);
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
    var h = '<h1>Search: “' + esc(q) + '”</h1>';
    h += res.length ? '<ul class="results">' + res.map(function (x) { return '<li><a href="#' + x.e.id + '"><b>' + esc((x.e.label ? x.e.label + ' · ' : '') + x.e.title) + '</b></a><div class="snip">…' + hl(x.snip) + '…</div></li>'; }).join('') + '</ul>' : '<p class="muted">No pages match.</p>';
    if (gl.length) h += '<h2>Glossary</h2><dl class="gloss">' + gl.map(function (x) { return '<dt>' + hl(x.term) + '</dt><dd>' + hl(x.def) + ' <small>· <a href="#' + x.page + '">' + esc(x.where) + '</a></small></dd>'; }).join('') + '</dl>';
    pageEl.innerHTML = h;
  }
  var sbox = document.getElementById('search'), st;
  sbox.oninput = function () { clearTimeout(st); st = setTimeout(function () { var v = sbox.value.trim(); if (v.length >= 2) location.hash = '#search=' + encodeURIComponent(v); }, 300); };

  /* ---------- router ---------- */
  function route() {
    closeMenu();
    var hsh = decodeURIComponent(location.hash.replace(/^#/, '')) || 'start';
    if (hsh.indexOf('search=') === 0) { renderSidebar(''); renderSearch(hsh.slice(7)); return; }
    if (!byId[hsh]) hsh = 'start';
    renderSidebar(hsh);
    var p = byId[hsh];
    if (p.special === 'books') renderBooks();
    else if (p.special === 'formulas') renderFormulas();
    else if (p.special === 'glossary') renderGlossary();
    else renderStudyPage(p);
    document.title = p.title + ' · FSM Study Guide';
  }
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });
  route();
})();
