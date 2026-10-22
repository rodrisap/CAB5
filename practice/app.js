/* FSM Practice — UI, modes, mastery tracking */
(function () {
  var FSM = window.FSM, F = FSM.fmt, esc = F.esc;
  var KEY = 'fsm.practice.v1';
  var DAY = 86400000;

  /* ---------------- storage ---------------- */
  function blank() { return { attempts: {}, mistakes: {}, sr: {}, settings: { examDate: '', examMin: 120, finShare: 0.7 }, last: null }; }
  var S = blank();
  try { var raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* storage blocked */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ---------------- theme ---------------- */
  function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  try { applyTheme(localStorage.getItem('fsm.theme')); } catch (e) {}
  document.getElementById('themeBtn').onclick = function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    applyTheme(next); try { localStorage.setItem('fsm.theme', next); } catch (e) {}
  };

  /* ---------------- formula drawer ---------------- */
  var drawer = document.getElementById('formulaDrawer');
  document.getElementById('formulaBody').innerHTML = FSM.FORMULAS.map(function (g) {
    return '<h3>' + g.group + '</h3>' + g.items.map(function (it) { return '<div class="fl"><b>' + it[0] + '</b><span>' + esc(it[1]) + '</span></div>'; }).join('');
  }).join('');
  function toggleDrawer(open) { drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', open ? 'false' : 'true'); }
  document.getElementById('formulaBtn').onclick = function () { toggleDrawer(!drawer.classList.contains('open')); };
  document.getElementById('formulaClose').onclick = function () { toggleDrawer(false); };

  /* ---------------- mastery ---------------- */
  function attemptsOf(id) { return S.attempts[id] || []; }
  function record(id, a) {
    (S.attempts[id] = S.attempts[id] || []).push(a);
    if (S.attempts[id].length > 60) S.attempts[id] = S.attempts[id].slice(-60);
    if (a.score < 1) S.mistakes[id] = (S.mistakes[id] || 0) + 1;
    else if (S.mistakes[id]) { S.mistakes[id]--; if (!S.mistakes[id]) delete S.mistakes[id]; }
    updateSR(id, a);
    save(); updateBadge();
  }
  function rawMastered(id) {
    var at = attemptsOf(id);
    if (at.length < 4) return false;
    var last = at.slice(-12);
    var avg = last.reduce(function (s, a) { return s + a.score; }, 0) / last.length;
    var fm = {}; at.forEach(function (a) { if (a.score === 1) a.f.forEach(function (f) { fm[f] = 1; }); });
    var skill = FSM.skills[id];
    var needFormats = skill.kind === 'concept' ? 3 : 3;
    var fresh = {}; at.forEach(function (a) { if (a.score === 1 && (skill.kind === 'concept' || a.f.indexOf('num') >= 0)) fresh[a.seed] = 1; });
    var last2 = at.slice(-2).every(function (a) { return a.score === 1 && !a.hint; });
    return avg >= 0.85 && Object.keys(fm).length >= needFormats && Object.keys(fresh).length >= 2 && last2;
  }
  function updateSR(id, a) {
    var sr = S.sr[id];
    var now = Date.now();
    if (!sr) { if (rawMastered(id)) S.sr[id] = { stage: 1, next: now + DAY }; return; }
    if (a.score < 1) { delete S.sr[id]; return; }
    if (sr.next && now >= sr.next && sr.stage < 4) {
      sr.stage++;
      sr.next = sr.stage === 2 ? now + 3 * DAY : sr.stage === 3 ? now + 7 * DAY : null;
    }
  }
  function status(id) {
    var at = attemptsOf(id);
    if (!at.length) return { k: 'new', label: 'New' };
    var sr = S.sr[id];
    if (sr && rawMastered(id)) {
      if (sr.next && Date.now() >= sr.next) return { k: 'due', label: 'Review due' };
      return { k: 'mastered', label: 'Mastered' };
    }
    var last = at.slice(-12);
    var avg = last.reduce(function (s, a) { return s + a.score; }, 0) / last.length;
    if (at.length >= 5 && avg >= 0.7) return { k: 'almost', label: 'Almost' };
    return { k: 'learning', label: 'Learning' };
  }
  function masteryDetail(id) {
    var at = attemptsOf(id), skill = FSM.skills[id];
    var last = at.slice(-12);
    var avg = last.length ? last.reduce(function (s, a) { return s + a.score; }, 0) / last.length : 0;
    var fm = {}; at.forEach(function (a) { if (a.score === 1) a.f.forEach(function (f) { fm[f] = 1; }); });
    return Math.round(avg * 100) + '% of last ' + last.length + ' · ' + Object.keys(fm).length + '/3 formats correct';
  }
  function topicProgress(tid) {
    var sk = FSM.skillsFor(tid);
    var m = sk.filter(function (s) { var k = status(s.id).k; return k === 'mastered'; }).length;
    return { done: m, total: sk.length };
  }
  function updateBadge() {
    var n = Object.keys(S.mistakes).length;
    document.getElementById('mistakeCount').textContent = n ? n : '';
  }

  /* pick the least-practised format for a skill so formats rotate */
  function nextFormat(id, rnd) {
    var fs = FSM.formatsFor(id).filter(function (f, i, a) { return a.indexOf(f) === i; });
    var used = {}; fs.forEach(function (f) { used[f] = 0; });
    attemptsOf(id).slice(-15).forEach(function (a) { a.f.forEach(function (f) { if (used[f] !== undefined) used[f]++; }); });
    var min = Math.min.apply(null, fs.map(function (f) { return used[f]; }));
    var cands = fs.filter(function (f) { return used[f] === min; });
    return cands[Math.floor(rnd * cands.length)];
  }
  function newSeed() { return 1 + Math.floor(Math.random() * 99999); }

  /* ---------------- router ---------------- */
  var view = document.getElementById('view');
  var session = null, exam = null;
  function route() {
    toggleDrawer(false);
    var hsh = location.hash.replace(/^#/, '') || 'home';
    var parts = hsh.split('=');
    var name = parts[0], arg = decodeURIComponent(parts.slice(1).join('='));
    window.scrollTo(0, 0);
    if (name === 'topic') return showTopic(arg);
    if (name === 'learn') return startSession({ mode: 'learn', topic: arg });
    if (name === 'drill') return startSession({ mode: 'drill', skill: arg });
    if (name === 'review') return startReview();
    if (name === 'exam') return showExamStart();
    if (name === 'settings') return showSettings();
    return showHome();
  }
  window.addEventListener('hashchange', route);

  /* ---------------- home ---------------- */
  function showHome() {
    var exd = S.settings.examDate ? new Date(S.settings.examDate + 'T09:00') : null;
    var cd = exd ? Math.ceil((exd - Date.now()) / DAY) : null;
    var due = Object.keys(S.sr).filter(function (id) { return FSM.skills[id] && status(id).k === 'due'; });
    var h = '<div class="hero"><div><h1>Financial &amp; Supply Chain Management</h1><p class="muted">Every question is generated fresh: new numbers, wording, layout and question type. Memorising won\'t work — understanding will.</p></div>' +
      '<div class="countdown">' + (cd !== null ? '<b>' + (cd >= 0 ? cd : 0) + '</b><span class="muted">days to exam</span>' : '<a href="#settings">Set exam date</a>') + '</div></div>';
    if (S.last && FSM.skills[S.last.skill]) h += '<div class="btnrow"><a class="btn" href="#' + (S.last.mode === 'learn' ? 'learn=' + S.last.topic : 'drill=' + S.last.skill) + '">Continue: ' + esc(FSM.skills[S.last.skill].title) + '</a>' + (Object.keys(S.mistakes).length ? '<a class="btn ghost" href="#review">Review ' + Object.keys(S.mistakes).length + ' weak skills</a>' : '') + '</div>';
    if (due.length) h += '<div class="card"><b>Spaced repetition:</b> ' + due.length + ' mastered skill(s) are due for a re-check. <a href="#drill=' + due[0] + '">Start</a></div>';
    ['Finance', 'Supply Chain'].forEach(function (area) {
      h += '<h2 class="section-title">' + area + ' <span class="tag ' + (area === 'Finance' ? 'fin' : 'scm') + '">' + (area === 'Finance' ? '70% of exam' : '30% of exam') + '</span></h2><div class="grid">';
      FSM.topics.filter(function (t) { return t.area === area; }).forEach(function (t) {
        var p = topicProgress(t.id);
        h += '<a class="card topic-card" href="#topic=' + t.id + '"><span class="tag ' + (area === 'Finance' ? 'fin' : 'scm') + '">' + (t.week ? 'Week ' + t.week : t.label || '') + '</span>' +
          '<h3>' + esc(t.title) + '</h3><div class="small muted">' + esc(t.read || '') + '</div>' +
          '<div class="bar"><i style="width:' + (p.total ? Math.round(100 * p.done / p.total) : 0) + '%"></i></div><div class="small muted">' + p.done + ' / ' + p.total + ' skills mastered</div></a>';
      });
      h += '</div>';
    });
    h += '<div class="card"><h3>Exam simulation</h3><p class="muted">Timed, mixed paper (70% finance / 30% SCM), formula sheet available, no feedback until you submit.</p><a class="btn" href="#exam">Start an exam</a></div>';
    view.innerHTML = h;
  }

  /* ---------------- topic ---------------- */
  function showTopic(tid) {
    var t = FSM.topics.filter(function (x) { return x.id === tid; })[0];
    if (!t) return showHome();
    var sk = FSM.skillsFor(tid);
    var h = '<p class="small"><a href="#home">← All topics</a></p><h1>' + esc(t.title) + '</h1><p class="muted">' + esc(t.read || '') + '</p>' +
      '<div class="btnrow"><a class="btn" href="#learn=' + tid + '">Learn this topic (mixed)</a><a class="btn ghost" href="../guide/index.html#' + (t.guide || tid) + '">Read the notes</a></div><div class="card">';
    sk.forEach(function (s) {
      var st = status(s.id);
      h += '<div class="skill-row"><div><b>' + esc(s.title) + '</b><div class="small muted">' + (attemptsOf(s.id).length ? masteryDetail(s.id) : (s.kind === 'concept' ? 'Concept questions' : 'Calculation')) + '</div></div>' +
        '<div style="display:flex;gap:8px;align-items:center"><span class="status ' + st.k + '">' + st.label + '</span><a class="btn ghost" href="#drill=' + s.id + '">Drill</a></div></div>';
    });
    h += '</div><p class="small muted">Mastered = ≥85% over your last 12 tries, correct in at least 3 different question formats, fresh numbers, and your last 2 answers right without hints. Mastered skills come back after 1, 3 and 7 days.</p>';
    view.innerHTML = h;
  }

  /* ---------------- practice session ---------------- */
  function startSession(o) {
    session = { mode: o.mode, topic: o.topic, skill: o.skill, count: 0, correct: 0, queue: o.queue || null };
    if (o.mode === 'drill' && !FSM.skills[o.skill]) return showHome();
    if (o.mode === 'learn' && !FSM.skillsFor(o.topic).length) return showHome();
    nextQuestion();
  }
  function pickSkill() {
    if (session.mode === 'drill') return session.skill;
    if (session.mode === 'review') {
      var ids = Object.keys(S.mistakes).filter(function (id) { return FSM.skills[id]; });
      if (!ids.length) return null;
      return ids[Math.floor(Math.random() * ids.length)];
    }
    // learn: weight by weakness
    var sk = FSM.skillsFor(session.topic);
    var w = sk.map(function (s) { var k = status(s.id).k; return k === 'mastered' ? 1 : k === 'almost' ? 2 : 4; });
    var tot = w.reduce(function (a, b) { return a + b; }, 0), x = Math.random() * tot;
    for (var i = 0; i < sk.length; i++) { x -= w[i]; if (x <= 0) return sk[i].id; }
    return sk[0].id;
  }
  function nextQuestion(seed, skillId) {
    var id = skillId || pickSkill();
    if (!id) { view.innerHTML = '<div class="card empty"><h2>No mistakes to review 🎉</h2><p>Wrong answers land here and come back as new variants.</p><a class="btn" href="#home">Home</a></div>'; return; }
    var lastF = (attemptsOf(id).slice(-1)[0] || {}).f || [];
    var fmt = nextFormat(id, Math.random());
    if (session.mode === 'review' && lastF.indexOf(fmt) >= 0) fmt = nextFormat(id, 0.99);
    var sd = seed || newSeed();
    var q = FSM.make(id, sd, { format: seed ? undefined : fmt });
    session.q = q; session.hinted = false; session.checked = false;
    S.last = { mode: session.mode === 'learn' ? 'learn' : 'drill', topic: q.topic, skill: id }; save();
    renderQuestion(q, { practice: true });
  }

  function partLetter(i, n) { return n > 1 ? String.fromCharCode(97 + i) + ')' : ''; }

  function renderPartInput(p, i, q, opts) {
    var name = 'p' + i, h = '';
    var prompt = p.prompt ? esc(p.prompt) : '';
    switch (p.format) {
      case 'num':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div>' +
          '<div class="numrow"><input type="text" inputmode="decimal" autocomplete="off" id="' + name + '" aria-label="answer"><span class="unit">' + esc(p.hintText) + '</span></div>';
        break;
      case 'mcq':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div><div class="opts">' +
          p.options.map(function (o, k) { return '<label class="opt"><input type="radio" name="' + name + '" value="' + k + '"><span>' + esc(F.fmt(o.v, p.unit, { cur: q.ctx.cur, dp: p.dp })) + '</span></label>'; }).join('') + '</div>';
        break;
      case 'tf':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div>' +
          '<p>A classmate says the answer is <b>' + esc(F.fmt(p.tfValue, p.unit, { cur: q.ctx.cur, dp: p.dp })) + '</b>. Is that correct?</p><div class="opts">' +
          '<label class="opt"><input type="radio" name="' + name + '" value="true"><span>Correct</span></label><label class="opt"><input type="radio" name="' + name + '" value="false"><span>Not correct</span></label></div>';
        break;
      case 'error':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div><p>Here is a worked solution. <b>One step contains an error.</b> Which step?</p><div class="opts">' +
          p.errorRendered.map(function (s, k) { return s.has ? '<label class="opt"><input type="radio" name="' + name + '" value="' + k + '"><span>' + s.html + '</span></label>' : '<div class="opt" style="cursor:default">' + s.html + '</div>'; }).join('') + '</div>';
        break;
      case 'order':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + (prompt ? prompt + ' — ' : '') + 'put the solution steps in the right order (tap them in sequence).</div>' +
          '<div class="order-cols"><div><div class="small muted">Steps</div><div class="order-pool" id="' + name + '-pool">' +
          p.orderShuffled.map(function (o) { return '<button type="button" class="order-item" data-i="' + o.i + '">' + esc(o.t) + '</button>'; }).join('') +
          '</div></div><div><div class="small muted">Your order <button type="button" class="ghost icon" id="' + name + '-reset">Reset</button></div><ol class="order-picked" id="' + name + '-picked"></ol></div></div>';
        break;
      case 'choice':
        h += (prompt ? '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div>' : '') + '<div class="opts">' +
          p.choiceOrder.map(function (c) { return '<label class="opt"><input type="radio" name="' + name + '" value="' + c.i + '"><span>' + esc(c.t) + '</span></label>'; }).join('') + '</div>';
        break;
      case 'match':
        var letters = 'ABCD';
        h += '<ul class="defs-list">' + p.defOrder.map(function (pi, k) { return '<li><b>' + letters[k] + '</b>' + esc(p.pairs[pi].def) + '</li>'; }).join('') + '</ul>' +
          p.pairs.map(function (pr, k) { return '<div class="match-row"><b>' + esc(pr.term) + '</b><select id="' + name + '-' + k + '"><option value="">— choose —</option>' + p.defOrder.map(function (pi, j) { return '<option value="' + pi + '">' + letters[j] + '</option>'; }).join('') + '</select></div>'; }).join('');
        break;
      case 'open':
        h += '<div class="label"><span class="letter">' + partLetter(i, q.parts.length) + '</span> ' + prompt + '</div><textarea id="' + name + '" placeholder="Write your answer, then check it against the model answer."></textarea>';
        break;
    }
    return '<div class="part" id="part-' + i + '">' + h + '<div class="fb" id="' + name + '-fb"></div></div>';
  }

  function wireOrder(p, i) {
    var pool = document.getElementById('p' + i + '-pool'), picked = document.getElementById('p' + i + '-picked');
    p._seq = [];
    pool.onclick = function (e) {
      var b = e.target.closest('.order-item'); if (!b) return;
      p._seq.push(Number(b.getAttribute('data-i')));
      var li = document.createElement('li'); li.appendChild(b); picked.appendChild(li);
    };
    document.getElementById('p' + i + '-reset').onclick = function () {
      p._seq = [];
      Array.prototype.slice.call(picked.querySelectorAll('.order-item')).forEach(function (b) { pool.appendChild(b); });
      picked.innerHTML = '';
    };
  }

  function readResponse(p, i) {
    var name = 'p' + i;
    switch (p.format) {
      case 'num': case 'open': var el = document.getElementById(name); return el ? el.value : '';
      case 'mcq': case 'tf': case 'error': case 'choice':
        var r = document.querySelector('input[name="' + name + '"]:checked'); return r ? (p.format === 'tf' ? r.value : Number(r.value)) : null;
      case 'order': return p._seq || [];
      case 'match': var m = {}; p.pairs.forEach(function (_, k) { var s = document.getElementById(name + '-' + k); m[k] = s && s.value !== '' ? Number(s.value) : null; }); return m;
    }
  }

  function solutionHTML(p, q) {
    var h = '';
    if (p.answer !== undefined && p.format !== 'choice') h += '<div><b>Answer:</b> ' + esc(F.fmt(p.answer, p.unit, { cur: q.ctx.cur, dp: p.dp })) + '</div>';
    if (p.format === 'error') h += '<div>The wrong step was step ' + (p.errorIdx + 1) + ': it showed ' + esc(F.fmt(p.errorVal, p.steps[p.errorIdx].unit, { cur: q.ctx.cur, dp: p.steps[p.errorIdx].dp })) + '.</div>';
    if (p.format === 'order' && p.method) h += '<div><b>Correct order:</b><ol>' + p.method.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol></div>';
    if (p.steps && p.steps.length) {
      var rs = FSM.renderSteps(p.steps, q.ctx);
      h += '<div class="solution"><b>Step by step</b><ol>' + rs.map(function (s) { return '<li>' + s.html + '</li>'; }).join('') + '</ol></div>';
    }
    if (p.why) h += '<div class="solution">' + p.why + '</div>';
    if (p.format === 'match') h += '<div class="solution">' + p.pairs.map(function (pr) { return '<b>' + esc(pr.term) + '</b> — ' + esc(pr.def); }).join('<br>') + '</div>';
    return h;
  }

  function renderQuestion(q, opts) {
    var t = FSM.topics.filter(function (x) { return x.id === q.topic; })[0] || {};
    var h = '';
    if (opts.practice) {
      h += '<div class="qhead"><div><a class="small" href="#topic=' + q.topic + '">← ' + esc(t.title || '') + '</a><div class="qmeta">' + esc(q.title) + ' · ' + session.count + ' answered · ' + session.correct + ' correct</div></div>' +
        '<div class="versionbox"><span class="small muted">Version #</span><input type="number" id="ver" value="' + q.seed + '" min="1"><button class="ghost" id="verGo" type="button">Load</button></div></div>';
    }
    h += '<div class="card"><div class="stem">' + q.stem + '</div>';
    q.parts.forEach(function (p, i) { h += renderPartInput(p, i, q, opts); });
    if (opts.practice) {
      h += '<div class="btnrow"><button id="checkBtn" type="button">Check</button><button class="ghost" id="hintBtn" type="button">Hint</button><button class="ghost" id="skipBtn" type="button">Show solution</button><button class="ghost" id="nextBtn" type="button" style="display:none">Next question →</button></div><div id="hintBox"></div>';
    }
    h += '</div>';
    if (opts.practice) {
      view.innerHTML = h;
      wireCommon(q);
      document.getElementById('checkBtn').onclick = function () { checkPractice(q, false); };
      document.getElementById('skipBtn').onclick = function () { checkPractice(q, true); };
      document.getElementById('nextBtn').onclick = function () { nextQuestion(); window.scrollTo(0, 0); };
      document.getElementById('hintBtn').onclick = function () {
        session.hinted = true;
        var hs = (q.formula ? '<div class="formula-line">' + esc(q.formula) + '</div>' : '') + q.parts.map(function (p) { return p.hint ? '<div class="formula-line">' + esc(p.hint) + '</div>' : ''; }).join('');
        document.getElementById('hintBox').innerHTML = '<div class="feedback" style="background:var(--warn-soft)">' + (hs || 'Think about which definition fits best — check the formula sheet.') + '<div class="small muted">Using a hint means this attempt won\'t count towards mastery streaks.</div></div>';
      };
      document.getElementById('verGo').onclick = function () {
        var v = parseInt(document.getElementById('ver').value, 10); if (v > 0) nextQuestion(v, q.skill);
      };
      var first = view.querySelector('input[type=text]'); if (first && window.innerWidth > 700) first.focus();
    }
    return h;
  }

  function wireCommon(q, root) {
    q.parts.forEach(function (p, i) { if (p.format === 'order') wireOrder(p, i); });
    (root || view).querySelectorAll('.opt input[type=radio]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var group = (root || view).querySelectorAll('input[name="' + inp.name + '"]');
        group.forEach(function (g) { g.closest('.opt').classList.toggle('sel', g.checked); });
      });
    });
  }

  function gradeAll(q) {
    return q.parts.map(function (p, i) {
      if (p.format === 'open') return null; // self graded later
      var resp = readResponse(p, i);
      return { resp: resp, g: FSM.gradePart(p, resp) };
    });
  }

  function checkPractice(q, giveUp) {
    if (session.checked) return;
    var res = gradeAll(q);
    var hasOpen = q.parts.some(function (p) { return p.format === 'open'; });
    session.checked = true;
    var total = 0, got = 0;
    q.parts.forEach(function (p, i) {
      var fb = document.getElementById('p' + i + '-fb');
      if (p.format === 'open') { renderOpenFeedback(p, i, q, fb, giveUp); return; }
      var r = res[i], okk = !giveUp && r.g.ok;
      total++; if (okk) got++;
      markOptions(p, i, r);
      var msg = '<div class="feedback ' + (okk ? 'ok' : 'no') + '"><div class="verdict">' + (okk ? (r.g.exact === false ? '✓ Correct (within rounding)' : '✓ Correct') : (giveUp ? 'Solution' : (r.g.unreadable ? '✗ Couldn\'t read your answer' : '✗ Not correct'))) + '</div>';
      if (!okk && r.g.trap && r.g.trap.why) msg += '<div><b>Likely mistake:</b> ' + esc(r.g.trap.why) + '</div>';
      msg += solutionHTML(p, q) + '</div>';
      fb.innerHTML = msg;
    });
    var score = total ? got / total : 1;
    session.count++; if (score === 1) session.correct++;
    if (!hasOpen) record(q.skill, { t: Date.now(), score: giveUp ? 0 : score, f: q.formats, seed: q.seed, hint: session.hinted || giveUp });
    else session.pending = { q: q, got: got, total: total, giveUp: giveUp };
    document.getElementById('checkBtn').style.display = 'none';
    document.getElementById('skipBtn').style.display = 'none';
    document.getElementById('hintBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = '';
  }

  function markOptions(p, i, r) {
    if (['mcq', 'choice', 'tf', 'error'].indexOf(p.format) < 0) return;
    document.querySelectorAll('input[name="p' + i + '"]').forEach(function (inp) {
      var lab = inp.closest('.opt'); var v = inp.value; var right = false;
      if (p.format === 'mcq') right = p.options[Number(v)].correct;
      if (p.format === 'choice') right = Number(v) === p.correctChoice;
      if (p.format === 'tf') right = (v === 'true') === p.tfTrue;
      if (p.format === 'error') right = Number(v) === p.errorIdx;
      if (right) lab.classList.add('right'); else if (inp.checked) lab.classList.add('wrong');
      inp.disabled = true;
    });
  }

  function renderOpenFeedback(p, i, q, fb, giveUp) {
    fb.innerHTML = '<div class="feedback" style="background:var(--surface-2)"><b>Model answer</b><p>' + esc(p.model || '') + '</p><b>Tick the points your answer covers:</b><div class="checklist">' +
      (p.points || []).map(function (pt, k) { return '<label><input type="checkbox" id="p' + i + '-pt' + k + '"> ' + esc(pt) + '</label>'; }).join('') +
      '</div><button type="button" class="ghost" id="p' + i + '-self">Save self-grade</button></div>';
    document.getElementById('p' + i + '-self').onclick = function () {
      var n = (p.points || []).length, c = 0;
      for (var k = 0; k < n; k++) if (document.getElementById('p' + i + '-pt' + k).checked) c++;
      var selfScore = n ? c / n : 0;
      var pend = session.pending;
      if (pend) {
        var tot = pend.total + 0.5, got = pend.got + 0.5 * selfScore;
        record(q.skill, { t: Date.now(), score: pend.giveUp ? 0 : Math.round(got / tot * 100) / 100, f: q.formats, seed: q.seed, hint: session.hinted || pend.giveUp });
        session.pending = null;
      }
      this.disabled = true; this.textContent = 'Saved (' + c + '/' + n + ')';
    };
  }

  /* ---------------- mistake review ---------------- */
  function startReview() {
    session = { mode: 'review', count: 0, correct: 0 };
    nextQuestion();
  }

  /* ---------------- exam ---------------- */
  function showExamStart() {
    view.innerHTML = '<h1>Exam simulation</h1><div class="card"><p>A mixed paper: about 70% finance and 30% supply chain (by points). Mostly multi-part calculation cases plus concept questions. You can open the formula sheet any time. You get <b>no feedback until you submit</b>.</p>' +
      '<div class="btnrow"><label>Duration (minutes) <input type="number" id="exMin" value="' + (S.settings.examMin || 120) + '" min="10" max="240" style="width:100px"></label></div>' +
      '<div class="btnrow"><button id="exGo" type="button">Start exam</button><a class="btn ghost" href="#home">Cancel</a></div></div>';
    document.getElementById('exGo').onclick = function () {
      var m = parseInt(document.getElementById('exMin').value, 10) || 120;
      S.settings.examMin = m; save(); startExam(m);
    };
  }
  function startExam(minutes) {
    var nQ = Math.max(6, Math.round(minutes / 6));
    var fin = [], scm = [];
    Object.keys(FSM.skills).forEach(function (id) {
      var s = FSM.skills[id], t = FSM.topics.filter(function (x) { return x.id === s.topic; })[0];
      (t && t.area === 'Finance' ? fin : scm).push(id);
    });
    var finCalc = fin.filter(function (id) { return FSM.skills[id].kind !== 'concept'; });
    var finCon = fin.filter(function (id) { return FSM.skills[id].kind === 'concept'; });
    var nFin = Math.round(nQ * 0.7), nScm = nQ - nFin;
    function sample(arr, n) { var a = arr.slice(), o = []; while (o.length < n && a.length) o.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); while (o.length < n && arr.length) o.push(arr[Math.floor(Math.random() * arr.length)]); return o; }
    var picks = sample(finCalc, Math.round(nFin * 0.75)).concat(sample(finCon, nFin - Math.round(nFin * 0.75))).concat(sample(scm, nScm));
    var qs = picks.map(function (id) { return FSM.make(id, newSeed(), FSM.skills[id].kind === 'concept' ? {} : { format: Math.random() < 0.75 ? 'num' : undefined }); });
    // sort finance first like a real paper, then SCM
    exam = { qs: qs, cur: 0, answers: qs.map(function () { return {}; }), end: Date.now() + minutes * 60000, minutes: minutes, start: Date.now(), times: qs.map(function () { return 0; }), shownAt: Date.now() };
    renderExamQ();
    tick();
  }
  function tick() {
    if (!exam || exam.done) return;
    var el = document.getElementById('exTimer');
    var left = exam.end - Date.now();
    if (left <= 0) { submitExam(); return; }
    if (el) {
      var m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
      el.textContent = m + ':' + (s < 10 ? '0' : '') + s; el.classList.toggle('low', left < 5 * 60000);
    }
    setTimeout(tick, 1000);
  }
  function saveExamAnswers() {
    var q = exam.qs[exam.cur], a = exam.answers[exam.cur];
    q.parts.forEach(function (p, i) { a[i] = readResponse(p, i); });
    exam.times[exam.cur] += Date.now() - exam.shownAt;
  }
  function restoreExamAnswers() {
    var q = exam.qs[exam.cur], a = exam.answers[exam.cur];
    q.parts.forEach(function (p, i) {
      var v = a[i]; if (v === undefined || v === null) return;
      if (p.format === 'num' || p.format === 'open') document.getElementById('p' + i).value = v;
      else if (p.format === 'match') Object.keys(v).forEach(function (k) { if (v[k] !== null) document.getElementById('p' + i + '-' + k).value = v[k]; });
      else if (p.format === 'order') { var pool = document.getElementById('p' + i + '-pool'); v.forEach(function (ix) { var b = pool.querySelector('[data-i="' + ix + '"]'); if (b) b.click(); }); }
      else { var inp = document.querySelector('input[name="p' + i + '"][value="' + v + '"]'); if (inp) { inp.checked = true; inp.closest('.opt').classList.add('sel'); } }
    });
  }
  function answered(k) { var a = exam.answers[k]; return Object.keys(a).some(function (i) { var v = a[i]; return v !== null && v !== '' && v !== undefined && !(Array.isArray(v) && !v.length); }); }
  function renderExamQ() {
    var q = exam.qs[exam.cur];
    var t = FSM.topics.filter(function (x) { return x.id === q.topic; })[0] || {};
    var nav = exam.qs.map(function (_, k) { return '<button type="button" data-k="' + k + '" class="' + (answered(k) ? 'answered ' : '') + (k === exam.cur ? 'cur' : '') + '">' + (k + 1) + '</button>'; }).join('');
    var h = '<div class="qhead"><h2>Question ' + (exam.cur + 1) + ' of ' + exam.qs.length + ' <span class="tag ' + (t.area === 'Finance' ? 'fin' : 'scm') + '">' + esc(t.area || '') + '</span></h2><span class="timer" id="exTimer"></span></div><div class="qnav" id="qnav">' + nav + '</div>';
    h += '<div class="card"><div class="stem">' + q.stem + '</div>' + q.parts.map(function (p, i) { return renderPartInput(p, i, q, {}); }).join('') + '</div>';
    h += '<div class="btnrow"><button class="ghost" id="exPrev" type="button"' + (exam.cur ? '' : ' disabled') + '>← Previous</button><button class="ghost" id="exNext" type="button"' + (exam.cur < exam.qs.length - 1 ? '' : ' disabled') + '>Next →</button><button id="exSubmit" type="button">Submit exam</button></div>';
    view.innerHTML = h;
    wireCommon(q);
    restoreExamAnswers();
    exam.shownAt = Date.now();
    function go(k) { saveExamAnswers(); exam.cur = k; renderExamQ(); window.scrollTo(0, 0); }
    document.getElementById('exPrev').onclick = function () { go(exam.cur - 1); };
    document.getElementById('exNext').onclick = function () { go(exam.cur + 1); };
    document.getElementById('qnav').onclick = function (e) { var b = e.target.closest('button'); if (b) go(Number(b.getAttribute('data-k'))); };
    document.getElementById('exSubmit').onclick = function () {
      var missing = exam.qs.filter(function (_, k) { return k !== exam.cur && !answered(k); }).length;
      if (confirm('Submit the exam?' + (missing ? ' ' + missing + ' question(s) look unanswered.' : ''))) { saveExamAnswers(); submitExam(); }
    };
    var el = document.getElementById('exTimer'); if (el) { var left = exam.end - Date.now(); el.textContent = Math.floor(left / 60000) + ':' + ('0' + Math.floor(left % 60000 / 1000)).slice(-2); }
  }
  function submitExam() {
    if (!exam || exam.done) return;
    exam.done = true;
    var byTopic = {}, traps = [], tot = 0, got = 0;
    var detail = exam.qs.map(function (q, k) {
      var a = exam.answers[k], qtot = 0, qgot = 0;
      var parts = q.parts.map(function (p, i) {
        if (p.format === 'open') return { p: p, open: true, resp: a[i] };
        var g = FSM.gradePart(p, a[i]);
        qtot++; if (g.ok) qgot++;
        if (!g.ok && g.trap && g.trap.why) traps.push(g.trap.why);
        return { p: p, g: g, resp: a[i] };
      });
      tot += qtot; got += qgot;
      var t = byTopic[q.topic] = byTopic[q.topic] || { tot: 0, got: 0 };
      t.tot += qtot; t.got += qgot;
      record(q.skill, { t: Date.now(), score: qtot ? qgot / qtot : 1, f: q.formats, seed: q.seed, hint: false });
      return { q: q, parts: parts, score: qtot ? qgot / qtot : 1 };
    });
    var pct = tot ? got / tot : 0;
    var grade = Math.max(1, Math.min(10, 1 + 9 * pct));
    var h = '<h1>Exam result</h1><div class="card"><div class="score-big">' + Math.round(pct * 100) + '%</div><div class="muted">' + got + ' / ' + tot + ' parts correct · indicative grade ' + grade.toFixed(1) + ' (linear, not the official norm)</div></div>';
    h += '<div class="card"><h3>By topic</h3><div class="kv">' + Object.keys(byTopic).map(function (tid) {
      var t = FSM.topics.filter(function (x) { return x.id === tid; })[0] || { title: tid }, b = byTopic[tid];
      return '<span>' + esc(t.title) + '</span><b>' + b.got + '/' + b.tot + '</b>';
    }).join('') + '</div></div>';
    if (traps.length) {
      var cnt = {}; traps.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
      h += '<div class="card"><h3>Traps you fell into</h3><ul>' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (x) { return '<li>' + esc(x) + (cnt[x] > 1 ? ' <b>×' + cnt[x] + '</b>' : '') + '</li>'; }).join('') + '</ul></div>';
    }
    var weak = Object.keys(byTopic).filter(function (tid) { return byTopic[tid].got / byTopic[tid].tot < 0.7; });
    if (weak.length) h += '<div class="card"><h3>Study next</h3><ul>' + weak.map(function (tid) { var t = FSM.topics.filter(function (x) { return x.id === tid; })[0] || {}; return '<li>' + esc(t.title || tid) + ' — <a href="../guide/index.html#' + (t.guide || tid) + '">notes</a> · <a href="#learn=' + tid + '">practice</a></li>'; }).join('') + '</ul></div>';
    h += '<h2>Review every question</h2>';
    detail.forEach(function (d, k) {
      h += '<div class="card"><div class="qmeta">Question ' + (k + 1) + ' · ' + esc(d.q.title) + ' · ' + Math.round(d.score * 100) + '% · ' + Math.round(exam.times[k] / 1000 / 60 * 10) / 10 + ' min</div><div class="stem">' + d.q.stem + '</div>';
      d.parts.forEach(function (x, i) {
        var p = x.p;
        h += '<div class="part"><div class="label">' + partLetter(i, d.parts.length) + ' ' + esc(p.prompt || '') + '</div>';
        if (x.open) h += '<div class="feedback" style="background:var(--surface-2)"><b>Your answer:</b> ' + esc(x.resp || '—') + '<br><b>Model answer:</b> ' + esc(p.model || '') + '</div>';
        else h += '<div class="feedback ' + (x.g.ok ? 'ok' : 'no') + '"><div class="verdict">' + (x.g.ok ? '✓ Correct' : '✗ Not correct') + '</div>' + (!x.g.ok && x.g.trap && x.g.trap.why ? '<div><b>Likely mistake:</b> ' + esc(x.g.trap.why) + '</div>' : '') + solutionHTML(p, d.q) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    });
    h += '<div class="btnrow"><a class="btn" href="#home">Home</a><a class="btn ghost" href="#review">Review mistakes</a></div>';
    view.innerHTML = h;
    window.scrollTo(0, 0);
  }

  /* ---------------- settings ---------------- */
  function showSettings() {
    view.innerHTML = '<h1>Settings</h1><div class="card"><label>Exam date <input type="date" id="stDate" value="' + esc(S.settings.examDate || '') + '"></label>' +
      '<div class="btnrow"><button id="stSave" type="button">Save</button></div></div>' +
      '<div class="card"><h3>Move progress between devices</h3><p class="muted">Progress is stored in this browser only. Export it here and import on your phone/laptop.</p>' +
      '<div class="btnrow"><button class="ghost" id="stExport" type="button">Export progress</button><label class="btn ghost">Import progress<input type="file" id="stImport" accept="application/json" hidden></label></div></div>' +
      '<div class="card"><h3>Reset</h3><button class="ghost" id="stReset" type="button" style="color:var(--bad);border-color:var(--bad)">Reset all progress</button></div>';
    document.getElementById('stSave').onclick = function () { S.settings.examDate = document.getElementById('stDate').value; save(); location.hash = '#home'; };
    document.getElementById('stExport').onclick = function () {
      var blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fsm-progress.json'; document.body.appendChild(a); a.click(); a.remove();
    };
    document.getElementById('stImport').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { try { S = Object.assign(blank(), JSON.parse(rd.result)); save(); alert('Progress imported.'); location.hash = '#home'; } catch (err) { alert('That file could not be read.'); } };
      rd.readAsText(f);
    };
    document.getElementById('stReset').onclick = function () { if (confirm('Delete all your progress? This cannot be undone.')) { S = blank(); save(); updateBadge(); location.hash = '#home'; } };
  }

  /* used by the automated rendering checks */
  window.__fsmShow = function (id, seed, fmt) {
    session = { mode: 'drill', skill: id, count: 0, correct: 0 };
    var q = FSM.make(id, seed, { format: fmt });
    session.q = q; session.checked = false; session.hinted = false;
    renderQuestion(q, { practice: true });
  };

  updateBadge();
  route();
})();
