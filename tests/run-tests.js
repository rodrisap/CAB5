/* Run: node tests/run-tests.js
   Loads the practice files into a sandbox, fuzzes every skill and checks known answers. */
var fs = require('fs'), path = require('path'), vm = require('vm');
var ROOT = path.join(__dirname, '..');
var sandbox = { console: console, Math: Math };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
function load(f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }); }

var html = fs.readFileSync(path.join(ROOT, 'practice/skills.html'), 'utf8');
var scripts = [];
html.replace(/<script src="([^"]+)"/g, function (_, s) { scripts.push(path.normalize(path.join('practice', s.split('?')[0]))); });
scripts.filter(function (s) { return !/app\.js$/.test(s); }).forEach(function (f) {
  if (fs.existsSync(path.join(ROOT, f))) load(f); else console.log('  (missing, skipped: ' + f + ')');
});
load('tests/known.js');
var FSM = sandbox.FSM;

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= Math.max(Math.abs(b) * (tol || 0.001), 1e-9), msg + ' — got ' + a + ', expected ' + b); }

/* 1. fuzz every skill */
var skillIds = Object.keys(FSM.skills);
skillIds.forEach(function (id) {
  var stems = {}, formats = {};
  for (var seed = 1; seed <= 200; seed++) {
    var q;
    try { q = FSM.make(id, seed); } catch (e) { ok(false, id + ' seed ' + seed + ' threw: ' + e.message); continue; }
    stems[q.stem.replace(/[\d.,€$£−-]+/g, '#').slice(0, 120)] = 1;
    q.formats.forEach(function (f) { formats[f] = 1; });
    ok(/\S/.test(q.stem), id + ' empty stem');
    ok(!/NaN|Infinity|undefined/.test(q.stem), id + ' seed ' + seed + ' stem contains NaN/undefined');
    q.parts.forEach(function (p, i) {
      if (p.answer !== undefined) ok(isFinite(p.answer), id + ' seed ' + seed + ' part ' + i + ' answer not finite');
      if (p.format === 'mcq') {
        var c = p.options.filter(function (o) { return o.correct; }).length;
        ok(c === 1, id + ' seed ' + seed + ' mcq correct count ' + c);
        ok(p.options.length >= 3, id + ' seed ' + seed + ' mcq only ' + p.options.length + ' options');
      }
      if (p.format === 'choice') {
        ok(p.choices && p.choices.length >= 2, id + ' choice options');
        var uniq = {}; p.choices.forEach(function (c) { uniq[c] = 1; });
        ok(Object.keys(uniq).length === p.choices.length, id + ' seed ' + seed + ' duplicate choices: ' + p.choices.join(' | '));
      }
      if (p.format === 'num' || p.format === 'mcq' || p.format === 'tf' || p.format === 'error') ok(p.steps && p.steps.length > 0, id + ' seed ' + seed + ' no solution steps');
      if (p.steps) p.steps.forEach(function (s) { if (typeof s === 'object') ok(s.v === undefined || isFinite(s.v), id + ' seed ' + seed + ' step value not finite: ' + s.t); });
      if (p.format === 'match') ok(p.pairs.length === 4, id + ' match pairs');
    });
    var again = FSM.make(id, seed);
    ok(again.stem === q.stem, id + ' seed ' + seed + ' not reproducible');
  }
  var s = FSM.skills[id];
  var minStems = s.kind === 'concept' ? 4 : 4;
  ok(Object.keys(stems).length >= minStems, id + ' only ' + Object.keys(stems).length + ' distinct stems');
  ok(Object.keys(formats).length >= 3, id + ' only formats: ' + Object.keys(formats).join(','));
});

/* 2. known answers (instructor examples) */
var K = FSM.known || {};
Object.keys(K).forEach(function (name) {
  try { K[name](near, ok); } catch (e) { ok(false, 'known ' + name + ' threw ' + e.message); }
});

/* 3. answer parser */
var G = FSM.fmt.grade;
ok(G('6.38%', 0.0638, 'pct').ok, 'parse 6.38%');
ok(G('6.38', 0.0638, 'pct').ok, 'parse 6.38 as pct');
ok(G('0.0638', 0.0638, 'pct').ok, 'parse 0.0638 as pct');
ok(G('1,234,567', 1234567, 'cur').ok, 'parse 1,234,567');
ok(G('1.234.567', 1234567, 'cur').ok, 'parse 1.234.567');
ok(G('€4.97m', 4970000, 'cur').ok, 'parse €4.97m');
ok(G('(500)', -500, 'cur').ok, 'parse (500)');
ok(G('-1680', -1680, 'cur').ok, 'parse -1680');
ok(G('59,7', 59.7, 'days', { dp: 1 }).ok, 'parse 59,7');
ok(!G('70', 59.7, 'days', { dp: 1 }).ok, 'reject wrong');

console.log('\nSkills: ' + skillIds.length + '   Checks passed: ' + pass + '   Failed: ' + fail);
if (fail) { console.log('\nFAILURES (first 40):'); fails.slice(0, 40).forEach(function (f) { console.log(' ✗ ' + f); }); process.exit(1); }
console.log('ALL PASS');
