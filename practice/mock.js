/* Exam-question trainer: every question type from the two official mock exams,
   phrased exactly like the mock, with new numbers each time. */
(function () {
  var FSM = window.FSM, F = FSM.fmt, esc = F.esc;
  var KEY = 'fsm.mock.v1';
  var view = document.getElementById('view');
  var S = load();
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.att) return s; } catch (e) {} return { att: {} }; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* theme + formula drawer */
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

  /* ---------- the question types, straight from the two mocks ---------- */
  var TYPES = [
    { id: 'q1-legal', slot: 1, mocks: [1], v: 'legal', title: 'Legal forms + effective tax rate on dividends', guide: 'fin_w1' },
    { id: 'q1-market', slot: 1, mocks: [2], v: 'market', title: 'Buying shares (bid/ask) + which steps raise funds', guide: 'fin_w1' },
    { id: 'q2-ccc', slot: 2, mocks: [1, 2], v: null, title: 'Cash conversion cycle + resources needed', guide: 'fin_w3', needCase: true },
    { id: 'q3-credit', slot: 3, mocks: [1], v: 'credit', title: 'Relaxing the credit policy (ΔCM, ΔA/R cost, Δbad debts, decision)', guide: 'fin_w3' },
    { id: 'q3-options', slot: 3, mocks: [2], v: 'options', title: 'Three funding options: € cost, EAR, choice', guide: 'fin_w4' },
    { id: 'q4-leverage', slot: 4, mocks: [1, 2], v: null, title: 'DOL, DFL (with preferred dividends), DTL + interpretation', guide: 'fin_w5', needCase: true },
    { id: 'q5-wacc', slot: 5, mocks: [1], v: 'wacc', title: 'WACC on book values + project decision', guide: 'fin_w5', needCase: true },
    { id: 'q5-tax', slot: 5, mocks: [2], v: 'tax', title: 'Double taxation, with and without tax credit', guide: 'fin_w6' },
    { id: 'q6-templates', slot: 6, mocks: [1], v: 'templates', title: 'Balance sheet after the purchase + final consolidation', guide: 'fin_w6', needCase: true },
    { id: 'q6-explain', slot: 6, mocks: [2], v: 'templates', explain: true, title: 'Why eliminate investment vs equity + final consolidation', guide: 'fin_w6' },
    { id: 'q7-inventory', slot: 7, mocks: [1], v: 'inventory', title: 'Three ways to cut inventory + new-supplier impact', guide: 'scm_ch9', needCase: true },
    { id: 'q7-logistics', slot: 7, mocks: [2], v: 'logistics', title: 'Define logistics + its goal; the 7 Rs', guide: 'scm_ch3' },
    { id: 'q8-criteria', slot: 8, mocks: [1], v: 'criteria', title: 'Five supplier selection criteria', guide: 'scm_ch5' },
    { id: 'q8-supplier', slot: 8, mocks: [2], v: 'supplier', title: 'New supplier: impact on 5 items', guide: 'scm_ch9', needCase: true },
    { id: 'q9-tlc', slot: 9, mocks: [1], v: 'tlc', title: 'Total landed cost: explain + calculate', guide: 'scm_ch5' },
    { id: 'q9-mode', slot: 9, mocks: [2], v: 'mode', title: 'Choose 2 transport modes; distant supplier → inventory', guide: 'scm_ch11' }
  ];
  // Other course topics written in the same exam style; any of these could replace a mock question in the real exam.
  [['q1', 'ratios', 'Financial ratios from the statements (current ratio, turnover, ROE, EPS, P/E…)', 'fin_w2', 1],
   ['q1', 'taxforms', 'Sole proprietor vs corporation: tax and liability', 'fin_w1'],
   ['q1', 'cashaccrual', 'Cash vs accrual: profit vs cash flow', 'fin_w1'],
   ['q2', 'opcycle', 'Operating cycle + CCC from AAI, ACP, APP', 'fin_w3', 1],
   ['q3', 'discount', 'Introducing an early-payment discount', 'fin_w3'],
   ['q3', 'payables', 'Accounts payable: take the discount or pay late?', 'fin_w4'],
   ['q4', 'epsforecast', 'EPS at different EBIT levels + DFL', 'fin_w5', 1],
   ['q5', 'fx', 'Exchange rates + forward contract', 'fin_w6'],
   ['q5', 'equity', 'Investments in other companies (equity method)', 'fin_w6'],
   ['q6', 'full', 'Full consolidation from two balance sheets', 'fin_w6'],
   ['q7', 'utilities', 'Value-added roles (utilities) of logistics', 'scm_ch3'],
   ['q7', 'approaches', 'Inventory approaches: JIT, EOQ, MRP, DRP, VMI', 'scm_ch9'],
   ['q8', 'quadrant', 'Types of purchases (quadrant technique)', 'scm_ch5'],
   ['q8', 'abc', 'ABC inventory classification', 'scm_ch9'],
   ['q9', 'fob', 'Terms of sale (FOB origin vs destination)', 'scm_ch11'],
   ['q9', 'scorecard', 'Carrier performance scorecard', 'scm_ch11']].forEach(function (e) {
    TYPES.push({ id: e[0] + '-' + e[1], slot: +e[0].slice(1), mocks: [], extra: true, v: e[1], title: e[2], guide: e[3], needCase: !!e[4] });
  });
  var SLOT_PTS = { 1: 10, 2: 10, 3: 15, 4: 15, 5: 10, 6: 10, 7: 10, 8: 10, 9: 10 };
  var byId = {}; TYPES.forEach(function (t) { byId[t.id] = t; });
  var NEED = 2, PASS = 0.9; // mastered = last 2 attempts each ≥ 90%, new numbers every time

  function slotVariant(d, slot) { var o = d.variants['q' + slot]; return o && o.v ? o.v : null; }
  // find a generated case whose question in this slot is the mock version we want
  function findCase(t, seed) {
    for (var k = 0; k < 600; k++) {
      var s = ((seed * 7919 + k * 104729) % 2000000) + 1, d = FSM.cases.generate(s);
      if (slotVariant(d, t.slot) === t.v) return { d: d, seed: s };
    }
    return null;
  }
  function buildQuestion(t, src) {
    var d = src === 'mock1' ? FSM.cases.MOCKS[0] : src === 'mock2' ? FSM.cases.MOCKS[1] : null, seed = null;
    if (!d) { var fc = findCase(t, src); d = fc.d; seed = fc.seed; }
    var ex = FSM.cases.buildExam(d), q = ex.questions.filter(function (x) { return x.n === t.slot; })[0];
    if (t.explain && d.variants.q6 && d.variants.q6.v === 'templates') {
      // Mock 2 asks "explain why" instead of the first template; keep the final-consolidation part (same numbers).
      var m2 = FSM.cases.buildExam(FSM.cases.MOCKS[1]).questions.filter(function (x) { return x.n === 6; })[0];
      q = { n: 6, area: 'fin', title: q.title, intro: d.short + ' has acquired ' + d.variants.q6.target.name + '.', parts: [m2.parts[0], q.parts[1]] };
    }
    return { q: q, html: ex.html, d: d, seed: seed };
  }

  /* ---------- grading (same rules as the case exam) ---------- */
  function unitHint(f) { return f.unit === 'pct' ? 'e.g. 7.23%' : f.unit === 'days' ? 'days' : f.unit === 'x' ? 'times' : f.unit === 'cur' ? '€' : /€ ?m|million/i.test(f.label) ? '€m' : ''; }
  function fmtAns(f) { return f.unit === 'pct' ? F.num(f.ans * 100, 2) + '%' : f.unit === 'cur' ? '€' + F.num(f.ans, f.dp || 0) : F.num(f.ans, f.dp === undefined ? 2 : f.dp); }
  function gradeField(f, val) {
    if (val === '' || val === undefined) return false;
    var u = f.unit === 'x' || f.unit === 'days' ? 'num' : f.unit, o = { tolRel: 0.01, tolAbs: f.tolAbs !== undefined ? f.tolAbs : (f.unit === 'cur' ? 1 : f.unit === 'pct' ? 0.0005 : 0.01) };
    var g = F.grade(val, f.ans, u, o);
    if (!g.ok && f.alts) f.alts.forEach(function (a) { if (!g.ok) g = F.grade(val, a, u, o); });
    return !!g.ok;
  }
  function partScore(p, A) {
    var a = A.answers[p.id] || {}, fieldShare = p.fields ? (p.check ? 0.6 : 1) : 0, s = 0;
    if (p.fields) { var ok = p.fields.filter(function (f, i) { return gradeField(f, a[i]); }).length; s += p.pts * fieldShare * ok / p.fields.length; }
    if (p.check) { var t = (A.self[p.id] || []).filter(Boolean).length, need = p.need || p.check.length; s += p.pts * (1 - fieldShare) * Math.min(1, t / need); }
    return Math.round(s * 10) / 10;
  }
  function qPoints(q) { return q.parts.reduce(function (s, p) { return s + p.pts; }, 0); }

  /* ---------- progress ---------- */
  function att(id) { return S.att[id] || []; }
  function fresh(id) { return att(id).filter(function (x) { return x.src.indexOf('mock') !== 0; }); } // original mock numbers don't count: you have seen those answers
  function mastered(id) { var a = fresh(id).slice(-NEED); return a.length === NEED && a.every(function (x) { return x.s >= PASS; }); }
  function streak(id) { var a = fresh(id), n = 0; for (var i = a.length - 1; i >= 0 && a[i].s >= PASS; i--) n++; return Math.min(n, NEED); }
  function estScore() {
    var tot = 0;
    Object.keys(SLOT_PTS).forEach(function (sl) {
      var ts = TYPES.filter(function (t) { return t.slot === +sl && !t.extra; }), m = ts.filter(function (t) { return mastered(t.id); }).length;
      tot += SLOT_PTS[sl] * m / ts.length;
    });
    return Math.round(tot);
  }
  function dots(id) { var n = streak(id); return '<span class="dots" title="' + n + ' of ' + NEED + ' in a row">' + [0, 1].map(function (i) { return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') + '</span>'; }
  function refreshMeter() {
    var sc = estScore(), f = document.getElementById('meterFill'), l = document.getElementById('meterLabel');
    if (f) f.style.width = sc + '%'; if (l) l.textContent = sc + ' / 100 mastered';
  }

  /* ---------- home ---------- */
  function home() {
    var sc = estScore(), next = (function () { var order = ['fin_w1', 'fin_w2', 'fin_w3', 'fin_w4', 'fin_w5', 'fin_w6', 'scm_ch3', 'scm_ch5', 'scm_ch9', 'scm_ch11'], reached = order; return TYPES.filter(function (t) { return !t.extra && !mastered(t.id); }).sort(function (a, b) { var ra = reached.indexOf(a.guide) >= 0 ? 0 : 1, rb = reached.indexOf(b.guide) >= 0 ? 0 : 1; return ra - rb || order.indexOf(a.guide) - order.indexOf(b.guide) || a.slot - b.slot; })[0]; })();
    var due = window.FSMCards ? window.FSMCards.due().length : 0;
    var h = (due ? '<div class="mnote" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;background:var(--warn-soft)"><span>🃏 <b>' + due + '</b> flashcard' + (due === 1 ? ' is' : 's are') + ' due for review (≈ ' + Math.max(1, Math.round(due * 0.4)) + ' min).</span><button type="button" id="homeRev">Review now</button></div>' : '') + '<h1>Exam questions</h1><p class="muted">Every question type from the two mock exams, worded exactly like the mock. You get new numbers each time, so you learn the method, not the answer. Do one question, check it, mark your written parts, save, and move on.</p>';
    h += '<div class="hero2"><div class="card score-card"><div class="small muted">Estimated exam score</div><div><span class="big">' + sc + '</span><span class="muted"> / 100</span></div>' +
      '<div class="meter-bar big-bar"><span class="meter-fill" style="width:' + sc + '%"></span><span class="tick" style="left:55%"><i>55 pass</i></span><span class="tick" style="left:70%"><i>70 safe</i></span></div>' +
      '<p class="small" style="margin-top:22px">' + (sc >= 70 ? 'Above a safe 70. Now do a full mock under time pressure.' : sc >= 55 ? 'You\'d pass. ' + (70 - sc) + ' more points to a safe 70.' : (55 - sc) + ' points to a pass, ' + (70 - sc) + ' to a safe 70.') + '</p></div>' +
      '<div class="card"><b>How it works</b><ol class="small" style="padding-left:1.2em;margin:6px 0"><li>Answer every part (numbers in the boxes, working and written answers in the text box).</li><li>Press <b>Check</b>: numbers are marked, and you tick off the points your written answers cover.</li><li><b>Save &amp; next</b>. A question counts as <b>mastered</b> when you score ≥ 90% two times in a row, each time with new numbers.</li></ol><p class="small muted">The score counts the points of the question types you have mastered (Q1 has a Mock 1 and a Mock 2 version, so each is worth half of its 10 points, and so on).</p>' +
      (next ? '<a class="btn" href="#q=' + next.id + '">Next: ' + esc(next.title) + ' →</a>' : '<a class="btn" href="case.html">All mastered: do a full mock exam →</a>') + '</div></div>';
    var WEEKS = [['fin_w1', 'Week 1 · Finance basics & financial markets'], ['fin_w2', 'Week 2 · Financial statements & ratios'], ['fin_w3', 'Week 3 · Working capital, CCC & receivables'], ['fin_w4', 'Week 4 · Short-term funding & effective rates'], ['fin_w5', 'Week 5 · Leverage, capital structure & WACC'], ['fin_w6', 'Week 6 · International finance & consolidation'], ['scm_ch3', 'SCM Ch 3 · Role of logistics'], ['scm_ch5', 'SCM Ch 5 · Sourcing'], ['scm_ch9', 'SCM Ch 9 · Inventory'], ['scm_ch11', 'SCM Ch 11 · Transportation']];
    var reached = null;
    h += '<h2 class="section-title">By week</h2><p class="small muted" style="margin-top:-4px">In the order you study. <b>Mock</b> = asked in a mock exam (these count for the score). <b>Slides</b> = another topic from that week, written in the same exam style; it could replace a mock question.' + '' + '</p>';
    WEEKS.forEach(function (w) {
      var ts = TYPES.filter(function (t) { return t.guide === w[0]; }).sort(function (a, b) { return (a.extra ? 1 : 0) - (b.extra ? 1 : 0) || a.slot - b.slot; });
      if (!ts.length) return;
      var nm = ts.filter(function (t) { return mastered(t.id); }).length, open = !reached || reached.indexOf(w[0]) >= 0;
      h += '<details class="wkgroup"' + (open ? ' open' : '') + '><summary><b>' + esc(w[1]) + '</b> <span class="small muted">' + nm + ' / ' + ts.length + ' mastered</span></summary><div class="plan-list">';
      ts.forEach(function (t) {
        var a = att(t.id), last = a[a.length - 1], m = mastered(t.id), mins = Math.round(SLOT_PTS[t.slot] * 1.2);
        h += '<a class="plan-row qrow' + (m ? ' done' : '') + '" href="#q=' + t.id + '"><span class="idx"><span class="srctag ' + (t.extra ? 'sl' : 'mk') + '">' + (t.extra ? 'Slides' : 'Mock') + '</span></span><div class="t"><b>' + esc(t.title) + '</b><span>' + (t.extra ? 'Could replace Q' + t.slot : 'Q' + t.slot + ' in Mock ' + t.mocks.join(' & ')) + ' · ' + SLOT_PTS[t.slot] + ' points · ≈ ' + mins + ' min' + (last ? ' · last score ' + Math.round(last.s * 100) + '%' : '') + '</span></div><span class="go">' + (m ? '<span class="status mastered">Mastered</span>' : dots(t.id)) + '<span class="btn ghost">Practise</span></span></a>';
      });
      h += '</div></details>';
    });
    h += '<div class="grid2"><a class="card topic-card" href="case.html"><h3>Full mock exam (2 hours)</h3><div class="small muted">The two official mocks or a new case with all 9 questions and a timer.</div></a><a class="card topic-card" href="skills.html"><h3>Extra drills per topic</h3><div class="small muted">Short questions on single skills, if you want to train one step (for example only the DFL).</div></a></div>';
    view.innerHTML = h;
    var hr = document.getElementById('homeRev'); if (hr) hr.onclick = function () { window.FSMCards.review(); };
    refreshMeter();
  }

  /* ---------- one question ---------- */
  var cur = null;
  function showQ(id, src) {
    var t = byId[id]; if (!t) return home();
    src = src || (Math.floor(Math.random() * 99999) + 1);
    var b = buildQuestion(t, src);
    cur = { t: t, b: b, src: src, A: { answers: {}, notes: {}, self: {} }, checked: false, saved: false, started: Date.now() };
    var q = b.q, pts = qPoints(q), mins = Math.round(SLOT_PTS[t.slot] * 1.2);
    var h = '<p class="small"><a href="#home">← All exam questions</a></p>';
    h += '<div class="qhead2"><div><div class="small muted">' + (t.extra ? 'From the slides & book (could replace a mock question)' : 'Mock ' + t.mocks.join(' & ')) + ' · question ' + t.slot + ' · ' + pts + ' points · aim for ≈ ' + mins + ' min</div><h1 style="margin:2px 0 0">Q' + t.slot + '. ' + esc(q.title) + '</h1></div><div class="qstat">' + (mastered(id) ? '<span class="status mastered">Mastered</span>' : dots(id) + ' <span class="small muted">' + streak(id) + ' / ' + NEED + ' in a row</span>') + '</div></div>';
    h += '<div class="srcrow small">' + (typeof src === 'string' ? '<b>Original numbers from Mock ' + src.slice(-1) + '</b>' : 'New numbers · version ' + b.seed) + ' · ' + t.mocks.map(function (m) { return '<a href="#q=' + id + '&src=mock' + m + '">Original Mock ' + m + ' version</a> · '; }).join('') + '<a href="../guide/index.html#' + t.guide + '">Study the method</a></div>';
    h += '<details class="casebox"' + (t.needCase ? ' open' : '') + '><summary><b>Case: ' + esc(b.d.name) + '</b> <span class="small muted">(' + (t.needCase ? 'you need numbers from here' : 'company background; the question below has the data you need') + ')</span></summary><div class="casedoc">' + b.html + '</div></details>';
    h += '<div class="card q" id="qcard">' + (q.intro ? '<div class="qintro">' + q.intro + '</div>' : '') + q.parts.map(partHTML).join('') +
      '<div class="btnrow" id="qbtns"><button type="button" id="checkBtn">Check</button><button type="button" class="ghost" id="giveUp">Show the solution</button></div><div id="resBox"></div></div>';
    view.innerHTML = h;
    wire();
    window.scrollTo(0, 0);
  }
  function partHTML(p) {
    var h = '<div class="xpart" data-pid="' + p.id + '"><div class="plabel"><b>' + p.id + ')</b> <span class="small muted">(' + p.pts + ' points)</span></div><div class="pprompt">' + p.prompt + '</div>';
    if (p.fields) h += '<div class="fields">' + p.fields.map(function (f, i) { return '<label class="frow"><span>' + esc(f.label) + '</span><input type="text" inputmode="decimal" data-i="' + i + '" autocomplete="off"><span class="small muted fhint">' + unitHint(f) + '</span></label>'; }).join('') + '</div>';
    h += '<textarea class="notes" placeholder="' + (p.open && !p.fields ? 'Write your answer as you would in the exam…' : 'Show your calculation (no calculation = no points in the exam)…') + '"></textarea><div class="pres"></div>';
    return h + '</div>';
  }
  function wire() {
    view.querySelectorAll('.xpart').forEach(function (el) {
      var pid = el.getAttribute('data-pid');
      el.querySelectorAll('.fields input').forEach(function (inp) { inp.oninput = function () { (cur.A.answers[pid] = cur.A.answers[pid] || {})[inp.getAttribute('data-i')] = inp.value; }; });
    });
    document.getElementById('checkBtn').onclick = function () { check(false); };
    document.getElementById('giveUp').onclick = function () { check(true); };
  }
  function check(gaveUp) {
    if (cur.checked) return; cur.checked = true; cur.gaveUp = gaveUp;
    var q = cur.b.q;
    q.parts.forEach(function (p) {
      var el = view.querySelector('.xpart[data-pid="' + p.id + '"]'), a = cur.A.answers[p.id] || {};
      el.querySelectorAll('input, textarea').forEach(function (i) { i.disabled = true; });
      if (p.fields) p.fields.forEach(function (f, i) {
        var ok = !gaveUp && gradeField(f, a[i]), hint = el.querySelectorAll('.fhint')[i];
        hint.className = 'fres ' + (ok ? 'ok' : 'no'); hint.textContent = ok ? '✓' : '✗ ' + fmtAns(f);
      });
      var h = '<details class="model" open><summary>Model answer' + (p.fields ? ' & calculation' : '') + '</summary>' + p.model + (p.extra || '') + '</details>';
      if (p.check && !gaveUp) h += '<div class="selfgrade"><b>Mark your written answer:</b> tick only what you really covered' + (p.need ? ' (full marks at ' + p.need + ')' : '') + '<div class="checks">' + p.check.map(function (c, k) { return '<label><input type="checkbox" data-k="' + k + '"> ' + esc(c) + '</label>'; }).join('') + '</div></div>';
      h += '<div class="pscore">Points: <b data-score="' + p.id + '">' + F.num(gaveUp ? 0 : partScore(p, cur.A), 1) + '</b> / ' + p.pts + '</div>';
      el.querySelector('.pres').innerHTML = h;
      el.querySelectorAll('.checks input').forEach(function (cb) {
        cb.onchange = function () { var arr = cur.A.self[p.id] = cur.A.self[p.id] || []; arr[+cb.getAttribute('data-k')] = cb.checked; el.querySelector('[data-score]').textContent = F.num(partScore(p, cur.A), 1); showTotal(); };
      });
    });
    document.getElementById('qbtns').innerHTML = '<button type="button" id="saveNext">Save score &amp; new numbers →</button><a class="btn ghost" href="#home">Save &amp; back to all questions</a>';
    document.getElementById('saveNext').onclick = function () { saveAttempt(); showQ(cur.t.id); };
    view.querySelector('#qbtns a').onclick = function () { saveAttempt(); };
    showTotal();
  }
  function total() { var q = cur.b.q, got = 0; if (!cur.gaveUp) q.parts.forEach(function (p) { got += partScore(p, cur.A); }); return { got: got, pts: qPoints(q) }; }
  function showTotal() {
    var t = total(), pc = t.got / t.pts, hasOpen = cur.b.q.parts.some(function (p) { return p.check; });
    document.getElementById('resBox').innerHTML = '<div class="mnote ' + (pc >= PASS ? 'mastered' : '') + '"><b>Score: ' + F.num(t.got, 1) + ' / ' + t.pts + ' (' + Math.round(pc * 100) + '%)</b>' + (cur.gaveUp ? ' · you looked at the solution, so this counts as 0. Study it, then try new numbers.' : typeof cur.src === 'string' ? ' · original mock numbers are for seeing the real question; only new numbers count toward mastery.' : pc >= PASS ? ' · counts toward mastery (≥ 90%).' : ' · you need ≥ 90% for it to count.') + (hasOpen && !cur.gaveUp ? '<div class="small muted">Tick your written points above first; the score updates.</div>' : '') + '</div>';
  }
  function saveAttempt() {
    if (cur.saved) return; cur.saved = true;
    var t = total();
    (S.att[cur.t.id] = S.att[cur.t.id] || []).push({ t: Date.now(), s: Math.round(t.got / t.pts * 1000) / 1000, src: String(cur.src), sec: Math.round((Date.now() - cur.started) / 1000) });
    save(); refreshMeter();
  }

  /* ---------- router ---------- */
  function route() {
    var hs = location.hash.replace(/^#/, ''), m = /^q=([^&]+)(?:&src=(mock[12]))?/.exec(hs);
    if (cur && cur.checked && !cur.saved) saveAttempt();
    if (m && byId[m[1]]) showQ(m[1], m[2]); else home();
  }
  window.addEventListener('hashchange', route);
  if (window.FSMCards) window.FSMCards.onChange(function () { if (!/^#?q=/.test(location.hash)) home(); });
  window.FSM_MOCK = { TYPES: TYPES, buildQuestion: buildQuestion, findCase: findCase };
  refreshMeter();
  route();
})();
