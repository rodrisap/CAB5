/* Case-based mock exam UI (2 hours, 70 finance + 30 SCM, pass at 55). */
(function () {
  var FSM = window.FSM, F = FSM.fmt, esc = F.esc;
  var KEY = 'fsm.case.v1';
  var view = document.getElementById('view');
  var st = load();
  var exam = null, timerId = null;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { history: [], current: null }; } catch (e) { return { history: [], current: null }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage blocked: keep in memory */ } }

  /* theme + formula drawer (same behaviour as practice) */
  (function () {
    var t = null; try { t = localStorage.getItem('fsm.theme'); } catch (e) {}
    if (t) document.documentElement.setAttribute('data-theme', t);
    document.getElementById('themeBtn').onclick = function () {
      var cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var nx = cur === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nx); try { localStorage.setItem('fsm.theme', nx); } catch (e) {}
    };
    var dr = document.getElementById('formulaDrawer');
    document.getElementById('formulaBody').innerHTML = FSM.FORMULAS.map(function (g) { return '<h3>' + esc(g.group) + '</h3><table class="fs">' + g.items.map(function (i) { return '<tr><td><b>' + esc(i[0]) + '</b></td><td>' + esc(i[1]) + '</td></tr>'; }).join('') + '</table>'; }).join('');
    document.getElementById('formulaBtn').onclick = function () { dr.classList.toggle('open'); };
    document.getElementById('formulaClose').onclick = function () { dr.classList.remove('open'); };
  })();

  function getCase(id) {
    var m = FSM.cases.MOCKS.filter(function (x) { return x.id === id; })[0];
    if (m) return m;
    var seed = parseInt(String(id).replace('gen', ''), 10) || 1;
    return FSM.cases.generate(seed);
  }

  /* ---------------- start screen ---------------- */
  function renderStart() {
    stopTimer();
    var h = '<h1>Case exam</h1><p>This works like the real exam. You get one company case and 9 questions: Managerial Finance (70 points, Q1–6) and Supply Chain Management (30 points, Q7–9), with 2 hours and a pass mark of 55. You have the formula sheet. <b>Show your calculations</b> in the notes box under each question, as in the exam ("no calculations = no points"). Numbers are checked automatically; written answers you mark yourself against the model answer.</p>';
    if (st.current) h += '<div class="card"><b>Exam in progress:</b> ' + esc(st.current.label) + ' <button type="button" id="resume">Continue</button> <button type="button" class="ghost" id="discard">Discard</button></div>';
    h += '<div class="grid2"><div class="card"><h3>Official mock exams</h3><p class="small muted">The two practice exams from the course, with full worked solutions.</p>' +
      FSM.cases.MOCKS.map(function (m) { return '<button type="button" class="block startbtn" data-id="' + m.id + '">' + esc(m.label) + '</button>'; }).join('') + '</div>' +
      '<div class="card"><h3>New case</h3><p class="small muted">A new fictional company with different numbers each time. Each question slot mixes the mock versions with other course topics (ratios, operating cycle, discounts and payables, EPS forecasts, exchange rates, the equity method, full consolidation, utilities, JIT vs EOQ, quadrant and ABC, FOB terms, carrier scorecards). The same version number always gives the same case.</p><label class="small">Version # <input type="number" id="ver" min="1" value="' + (Math.floor(Math.random() * 9000) + 100) + '" style="width:120px"></label> <button type="button" id="gen">Start new case</button></div></div>';
    h += '<label class="check"><input type="checkbox" id="timer" checked> 2-hour countdown timer</label>';
    if (st.history.length) {
      h += '<h2>Your results</h2><table class="hist"><tr><th>Date</th><th>Case</th><th>Finance /70</th><th>SCM /30</th><th>Total</th></tr>' + st.history.slice(-15).reverse().map(function (r) {
        return '<tr><td>' + new Date(r.t).toLocaleDateString() + '</td><td>' + esc(r.label) + '</td><td>' + F.num(r.fin, 1) + '</td><td>' + F.num(r.scm, 1) + '</td><td><b class="' + (r.total >= 55 ? 'pass' : 'fail') + '">' + F.num(r.total, 1) + '</b></td></tr>'; }).join('') + '</table>';
    }
    view.innerHTML = h;
    view.querySelectorAll('.startbtn').forEach(function (b) { b.onclick = function () { start(b.getAttribute('data-id')); }; });
    document.getElementById('gen').onclick = function () { start('gen' + (parseInt(document.getElementById('ver').value, 10) || 1)); };
    var rs = document.getElementById('resume'); if (rs) rs.onclick = function () { open(st.current); };
    var ds = document.getElementById('discard'); if (ds) ds.onclick = function () { st.current = null; save(); renderStart(); };
  }

  function start(id) {
    var d = getCase(id);
    st.current = { id: id, label: d.label, started: Date.now(), timer: document.getElementById('timer').checked, answers: {}, notes: {}, submitted: false, self: {} };
    save(); open(st.current);
  }

  /* ---------------- exam screen ---------------- */
  function open(cur) {
    var d = getCase(cur.id); exam = FSM.cases.buildExam(d); exam.cur = cur;
    var h = '<div class="xbar"><b>' + esc(d.label) + '</b><span id="clock" class="clock"></span><button type="button" class="ghost" id="caseToggle">Show / hide case</button>' + (cur.submitted ? '<button type="button" class="ghost" id="back">All exams</button>' : '<button type="button" id="submit">Hand in</button>') + '</div>';
    h += '<div class="xgrid"><section class="casedoc" id="casedoc">' + exam.html + '</section><section class="qcol" id="qcol">';
    if (cur.submitted) h += scoreHTML();
    exam.questions.forEach(function (q) {
      h += '<div class="card q" id="q' + q.n + '"><div class="qtitle"><span class="tag ' + q.area + '">' + (q.area === 'fin' ? 'Finance' : 'SCM') + '</span> <b>' + q.n + '. ' + esc(q.title) + '</b> <span class="small muted">(' + q.parts.reduce(function (s, p) { return s + p.pts; }, 0) + ' points)</span></div>' + (q.intro ? '<div class="qintro">' + q.intro + '</div>' : '');
      q.parts.forEach(function (p) { h += partHTML(p, cur); });
      h += '</div>';
    });
    if (!cur.submitted) h += '<button type="button" id="submit2" class="block">Hand in exam</button>';
    h += '</section></div>';
    view.innerHTML = h;
    wire(cur);
    if (!cur.submitted && cur.timer) startTimer(cur); else document.getElementById('clock').textContent = cur.submitted ? '' : 'no timer';
    window.scrollTo(0, 0);
  }

  function partHTML(p, cur) {
    var a = cur.answers[p.id] || {}, sub = cur.submitted, h = '<div class="xpart" data-pid="' + p.id + '"><div class="plabel"><b>' + p.id + '</b> <span class="small muted">(' + p.pts + 'p)</span></div><div class="pprompt">' + p.prompt + '</div>';
    if (p.fields) {
      h += '<div class="fields">' + p.fields.map(function (f, i) {
        var val = a[i] !== undefined ? a[i] : '', res = sub ? gradeField(f, val) : null;
        return '<label class="frow' + (res ? (res ? ' ok' : '') : '') + '"><span>' + esc(f.label) + '</span><input type="text" inputmode="decimal" data-i="' + i + '" value="' + esc(val) + '"' + (sub ? ' disabled' : '') + '>' +
          (sub ? '<span class="fres ' + (res ? 'ok' : 'no') + '">' + (res ? '✓' : '✗ ') + (res ? '' : fmtAns(f)) + '</span>' : '<span class="small muted">' + unitHint(f) + '</span>') + '</label>';
      }).join('') + '</div>';
    }
    h += '<textarea class="notes" placeholder="' + (p.open && !p.fields ? 'Your answer…' : 'Show your calculation / explanation…') + '"' + (sub ? ' disabled' : '') + '>' + esc(cur.notes[p.id] || '') + '</textarea>';
    if (sub) {
      h += '<details class="model" open><summary>Model answer' + (p.fields ? ' & calculation' : '') + '</summary>' + p.model + (p.extra || '') + '</details>';
      if (p.check) {
        var ticks = cur.self[p.id] || [];
        h += '<div class="selfgrade"><b>Mark your written answer:</b> tick what you covered' + (p.need ? ' (full marks at ' + p.need + ')' : '') + '<div class="checks">' + p.check.map(function (c, k) { return '<label><input type="checkbox" data-k="' + k + '"' + (ticks[k] ? ' checked' : '') + '> ' + esc(c) + '</label>'; }).join('') + '</div></div>';
      }
      h += '<div class="pscore">Points: <b data-score="' + p.id + '">' + F.num(partScore(p, cur), 1) + '</b> / ' + p.pts + '</div>';
    }
    return h + '</div>';
  }
  function unitHint(f) { return f.unit === 'pct' ? 'e.g. 7.23%' : f.unit === 'days' ? 'days' : f.unit === 'x' ? 'times' : f.unit === 'cur' ? '€' : /€ ?m|million/i.test(f.label) ? '€m' : ''; }
  function fmtAns(f) { return f.unit === 'pct' ? F.num(f.ans * 100, 2) + '%' : f.unit === 'cur' ? '€' + F.num(f.ans, f.dp || 0) : F.num(f.ans, f.dp === undefined ? 2 : f.dp); }
  function gradeField(f, val) {
    if (val === '' || val === undefined) return false;
    var g = F.grade(val, f.ans, f.unit === 'x' || f.unit === 'days' ? 'num' : f.unit, { tolRel: 0.01, tolAbs: f.tolAbs !== undefined ? f.tolAbs : (f.unit === 'cur' ? 1 : f.unit === 'pct' ? 0.0005 : 0.01) });
    if (!g.ok && f.alts) f.alts.forEach(function (a) { if (!g.ok) g = F.grade(val, a, f.unit === 'x' || f.unit === 'days' ? 'num' : f.unit, { tolRel: 0.01, tolAbs: f.tolAbs !== undefined ? f.tolAbs : (f.unit === 'cur' ? 1 : f.unit === 'pct' ? 0.0005 : 0.01) }); });
    return !!g.ok;
  }
  function partScore(p, cur) {
    var a = cur.answers[p.id] || {}, fieldShare = p.fields ? (p.check ? 0.6 : 1) : 0, s = 0;
    if (p.fields) { var ok = p.fields.filter(function (f, i) { return gradeField(f, a[i]); }).length; s += p.pts * fieldShare * ok / p.fields.length; }
    if (p.check) { var t = (cur.self[p.id] || []).filter(Boolean).length, need = p.need || p.check.length; s += p.pts * (1 - fieldShare) * Math.min(1, t / need); }
    return Math.round(s * 10) / 10;
  }
  function totals(cur) {
    var t = { fin: 0, scm: 0 };
    exam.questions.forEach(function (q) { q.parts.forEach(function (p) { t[q.area] += partScore(p, cur); }); });
    t.total = t.fin + t.scm; return t;
  }
  function scoreHTML() {
    var t = totals(exam.cur);
    return '<div class="card scorecard" id="scorecard"><div><div class="small muted">Your score</div><div class="big ' + (t.total >= 55 ? 'pass' : 'fail') + '">' + F.num(t.total, 1) + ' / 100</div><div>' + (t.total >= 55 ? 'Pass (≥ 55)' : 'Not yet a pass (need 55)') + '</div></div><div><div>Finance: <b>' + F.num(t.fin, 1) + '</b> / 70</div><div>Supply chain: <b>' + F.num(t.scm, 1) + '</b> / 30</div><p class="small muted">Written answers count once you tick the points you covered. Be strict with yourself.</p></div></div>';
  }

  function wire(cur) {
    var cd = document.getElementById('casedoc');
    try { if (localStorage.getItem('fsm.case.hide') === '1') cd.classList.add('hidden'); } catch (e) {}
    document.getElementById('caseToggle').onclick = function () { cd.classList.toggle('hidden'); try { localStorage.setItem('fsm.case.hide', cd.classList.contains('hidden') ? '1' : '0'); } catch (e) {} };
    view.querySelectorAll('.xpart').forEach(function (el) {
      var pid = el.getAttribute('data-pid');
      el.querySelectorAll('.fields input').forEach(function (inp) { inp.oninput = function () { (cur.answers[pid] = cur.answers[pid] || {})[inp.getAttribute('data-i')] = inp.value; save(); }; });
      var ta = el.querySelector('textarea'); if (ta) ta.oninput = function () { cur.notes[pid] = ta.value; save(); };
      el.querySelectorAll('.checks input').forEach(function (cb) {
        cb.onchange = function () {
          var arr = cur.self[pid] = cur.self[pid] || []; arr[+cb.getAttribute('data-k')] = cb.checked; save();
          var p = findPart(pid); el.querySelector('[data-score]').textContent = F.num(partScore(p, cur), 1);
          var sc = document.getElementById('scorecard'); if (sc) sc.outerHTML = scoreHTML(); recordResult(cur);
        };
      });
    });
    var sb = document.getElementById('submit'), sb2 = document.getElementById('submit2');
    [sb, sb2].forEach(function (b) { if (b) b.onclick = function () { if (confirm('Hand in the exam? You can\'t change answers afterwards.')) submit(cur); }; });
    var bk = document.getElementById('back'); if (bk) bk.onclick = function () { st.current = null; save(); renderStart(); };
  }
  function findPart(pid) { var r = null; exam.questions.forEach(function (q) { q.parts.forEach(function (p) { if (p.id === pid) r = p; }); }); return r; }

  function submit(cur) { cur.submitted = true; cur.ended = Date.now(); stopTimer(); recordResult(cur); save(); open(cur); }
  function recordResult(cur) {
    var t = totals(cur), h = st.history, last = h[h.length - 1];
    var rec = { t: cur.ended || Date.now(), id: cur.id, label: cur.label, fin: t.fin, scm: t.scm, total: t.total, started: cur.started };
    if (last && last.started === cur.started) h[h.length - 1] = rec; else h.push(rec);
    save();
  }

  function startTimer(cur) {
    stopTimer();
    var end = cur.started + 2 * 3600 * 1000, el = document.getElementById('clock');
    function tick() {
      var left = end - Date.now();
      if (left <= 0) { el.textContent = '0:00:00'; stopTimer(); alert('Time is up — the exam is handed in.'); submit(cur); return; }
      var s = Math.floor(left / 1000), hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
      el.textContent = '⏱ ' + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; el.classList.toggle('low', left < 15 * 60 * 1000);
    }
    tick(); timerId = setInterval(tick, 1000);
  }
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

  window.__caseStart = start; // for tests
  if (st.current && !st.current.submitted) open(st.current); else renderStart();
})();
