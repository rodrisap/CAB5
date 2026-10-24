// Every exam-question type builds with mock wording, for many seeds and for the original mocks.
global.window = global; global.document = { getElementById: function () { return { set onclick(v) {}, set innerHTML(v) {}, classList: { toggle: function () {}, remove: function () {} }, style: {} }; }, documentElement: { setAttribute: function () {}, getAttribute: function () { return 'light'; } } };
global.localStorage = { getItem: function () { return null; }, setItem: function () {} };
global.location = { hash: '' }; global.addEventListener = function () {}; global.matchMedia = function () { return { matches: false }; };
['shared/rng.js', 'shared/format.js', 'shared/formula-sheet.js', 'practice/case-data.js', 'practice/case-variants.js', 'practice/mock.js'].forEach(function (f) { require('../' + f); });
var M = window.FSM_MOCK, bad = 0, n = 0;
M.TYPES.forEach(function (t) {
  var srcs = []; for (var s = 1; s <= 60; s++) srcs.push(s * 37);
  t.mocks.forEach(function (m) { srcs.push('mock' + m); });
  srcs.forEach(function (src) {
    n++;
    try {
      var b = M.buildQuestion(t, src), q = b.q;
      if (!q || q.n !== t.slot || !q.parts.length) throw new Error('no question');
      if (typeof src === 'string' && t.v && t.v !== 'templates') { var vv = (b.d.variants['q' + t.slot] || {}).v; if (vv !== t.v) throw new Error('mock variant mismatch ' + vv); }
      q.parts.forEach(function (p) { if (!p.prompt || !p.model) throw new Error('part missing text ' + p.id); (p.fields || []).forEach(function (f) { if (!isFinite(f.ans)) throw new Error('bad answer ' + f.label); }); });
      if (t.explain && !/Explain why/.test(q.parts[0].prompt)) throw new Error('explain part missing');
    } catch (e) { bad++; if (bad < 10) console.log(t.id, src, e.message); }
  });
});
console.log('Exam questions built: ' + n + '   bad: ' + bad);
process.exit(bad ? 1 : 0);
