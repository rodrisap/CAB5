/* FSM Practice — question engine.
   Skills are registered by generator files. The engine turns a skill + seed into a
   fully rendered question, applying the variation layer (layout, format, wording, order). */
(function (root) {
  var FSM = root.FSM = root.FSM || {};
  var RNG = FSM.RNG, F = FSM.fmt;

  FSM.topics = FSM.topics || [];
  FSM.skills = FSM.skills || {};

  FSM.addTopic = function (t) { FSM.topics.push(t); };

  /* ---------- context pools ---------- */
  var COMPANIES = [
    ['Brightwell Appliances', 'kitchen appliances'], ['Nordvik Outdoor', 'outdoor gear'],
    ['Harbor Lane Foods', 'specialty foods'], ['Kestrel Robotics', 'industrial robots'],
    ['Lumen Print Co.', 'printing services'], ['Veltro Bikes', 'e-bikes'],
    ['Oakridge Furniture', 'handmade furniture'], ['Solenne Cosmetics', 'skincare'],
    ['Tidewater Logistics', 'freight services'], ['Crescent Pharma', 'generic medicines'],
    ['Polaris Textiles', 'technical fabrics'], ['Mosaic Toys', 'educational toys'],
    ['Granite Peak Tools', 'power tools'], ['Aurora Solar', 'solar panels'],
    ['Bluefin Seafood', 'seafood wholesale'], ['Copperleaf Coffee', 'coffee roasting'],
    ['Delta Fresh Farms', 'agricultural produce'], ['Elmstone Builders', 'construction materials'],
    ['Fjordline Shipping', 'short-sea shipping'], ['Greenmile Packaging', 'packaging'],
    ['Halcyon Software', 'security software'], ['Ironbridge Steel', 'steel products'],
    ['Juniper Health', 'medical devices'], ['Kingsway Pubs', 'restaurants'],
    ['Larkspur Fashion', 'apparel'], ['Meridian Electronics', 'consumer electronics'],
    ['Northgate Paper', 'paper products'], ['Orchid Interiors', 'home decor'],
    ['Pinewood Audio', 'headphones'], ['Quarry Hill Stone', 'natural stone'],
    ['Riverbend Brewing', 'craft beer'], ['Saltmarsh Chemicals', 'industrial chemicals']
  ];
  FSM.COMPANIES = COMPANIES;

  function makeCtx(r) {
    var c = r.pick(COMPANIES);
    var curRoll = r.uniform();
    var cur = curRoll < 0.7 ? 'EUR' : (curRoll < 0.87 ? 'USD' : 'GBP');
    var ctx;
    ctx = {
      r: r, company: c[0], industry: c[1], cur: cur, sym: F.SYM[cur],
      C: function (v, dp) { return F.money(v, ctx.cur, dp); },
      P: function (v, dp) { return F.pct(v, dp); },
      N: function (v, dp) { return F.num(v, dp); }
    };
    ctx.setCur = function (k) { ctx.cur = k; ctx.sym = F.SYM[k]; };
    ctx.other = function () { var o; do { o = r.pick(COMPANIES)[0]; } while (o === ctx.company); return o; };
    return ctx;
  }
  FSM.makeCtx = makeCtx;

  /* ---------- registration ---------- */
  /* Numeric/case skill:
     { id, topic, title, formula, build(r, ctx) -> {intro:[...], facts:[...], noise:[...], statement?, parts:[...]} } */
  FSM.addSkill = function (s) { s.kind = s.kind || 'calc'; FSM.skills[s.id] = s; };

  /* Concept set: { id, topic, title, items:[{term, defs:[], cat}], scenarios:[{q:[], a:term}],
     tf:[{s, t, why}], sequences:[{title, steps}], groups:{name:[terms]} } */
  FSM.addConcepts = function (s) { s.kind = 'concept'; FSM.skills[s.id] = s; };

  FSM.skillsFor = function (topic) {
    return Object.keys(FSM.skills).map(function (k) { return FSM.skills[k]; })
      .filter(function (s) { return s.topic === topic; });
  };

  /* ---------- helpers ---------- */
  function uniqueish(values, v, minRel) {
    for (var i = 0; i < values.length; i++) {
      var a = values[i];
      if (Math.abs(a - v) <= Math.max(Math.abs(v) * (minRel || 0.004), 1e-9)) return false;
    }
    return true;
  }
  function fmtv(v, part, ctx) {
    return F.fmt(v, part.unit, { cur: ctx.cur, dp: part.dp });
  }
  function unitHint(part, ctx) {
    var dp = part.dp;
    switch (part.unit) {
      case 'cur': return 'in ' + ctx.sym + (dp ? ', ' + dp + ' decimals' : ', whole ' + (ctx.cur === 'EUR' ? 'euros' : ctx.cur === 'USD' ? 'dollars' : 'pounds'));
      case 'pct': return 'in %, ' + (dp === undefined ? 2 : dp) + ' decimals';
      case 'days': return 'in days, ' + (dp === undefined ? 1 : dp) + ' decimal';
      case 'x': return (dp === undefined ? 2 : dp) + ' decimals';
      case 'units': return 'in units';
      default: return dp ? dp + ' decimals' : 'number';
    }
  }
  FSM.unitHint = unitHint;

  /* Build plausible distractors: traps first, then numeric perturbations */
  function options(part, r, n) {
    var vals = [part.answer];
    var opts = [{ v: part.answer, correct: true }];
    (part.traps || []).forEach(function (t) {
      if (opts.length < n && isFinite(t.v) && uniqueish(vals, t.v)) { vals.push(t.v); opts.push({ v: t.v, why: t.why }); }
    });
    var mults = r.shuffle([1.1, 0.9, 1.25, 0.8, 1.5, 0.5, 2, 1.05, 0.95]);
    var i = 0;
    while (opts.length < n && i < mults.length) {
      var v = part.answer * mults[i++];
      if (part.unit === 'cur' && Math.abs(v) > 100) v = Math.round(v);
      if (uniqueish(vals, v)) { vals.push(v); opts.push({ v: v, why: 'Arithmetic slip — recheck each step.' }); }
    }
    if (opts.length < n) {
      var scale = Math.max.apply(null, [Math.abs(part.answer) * 0.3, part.unit === 'pct' ? 0.02 : part.unit === 'x' ? 0.5 : 10].concat((part.traps || []).map(function (t) { return Math.abs(t.v) * 0.3; })));
      var k = 1;
      while (opts.length < n && k < 10) {
        var cand = part.answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * scale;
        if (part.unit === 'cur' && Math.abs(cand) > 100) cand = Math.round(cand);
        if (uniqueish(vals, cand)) { vals.push(cand); opts.push({ v: cand, why: 'Arithmetic slip — recheck each step.' }); }
        k++;
      }
    }
    return r.shuffle(opts);
  }

  /* ---------- layouts for calc skills ---------- */
  function renderFacts(b, layout, r, ctx) {
    var intro = Array.isArray(b.intro) ? r.pick(b.intro) : (b.intro || '');
    var facts = b.facts || [];
    var noise = layout === 'case' ? (b.noise || []) : [];
    var html = '';
    if (layout === 'statement' && b.statement) {
      html += '<p>' + intro + '</p>' + statementTable(b.statement, ctx, r.chance(0.35));
      var extra = facts.filter(function (f) { return f.alsoInText; });
      if (extra.length) html += '<p>' + r.shuffle(extra).map(function (f) { return f.s; }).join(' ') + '</p>';
      return html;
    }
    if (layout === 'table') {
      var thousands = r.chance(0.3) && facts.some(function (f) { return f.unit === 'cur' && Math.abs(f.v) >= 100000; });
      html += '<p>' + intro + '</p><table class="facts">';
      if (thousands) html += '<tr><th></th><th>(' + ctx.sym + " '000)</th></tr>";
      r.shuffle(facts.filter(function (f) { return !f.fixed; })).concat(facts.filter(function (f) { return f.fixed; })).forEach(function (f) {
        var val = (thousands && f.unit === 'cur' && Math.abs(f.v) >= 1000) ? F.k(f.v, Math.abs(f.v) % 1000 ? 1 : 0) : F.fmt(f.v, f.unit, { cur: ctx.cur, dp: f.dp });
        html += '<tr><td>' + f.label + '</td><td class="num">' + val + '</td></tr>';
      });
      html += '</table>';
      if (thousands) html += '<p class="note">Amounts marked (' + ctx.sym + " '000) are in thousands. Give your answers in full amounts unless stated otherwise.</p>";
      return html;
    }
    // sentence / case: group fragments into complete sentences, then (case) shuffle sentences and mix in noise
    var chunks = [], cur = '';
    facts.forEach(function (f) {
      if (!f.s || !/\S/.test(f.s)) return;
      cur += (cur ? ' ' : '') + f.s;
      if (/[.?!]\s*(<br>)?\s*$/.test(f.s)) { chunks.push(cur); cur = ''; }
    });
    if (cur) chunks.push(cur.replace(/[,;]\s*$/, '') + '.');
    if (layout === 'case') {
      chunks = r.shuffle(chunks);
      noise.forEach(function (n) { if (n.s && /\S/.test(n.s)) chunks.splice(r.int(0, chunks.length), 0, n.s); });
    }
    html += '<p>' + intro + ' ' + chunks.join(' ') + '</p>';
    return html;
  }

  function statementTable(st, ctx, thousands) {
    var cols = st.cols || [''];
    var h = '<table class="facts stmt"><tr><th>' + (st.title || '') + (thousands ? ' (' + ctx.sym + " '000)" : '') + '</th>';
    cols.forEach(function (c) { h += '<th>' + c + '</th>'; });
    h += '</tr>';
    st.rows.forEach(function (row) {
      if (row.head) { h += '<tr class="sub"><td colspan="' + (cols.length + 1) + '">' + row.head + '</td></tr>'; return; }
      h += '<tr' + (row.total ? ' class="total"' : '') + '><td>' + row.label + '</td>';
      row.v.forEach(function (v) {
        var s;
        if (v === null || v === undefined || v === '') s = '';
        else if (typeof v === 'string') s = v;
        else if (row.unit && row.unit !== 'cur') s = F.fmt(v, row.unit, { dp: row.dp });
        else s = thousands ? (v < 0 ? '(' + F.k(-v, (Math.abs(v) % 1000) ? 1 : 0) + ')' : F.k(v, (Math.abs(v) % 1000) ? 1 : 0)) : (v < 0 ? '(' + F.money(-v, ctx.cur) + ')' : F.money(v, ctx.cur));
        h += '<td class="num">' + s + '</td>';
      });
      h += '</tr>';
    });
    return h + '</table>';
  }
  FSM.statementTable = statementTable;

  function renderSteps(steps, ctx, wrongIdx, wrongVal) {
    return steps.map(function (st, i) {
      if (typeof st === 'string') return { html: st, has: false };
      var v = (i === wrongIdx) ? wrongVal : st.v;
      var val = (v === undefined) ? '' : ' = <b>' + F.fmt(v, st.unit, { cur: ctx.cur, dp: st.dp }) + '</b>';
      var src = st.src ? ' <span class="src">← ' + st.src + '</span>' : '';
      return { html: st.t + val + src, has: v !== undefined };
    });
  }
  FSM.renderSteps = renderSteps;

  /* ---------- format choice ---------- */
  var CALC_FORMATS = ['num', 'num', 'mcq', 'tf', 'error', 'order'];

  function chooseFormat(part, r, forced) {
    var allowed = ['num', 'mcq', 'tf'];
    if (part.steps && part.steps.filter(function (s) { return typeof s === 'object' && s.v !== undefined; }).length >= 2) allowed.push('error');
    if (part.method && part.method.length >= 3) allowed.push('order');
    if (part.kind === 'open') return 'open';
    if (part.kind === 'choice') return 'choice';
    if (forced && allowed.indexOf(forced) >= 0) return forced;
    var pool = CALC_FORMATS.filter(function (f) { return allowed.indexOf(f) >= 0; });
    return r.pick(pool);
  }

  /* ---------- make a calc question ---------- */
  function makeCalc(skill, seed, opts) {
    var r = new RNG(seed);
    var ctx = makeCtx(r);
    var b = skill.build(r, ctx);
    var layouts = b.layouts || (b.statement ? ['statement', 'statement', 'table', 'case'] : ['sentence', 'table', 'case']);
    var layout = opts.layout || r.pick(layouts);
    var stem = renderFacts(b, layout, r, ctx);
    var nParts = b.parts.length;
    var parts = b.parts.map(function (p, i) {
      var q = {
        prompt: Array.isArray(p.ask) ? r.pick(p.ask) : p.ask,
        unit: p.unit, dp: p.dp, answer: p.answer, traps: p.traps || [],
        steps: p.steps || [], hint: p.hint, kind: p.kind, model: p.model, points: p.points,
        choices: p.choices, correctChoice: p.correctChoice, why: p.why, method: p.method
      };
      // in multi-part questions, keep most parts numeric so the case flows; vary one or two
      var forced = opts.format;
      if (!forced && nParts > 2 && r.chance(0.55)) forced = 'num';
      q.format = chooseFormat(q, r, forced);
      prepareFormat(q, r, ctx);
      q.hintText = unitHint(q, ctx);
      return q;
    });
    return {
      skill: skill.id, topic: skill.topic, title: skill.title, seed: seed, layout: layout,
      ctx: ctx, stem: stem, parts: parts, formula: skill.formula,
      formats: parts.map(function (p) { return p.format; })
    };
  }

  function prepareFormat(q, r, ctx) {
    if (q.format === 'mcq') {
      q.options = options(q, r, 4);
    } else if (q.format === 'tf') {
      var o = options(q, r, 3).filter(function (x) { return !x.correct; });
      q.tfTrue = r.chance(0.5) || !o.length;
      q.tfValue = q.tfTrue ? q.answer : o[0].v;
      q.tfWhy = q.tfTrue ? null : o[0].why;
    } else if (q.format === 'error') {
      var idx = [];
      q.steps.forEach(function (s, i) { if (typeof s === 'object' && s.v !== undefined && s.v !== 0) idx.push(i); });
      if (!idx.length) { q.format = 'num'; return; }
      var wi = r.pick(idx);
      var st = q.steps[wi];
      var trap = (q.traps || []).filter(function (t) { return t.step === wi; })[0];
      var wv;
      if (trap) wv = trap.stepV;
      else {
        var m = r.pick([1.1, 0.9, 1.2, 0.8, 2, 0.5]);
        wv = st.v * m;
        if (st.unit === 'cur' && Math.abs(wv) > 100) wv = Math.round(wv);
      }
      q.errorIdx = wi; q.errorVal = wv;
      q.errorRendered = renderSteps(q.steps, ctx, wi, wv);
    } else if (q.format === 'order') {
      q.orderShuffled = r.shuffle(q.method.map(function (m, i) { return { t: m, i: i }; }));
      // make sure it is actually shuffled
      if (q.orderShuffled.every(function (o, i) { return o.i === i; })) q.orderShuffled.reverse();
    } else if (q.format === 'choice') {
      var ch = q.choices.map(function (c, i) { return { t: c, i: i }; });
      q.choiceOrder = r.shuffle(ch);
    }
  }

  /* ---------- concept questions ---------- */
  var CONCEPT_FORMATS = ['def2term', 'term2def', 'scenario', 'tf', 'match', 'notin', 'order'];

  function conceptFormats(s) {
    var f = ['def2term', 'term2def'];
    if (s.scenarios && s.scenarios.length) f.push('scenario', 'scenario');
    f.push('tf');
    if (s.items.length >= 4) f.push('match');
    if (s.groups && Object.keys(s.groups).length >= 2) f.push('notin');
    if (s.sequences && s.sequences.length) f.push('order');
    if (s.tf && s.tf.length) f.push('tf');
    return f;
  }

  var D2T = [
    'Which term matches this description?',
    'What is being described here?',
    'A classmate summarises a concept as follows. Which concept is it?',
    'Name the concept:',
    'Your lecturer writes this on the board. Which term fits?'
  ];
  var T2D = [
    'Which statement best describes “%s”?',
    'What does “%s” mean?',
    'Pick the correct explanation of “%s”.',
    'In your own exam answer you mention “%s”. Which definition is right?'
  ];

  function makeConcept(skill, seed, opts) {
    var r = new RNG(seed);
    var ctx = makeCtx(r);
    var fmts = conceptFormats(skill);
    var format = (opts.format && fmts.indexOf(opts.format) >= 0) ? opts.format : r.pick(fmts);
    var q = { skill: skill.id, topic: skill.topic, title: skill.title, seed: seed, ctx: ctx, layout: 'concept' };
    var items = skill.items;
    function distractorItems(item, n) {
      var pool = items.filter(function (x) { return x !== item; });
      if (item.cat) {
        var same = pool.filter(function (x) { return x.cat === item.cat; });
        var other = pool.filter(function (x) { return x.cat !== item.cat; });
        pool = r.shuffle(same).concat(r.shuffle(other));
        return pool.slice(0, n);
      }
      return r.sample(pool, n);
    }
    var part = { format: 'choice' };
    if (format === 'def2term' || format === 'term2def' || format === 'tf') {
      var item = r.pick(items);
      var dis = distractorItems(item, 3);
      if (format === 'def2term') {
        q.stem = '<p>' + r.pick(D2T) + '</p><blockquote>' + r.pick(item.defs) + '</blockquote>';
        part.choices = [item.term].concat(dis.map(function (d) { return d.term; }));
      } else if (format === 'term2def') {
        q.stem = '<p>' + r.pick(T2D).replace('%s', item.term) + '</p>';
        part.choices = [r.pick(item.defs)].concat(dis.map(function (d) { return r.pick(d.defs); }));
      } else {
        // true/false: either a bank statement or term-definition pairing
        if (skill.tf && skill.tf.length && r.chance(0.6)) {
          var s = r.pick(skill.tf);
          q.stem = '<p>True or false?</p><blockquote>' + s.s + '</blockquote>';
          part.choices = s.t ? ['True', 'False'] : ['False', 'True'];
          part.why = s.why;
        } else {
          var truth = r.chance(0.5);
          var d = truth ? item : dis[0];
          q.stem = '<p>True or false?</p><blockquote><b>' + item.term + '</b> — ' + r.pick(d.defs) + '</blockquote>';
          part.choices = truth ? ['True', 'False'] : ['False', 'True'];
          part.why = truth ? 'This is the correct description of ' + item.term + '.' : 'That description belongs to “' + d.term + '”, not “' + item.term + '”. ' + item.term + ': ' + item.defs[0];
        }
        part.fixedOrder = true;
      }
      if (format !== 'tf') part.why = item.term + ': ' + item.defs[0];
      part.correctChoice = 0;
    } else if (format === 'scenario') {
      var sc = r.pick(skill.scenarios);
      var ans = items.filter(function (x) { return x.term === sc.a; })[0] || { term: sc.a, defs: [''] };
      var dis2 = sc.opts ? sc.opts.map(function (t) { return { term: t }; }) : distractorItems(ans, 3);
      q.stem = '<p>' + (Array.isArray(sc.q) ? r.pick(sc.q) : sc.q) + '</p>';
      part.choices = [sc.a].concat(dis2.slice(0, 3).map(function (d) { return d.term; }));
      part.correctChoice = 0;
      part.why = sc.why || (ans.defs[0] ? sc.a + ': ' + ans.defs[0] : '');
    } else if (format === 'match') {
      var pick4 = r.sample(items, 4);
      q.stem = '<p>' + r.pick(['Match each term with its description.', 'Connect every concept to the right explanation.', 'Pair the terms with the statements.']) + '</p>';
      part.format = 'match';
      part.pairs = pick4.map(function (x) { return { term: x.term, def: r.pick(x.defs) }; });
      part.defOrder = r.shuffle(part.pairs.map(function (p, i) { return i; }));
    } else if (format === 'notin') {
      var gnames = Object.keys(skill.groups);
      var g = r.pick(gnames);
      var members = r.sample(skill.groups[g], Math.min(3, skill.groups[g].length));
      var outsiders = [];
      gnames.forEach(function (n) { if (n !== g) outsiders = outsiders.concat(skill.groups[n].filter(function (t) { return skill.groups[g].indexOf(t) < 0; })); });
      var odd = r.pick(outsiders);
      q.stem = '<p>' + r.pick(['Which of these does NOT belong to “%s”?', 'Three of these are examples of “%s”. Which one is not?', 'Spot the odd one out — which is not part of “%s”?']).replace('%s', g) + '</p>';
      part.choices = [odd].concat(members);
      part.correctChoice = 0;
      var oddGroup = gnames.filter(function (n) { return skill.groups[n].indexOf(odd) >= 0; })[0];
      part.why = '“' + odd + '” belongs to “' + oddGroup + '”. “' + g + '” contains: ' + skill.groups[g].join(', ') + '.';
    } else if (format === 'order') {
      var seq = r.pick(skill.sequences);
      q.stem = '<p>' + r.pick(['Put these steps in the correct order:', 'Arrange in the right sequence:', 'What is the correct order?']) + ' <b>' + seq.title + '</b></p>';
      part.format = 'order';
      part.method = seq.steps;
      part.orderShuffled = r.shuffle(seq.steps.map(function (t, i) { return { t: t, i: i }; }));
      if (part.orderShuffled.every(function (o, i) { return o.i === i; })) part.orderShuffled.reverse();
      part.why = seq.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('<br>');
    }
    if (part.format === 'choice') {
      var ch = part.choices.map(function (c, i) { return { t: c, i: i }; });
      part.choiceOrder = part.fixedOrder ? ch : r.shuffle(ch);
    }
    part.prompt = '';
    q.parts = [part];
    q.formats = [format];
    return q;
  }

  FSM.make = function (skillId, seed, opts) {
    opts = opts || {};
    var s = FSM.skills[skillId];
    if (!s) throw new Error('Unknown skill ' + skillId);
    return s.kind === 'concept' ? makeConcept(s, seed, opts) : makeCalc(s, seed, opts);
  };

  FSM.formatsFor = function (skillId) {
    var s = FSM.skills[skillId];
    return s.kind === 'concept' ? conceptFormats(s) : CALC_FORMATS;
  };

  /* ---------- grading ---------- */
  FSM.gradePart = function (part, response) {
    switch (part.format) {
      case 'num': {
        var g = F.grade(response, part.answer, part.unit, { dp: part.dp, tolRel: part.tolRel });
        var trap = null;
        if (!g.ok && isFinite(g.parsed)) {
          (part.traps || []).forEach(function (t) {
            if (!trap && isFinite(t.v) && Math.abs(g.parsed - t.v) <= Math.max(Math.abs(t.v) * 0.006, 0.5 * Math.pow(10, -(part.dp || 0)))) trap = t;
          });
        }
        return { ok: g.ok, exact: g.exact, trap: trap, unreadable: g.reason === 'unreadable' };
      }
      case 'mcq': {
        var o = part.options[response];
        return { ok: !!(o && o.correct), trap: o && !o.correct && o.why ? { why: o.why } : null };
      }
      case 'tf': return { ok: (response === 'true') === part.tfTrue, trap: part.tfWhy ? { why: part.tfWhy } : null };
      case 'error': return { ok: Number(response) === part.errorIdx };
      case 'order': {
        var seq = response || [];
        var ok = seq.length === part.method.length && seq.every(function (v, i) { return v === i; });
        return { ok: ok };
      }
      case 'choice': return { ok: Number(response) === part.correctChoice };
      case 'match': {
        var m = response || {};
        var all = part.pairs.every(function (p, i) { return Number(m[i]) === i; });
        return { ok: all };
      }
      case 'open': return { ok: response >= 0.6, selfScore: response };
    }
    return { ok: false };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = FSM;
})(typeof window !== 'undefined' ? window : globalThis);
