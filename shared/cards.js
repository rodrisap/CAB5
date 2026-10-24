/* Flashcards with spaced repetition. Your own cards (plus optional course decks),
   stored in this browser and shared by the guide, practice and case pages.
   Each card comes back after 1, 3, 7, 14, 30 days when you know it, and much sooner when you don't.
   If you set an exam date in Practice → Settings, no card is scheduled after the day before the exam. */
(function (root) {
  if (typeof document === 'undefined') return;
  var KEY = 'fsm.cards.v1', MIN = 60000, DAY = 86400000;
  var IV = [0, 1, 3, 7, 14, 30, 60]; // days per box
  var listeners = [];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} listeners.forEach(function (f) { f(); }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function examCap() { try { var s = JSON.parse(localStorage.getItem('fsm.practice.v1') || '{}'); var d = s.settings && s.settings.examDate; return d ? new Date(d + 'T09:00').getTime() - DAY : 0; } catch (e) { return 0; } }
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function startOfToday() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function whenText(ts) {
    var diff = ts - Date.now();
    if (diff <= 0) return 'due now';
    if (diff < 3600000) return 'in ' + Math.max(1, Math.round(diff / MIN)) + ' min';
    if (diff < DAY) return 'in ' + Math.round(diff / 3600000) + ' h';
    var days = Math.round((new Date(ts).setHours(0, 0, 0, 0) - startOfToday()) / DAY);
    return days === 1 ? 'tomorrow' : 'in ' + days + ' days';
  }
  // next due time and box for an answer: 0 = again, 1 = hard, 2 = good, 3 = easy
  function plan(c, grade) {
    var now = Date.now(), box = c.box || 0, nb, due;
    if (grade === 0) { nb = 1; due = now + 10 * MIN; }
    else if (grade === 1) { nb = Math.max(1, box); due = now + Math.max(DAY / 2, IV[nb] * DAY / 2); }
    else if (grade === 2) { nb = Math.min(IV.length - 1, box + 1); due = now + IV[nb] * DAY; }
    else { nb = Math.min(IV.length - 1, box + 2); due = now + IV[nb] * DAY; }
    var cap = examCap(); if (cap && cap > now && due > cap && grade > 0) due = cap;
    return { box: nb, due: due };
  }

  var C = root.FSMCards = {
    all: load,
    due: function () { var now = Date.now(); return load().filter(function (c) { return (c.due || 0) <= now; }); },
    forPage: function (id) { return load().filter(function (c) { return c.page === id; }); },
    add: function (o) { var a = load(); var c = { id: uid(), front: o.front || '', back: o.back || '', page: o.page || 'general', title: o.title || 'General', deck: o.deck || 'mine', box: 0, due: Date.now(), t: Date.now(), n: 0 }; a.push(c); save(a); return c; },
    addMany: function (list) { var a = load(), have = {}; a.forEach(function (c) { have[c.front.trim().toLowerCase()] = 1; }); var n = 0; list.forEach(function (o) { var k = (o.front || '').trim().toLowerCase(); if (!k || have[k]) return; have[k] = 1; n++; a.push({ id: uid(), front: o.front, back: o.back, page: o.page || 'general', title: o.title || 'General', deck: o.deck || 'mine', box: 0, due: Date.now() - 1000 + Math.floor((n - 1) / 20) * DAY, t: Date.now(), n: 0 }); }); save(a); return n; }, // ready-made decks: 20 new cards a day
    update: function (id, ch) { var a = load(); a.forEach(function (c) { if (c.id === id) Object.keys(ch).forEach(function (k) { c[k] = ch[k]; }); }); save(a); },
    remove: function (id) { var a = load(), g = null; a = a.filter(function (c) { if (c.id === id) { g = c; return false; } return true; }); save(a); return g; },
    restore: function (c) { var a = load(); a.push(c); save(a); },
    replaceAll: function (a) { save(a); },
    removeDeck: function (deck) { save(load().filter(function (c) { return c.deck !== deck; })); },
    plan: plan, whenText: whenText, fmt: fmt, esc: esc,
    onChange: function (f) { listeners.push(f); },
    review: function (filterPage) { openReview(filterPage); }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) listeners.forEach(function (f) { f(); }); });

  /* ---------- the course deck (written for this exam), unlocked week by week ---------- */
  var OFF = 'fsm.cards.courseOff', WK = 'fsm.study.weeks';
  var PAGES = ['fin_w1', 'fin_w2', 'fin_w3', 'fin_w4', 'fin_w5', 'fin_w6', 'case', 'scm_ch1', 'scm_ch2', 'scm_ch3', 'scm_ch5', 'scm_ch9', 'scm_ch11'];
  var LABEL = { fin_w1: 'Week 1', fin_w2: 'Week 2', fin_w3: 'Week 3', fin_w4: 'Week 4', fin_w5: 'Week 5', fin_w6: 'Week 6', 'case': 'Case', scm_ch1: 'SCM Ch 1', scm_ch2: 'SCM Ch 2', scm_ch3: 'SCM Ch 3', scm_ch5: 'SCM Ch 5', scm_ch9: 'SCM Ch 9', scm_ch11: 'SCM Ch 11' };
  function courseOff() { try { return localStorage.getItem(OFF) === '1'; } catch (e) { return false; } }
  function weeksOn() { try { var w = JSON.parse(localStorage.getItem(WK)); if (Array.isArray(w)) return w; } catch (e) {} return ['fin_w1']; }
  function installCourse() {
    var D = root.FSM_COURSE_CARDS; if (!D) return 0;
    var on = courseOff() ? [] : weeksOn(), a = load(), changed = false;
    // cards of weeks you haven't reached yet (and never studied) are taken out again
    a = a.filter(function (c) { var keep = c.deck !== 'course' || c.n || on.indexOf(c.page) >= 0; if (!keep) changed = true; return keep; });
    var have = {}; a.forEach(function (c) { have[c.id] = 1; });
    var newOnes = D.cards.filter(function (c) { return !have[c.id] && on.indexOf(c.page) >= 0; });
    newOnes.sort(function (x, y) { return PAGES.indexOf(x.page) - PAGES.indexOf(y.page); }); // stable: keeps the order inside a week
    var base = Date.now() - 100000;
    newOnes.forEach(function (c, i) { a.push({ id: c.id, front: c.front, back: c.back, page: c.page, title: c.title, deck: 'course', box: 0, due: base + i, t: Date.now(), n: 0 }); });
    if (changed || newOnes.length) try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
    return newOnes.length;
  }
  C.course = {
    on: function () { return !!root.FSM_COURSE_CARDS && !courseOff(); },
    total: function () { return root.FSM_COURSE_CARDS ? root.FSM_COURSE_CARDS.cards.length : 0; },
    countFor: function (p) { return root.FSM_COURSE_CARDS ? root.FSM_COURSE_CARDS.cards.filter(function (c) { return c.page === p; }).length : 0; },
    pages: PAGES, label: LABEL,
    weeks: weeksOn,
    setWeek: function (p, yes) { var w = weeksOn().filter(function (x) { return x !== p; }); if (yes) w.push(p); try { localStorage.setItem(WK, JSON.stringify(w)); } catch (e) {} installCourse(); listeners.forEach(function (f) { f(); }); },
    remove: function () { try { localStorage.setItem(OFF, '1'); } catch (e) {} C.removeDeck('course'); },
    restore: function () { try { localStorage.removeItem(OFF); } catch (e) {} installCourse(); listeners.forEach(function (f) { f(); }); }
  };
  installCourse();

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.fc-ov{position:fixed;inset:0;z-index:98;background:var(--bg);display:flex;flex-direction:column}' +
    '.fc-top{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid var(--line);background:var(--surface)}' +
    '.fc-top .fc-prog{flex:1;height:6px;background:var(--surface-2);border-radius:4px;overflow:hidden;max-width:360px}.fc-top .fc-prog i{display:block;height:100%;background:var(--accent)}' +
    '.fc-stage{flex:1;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:24px 16px 40px}' +
    '.fc-card{width:min(640px,100%);background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.06);padding:26px 24px;min-height:200px;display:flex;flex-direction:column;gap:14px}' +
    '.fc-where{font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}' +
    '.fc-front{font-size:1.25rem;font-weight:600;line-height:1.4}' +
    '.fc-back{border-top:1px dashed var(--line);padding-top:14px;font-size:1.05rem;line-height:1.55}' +
    '.fc-btns{width:min(640px,100%);display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}' +
    '.fc-btns button{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:58px;padding:6px}.fc-btns small{font-size:.74rem;opacity:.85;font-weight:400}' +
    '.fc-btns .g0{background:var(--bad);border-color:var(--bad)}.fc-btns .g1{background:var(--warn);border-color:var(--warn);color:#fff}.fc-btns .g3{background:var(--good);border-color:var(--good)}' +
    '.fc-show{width:min(640px,100%);margin-top:14px;min-height:52px;font-size:1.05rem}' +
    '.fc-hint{font-size:.8rem;color:var(--muted);margin-top:10px;text-align:center}' +
    '.fc-done{text-align:center;max-width:520px}' +
    '@media(max-width:520px){.fc-btns{grid-template-columns:repeat(2,1fr)}.fc-card{padding:20px 16px}}';
  document.head.appendChild(css);

  /* ---------- review session (works on every page) ---------- */
  var ov = null, keyH = null;
  function openReview(filterPage) {
    var queue = C.due().filter(function (c) { return !filterPage || c.page === filterPage; }).sort(function (a, b) { return a.due - b.due; });
    var total = queue.length, done = 0, again = 0, showing = false, cur = null;
    ov = document.createElement('div'); ov.className = 'fc-ov';
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    function close() { if (keyH) document.removeEventListener('keydown', keyH); ov.remove(); ov = null; document.body.style.overflow = ''; listeners.forEach(function (f) { f(); }); }
    function draw() {
      if (!queue.length) {
        var next = load().filter(function (c) { return c.due > Date.now(); }).sort(function (a, b) { return a.due - b.due; })[0];
        ov.innerHTML = '<div class="fc-top"><b>Flashcards</b><button type="button" class="ghost" id="fcClose">Close</button></div><div class="fc-stage"><div class="fc-done card"><h2>' + (total ? 'Done! 🎉' : 'Nothing due right now') + '</h2><p>' + (total ? 'You reviewed ' + total + ' card' + (total === 1 ? '' : 's') + (again ? ' (' + again + ' needed another go)' : '') + '.' : 'All your cards are scheduled for later.') + '</p>' + (next ? '<p class="muted">Next card is due <b>' + whenText(next.due) + '</b>. The site shows a reminder when cards are due.</p>' : '<p class="muted">Add cards with the ✎ Notes button → Flashcards, or on the Flashcards page.</p>') + '<button type="button" id="fcClose2">Close</button></div></div>';
        ov.querySelector('#fcClose').onclick = close; ov.querySelector('#fcClose2').onclick = close; return;
      }
      cur = queue[0];
      var p = [0, 1, 2, 3].map(function (g) { return whenText(plan(cur, g).due); });
      ov.innerHTML = '<div class="fc-top"><b>Flashcards</b><span class="small muted">' + done + ' / ' + total + '</span><span class="fc-prog"><i style="width:' + (total ? Math.round(100 * done / total) : 0) + '%"></i></span><button type="button" class="ghost" id="fcClose">Stop</button></div>' +
        '<div class="fc-stage"><div class="fc-card"><div class="fc-where">' + esc(cur.title || '') + '</div><div class="fc-front">' + fmt(cur.front) + '</div>' + (showing ? '<div class="fc-back">' + fmt(cur.back) + '</div>' : '') + '</div>' +
        (showing ? '<div class="fc-btns"><button type="button" class="g0" data-g="0">Again<small>' + p[0] + '</small></button><button type="button" class="g1" data-g="1">Hard<small>' + p[1] + '</small></button><button type="button" class="g2" data-g="2">Good<small>' + p[2] + '</small></button><button type="button" class="g3" data-g="3">Easy<small>' + p[3] + '</small></button></div><div class="fc-hint">Keys: 1 Again · 2 Hard · 3 Good · 4 Easy</div>'
          : '<button type="button" class="fc-show" id="fcShow">Show answer</button><div class="fc-hint">Say or write the answer first, then check. Space shows the answer.</div>') + '</div>';
      ov.querySelector('#fcClose').onclick = close;
      var sh = ov.querySelector('#fcShow'); if (sh) sh.onclick = function () { showing = true; draw(); };
      ov.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { grade(+b.getAttribute('data-g')); }; });
    }
    function grade(g) {
      var np = plan(cur, g); C.update(cur.id, { box: np.box, due: np.due, n: (cur.n || 0) + 1, last: Date.now() });
      queue.shift();
      if (g === 0) { again++; var c2 = load().filter(function (c) { return c.id === cur.id; })[0]; if (c2) queue.splice(Math.min(queue.length, 3), 0, c2); }
      else done++;
      showing = false; draw();
    }
    keyH = function (e) {
      if (!ov) return;
      if (e.key === 'Escape') { close(); return; }
      if (!showing && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); showing = true; draw(); return; }
      if (showing && /^[1-4]$/.test(e.key)) grade(+e.key - 1);
    };
    document.addEventListener('keydown', keyH);
    draw();
  }
})(window);
