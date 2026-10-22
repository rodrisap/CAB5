/* Course case — NoordzeeOutdoor B.V. (original numbers + perturbed variants so answers can't be memorised) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;

  FSM.addTopic({ id: 'fin_case', area: 'Finance', week: 0, label: 'Course case', title: 'Case: NoordzeeOutdoor B.V. (+ variants)', read: 'Seminar case questions for weeks 2–6', guide: 'case' });

  var NAMES = [['NoordzeeOutdoor B.V.', 'VeloTrans B.V.'], ['Waddenzee Sports B.V.', 'CityCargo B.V.'], ['Hunze Outdoor B.V.', 'GreenMile Delivery B.V.'], ['Eemskust Adventure B.V.', 'PedalPost B.V.'], ['Lauwers Gear B.V.', 'SnelBezorgd B.V.'], ['Drentse Trail Co. B.V.', 'LastMile Noord B.V.']];

  /* original case data (2025 | 2026) */
  var BASE = {
    rev: [9800000, 11200000], vcogs: [4410000, 5040000], vsd: [1078000, 1120000], fixed: [2450000, 2700000], interest: [180000, 260000], T: 0.25,
    cash: [420000, 310000], ar: [980000, 1260000], inv: [1540000, 2100000], prep: [60000, 80000], ppe: [2380000, 3050000], intang: [150000, 120000],
    tp: [760000, 820000], stb: [400000, 700000], accr: [140000, 180000], ltd: [1200000, 1800000], pref: 500000, common: 1000000,
    cashSales: [0.2, 0.1], cashPurch: [0.2, 0.35], inv0: 1400000, ar0: 1540000, ap0: 800000,
    ltInterest: [78000, 121200], pd: 60000, prefShares: 50000, shares: 500000, price: [8.5, 10.2], rp: [0.09, 0.095], rs: [0.105, 0.115],
    industry: { cr: 1.8, it: 3.2, de: 0.6, roe: 0.22, pe: 12 },
    funding: [
      { name: 'Harborview Trust Bank', kind: 'discount', rate: 6, days: 150 },
      { name: 'Crestline Capital', kind: 'simple', rate: 9, days: 65 },
      { name: 'Nordbank Nederland N.V.', kind: 'monthly', rate: 9.6 },
      { name: 'FuelMaster Suppliers', kind: 'terms', cd: 3.4, y: 25, z: 125 },
      { name: 'RoutePro Technologies', kind: 'terms', cd: 3.4, y: 10, z: 30 }
    ],
    sub: { cash: 80000, ar: 210000, inv: 95000, ppe: 440000, tp: 120000, stb: 100000, ltd: 250000 }, deal: 900000, loan: 600000, uplift: 400000
  };

  function derive(d) {
    var y = [0, 1].map(function (i) {
      var o = {};
      o.rev = d.rev[i]; o.vc = d.vcogs[i] + d.vsd[i]; o.cm = o.rev - o.vc; o.fixed = d.fixed[i]; o.ebit = o.cm - o.fixed;
      o.interest = d.interest[i]; o.ebt = o.ebit - o.interest; o.tax = Math.round(o.ebt * d.T); o.ni = o.ebt - o.tax;
      o.cash = d.cash[i]; o.ar = d.ar[i]; o.inv = d.inv[i]; o.prep = d.prep[i];
      o.ca = o.cash + o.ar + o.inv + o.prep; o.ppe = d.ppe[i]; o.intang = d.intang[i]; o.ta = o.ca + o.ppe + o.intang;
      o.tp = d.tp[i]; o.stb = d.stb[i]; o.accr = d.accr[i]; o.cl = o.tp + o.stb + o.accr; o.ltd = d.ltd[i];
      o.te = o.ta - o.cl - o.ltd; o.re = o.te - d.pref - d.common; o.ce = o.te - d.pref; o.tl = o.cl + o.ltd;
      o.totalCogs = d.vcogs[i] + d.fixed[i];
      o.eacs = o.ni - d.pd; o.eps = o.eacs / d.shares; o.pe = d.price[i] / o.eps;
      return o;
    });
    // averages & CCC
    var inv0 = [d.inv0, d.inv[0]], ar0 = [d.ar0, d.ar[0]], ap0 = [d.ap0, d.tp[0]];
    y.forEach(function (o, i) {
      o.avgInv = (inv0[i] + o.inv) / 2; o.avgAR = (ar0[i] + o.ar) / 2; o.avgAP = (ap0[i] + o.tp) / 2;
      o.invTurn = o.totalCogs / o.avgInv; o.aai = 365 / o.invTurn;
      o.creditSales = o.rev * (1 - d.cashSales[i]); o.acp = o.avgAR / (o.creditSales / 365);
      o.purch = o.totalCogs + (o.inv - inv0[i]); o.creditPurch = o.purch * (1 - d.cashPurch[i]); o.app = o.avgAP / (o.creditPurch / 365);
      o.ccc = o.aai + o.acp - o.app;
      o.cr = o.ca / o.cl; o.de = o.tl / o.ce; o.roe = o.eacs / o.ce;
      var L = FSM.calc.leverage({ cm: o.cm, fc: o.fixed, interest: o.interest, T: d.T, pd: d.pd });
      o.dol = L.dol; o.dfl = L.dfl; o.dtl = L.dtl;
      o.rd = d.ltInterest[i] / o.ltd;
      o.w = FSM.calc.wacc({ d: o.ltd, p: d.pref, s: o.ce, rd: o.rd, rp: d.rp[i], rs: d.rs[i], T: d.T });
    });
    return y;
  }

  function perturb(r) {
    var d = JSON.parse(JSON.stringify(BASE));
    var g = r.range(0.75, 1.3, 0.05);
    function j(v, lo, hi) { return Math.round(v * g * r.range(lo || 0.9, hi || 1.1, 0.01) / 1000) * 1000; }
    ['rev', 'vcogs', 'vsd', 'fixed', 'cash', 'ar', 'inv', 'prep', 'ppe', 'intang', 'tp', 'stb', 'accr', 'ltd'].forEach(function (k) { d[k] = d[k].map(function (v) { return j(v); }); });
    d.interest = d.interest.map(function (v) { return j(v); });
    [0, 1].forEach(function (i) {
      d.vcogs[i] = Math.round(d.rev[i] * BASE.vcogs[i] / BASE.rev[i] * r.range(0.97, 1.03, 0.01) / 1000) * 1000;
      d.vsd[i] = Math.round(d.rev[i] * BASE.vsd[i] / BASE.rev[i] * r.range(0.95, 1.05, 0.01) / 1000) * 1000;
      d.fixed[i] = Math.round(d.rev[i] * BASE.fixed[i] / BASE.rev[i] * r.range(0.95, 1.05, 0.01) / 1000) * 1000;
    });
    d.inv0 = j(d.inv0); d.ar0 = j(d.ar0); d.ap0 = j(d.ap0);
    d.pref = Math.round(d.pref * g / 10000) * 10000; d.common = Math.round(d.common * g / 10000) * 10000;
    d.prefShares = Math.round(d.pref / 10); d.pd = d.prefShares * r.pick([1, 1.1, 1.2, 1.3, 1.5]);
    d.shares = Math.round(d.common / 2);
    d.cashSales = [r.pick([0.1, 0.15, 0.2, 0.25]), r.pick([0.05, 0.1, 0.15])]; d.cashPurch = [r.pick([0.1, 0.2, 0.25]), r.pick([0.2, 0.3, 0.35])];
    d.ltInterest = [Math.round(d.ltd[0] * r.range(0.055, 0.075, 0.005)), 0];
    d.ltInterest[1] = Math.round(d.ltInterest[0] + (d.ltd[1] - d.ltd[0]) * r.range(0.065, 0.08, 0.001));
    d.price = [h.r2(d.price[0] * r.range(0.8, 1.3, 0.05)), h.r2(d.price[1] * r.range(0.8, 1.3, 0.05))];
    d.rp = [r.range(0.08, 0.1, 0.005), r.range(0.085, 0.105, 0.005)]; d.rs = [r.range(0.095, 0.12, 0.005), r.range(0.1, 0.13, 0.005)];
    d.funding = [
      { name: 'Harborview Trust Bank', kind: 'discount', rate: r.range(4, 8, 0.5), days: r.pick([90, 120, 150, 180]) },
      { name: 'Crestline Capital', kind: 'simple', rate: r.range(7, 12, 0.5), days: r.pick([45, 60, 65, 90]) },
      { name: 'Nordbank Nederland N.V.', kind: 'monthly', rate: r.range(8, 11, 0.1) },
      { name: 'FuelMaster Suppliers', kind: 'terms', cd: r.pick([2, 2.5, 3, 3.4]), y: r.pick([20, 25, 30]), z: r.pick([90, 100, 125]) },
      { name: 'RoutePro Technologies', kind: 'terms', cd: r.pick([1, 2, 3.4]), y: r.pick([10, 15]), z: r.pick([30, 45, 60]) }
    ];
    var gs = r.range(0.7, 1.4, 0.05);
    Object.keys(d.sub).forEach(function (k) { d.sub[k] = Math.round(d.sub[k] * gs / 1000) * 1000; });
    var subEq = d.sub.cash + d.sub.ar + d.sub.inv + d.sub.ppe - d.sub.tp - d.sub.stb - d.sub.ltd;
    d.dealPrice = Math.round(subEq * r.range(1.4, 3, 0.1) / 10000) * 10000;
    d.loan = Math.round(d.dealPrice * r.range(0.5, 0.8, 0.05) / 10000) * 10000;
    d.uplift = Math.round(Math.min(d.dealPrice - subEq, d.sub.ppe) * r.range(0.3, 0.9, 0.1) / 10000) * 10000;
    return d;
  }

  function getCase(r) {
    var original = r.chance(0.35);
    var d = original ? JSON.parse(JSON.stringify(BASE)) : perturb(r), tries = 0;
    while (!original && tries++ < 10 && derive(d).some(function (o) { return o.eacs <= 0 || o.re <= 0 || o.ce <= 0; })) d = perturb(r);
    if (original) d.dealPrice = BASE.deal;
    var names = original ? NAMES[0] : r.pick(NAMES.slice(1));
    return { d: d, y: derive(d), name: names[0], target: names[1], original: original };
  }
  FSM.noordzee = { BASE: BASE, derive: derive, getCase: getCase };

  function header(cs) { return cs.original ? 'This is the <b>original course case</b>. ' : 'This is a <b>variant</b> of the course case with different numbers. '; }
  function isStatement(cs) {
    var y = cs.y, d = cs.d;
    return { title: cs.name, cols: ['2025', '2026'], rows: [
      { head: 'Income statement (contribution format)' },
      { label: 'Revenue', v: [y[0].rev, y[1].rev] }, { label: 'Variable COGS', v: d.vcogs }, { label: 'Variable selling & distribution', v: d.vsd },
      { label: 'Contribution margin', v: [y[0].cm, y[1].cm], total: true }, { label: 'Fixed operating costs', v: d.fixed }, { label: 'EBIT', v: [y[0].ebit, y[1].ebit], total: true },
      { label: 'Interest expense', v: d.interest }, { label: 'Profit before tax', v: [y[0].ebt, y[1].ebt], total: true }, { label: 'Income tax (25%)', v: [y[0].tax, y[1].tax] }, { label: 'Net profit', v: [y[0].ni, y[1].ni], total: true }
    ] };
  }
  function bsStatement(cs) {
    var y = cs.y, d = cs.d;
    return { title: cs.name, cols: ['2025', '2026'], rows: [
      { head: 'Balance sheet (31 Dec)' },
      { label: 'Cash', v: d.cash }, { label: 'Trade receivables', v: d.ar }, { label: 'Inventories', v: d.inv }, { label: 'Prepaid expenses', v: d.prep },
      { label: 'Total current assets', v: [y[0].ca, y[1].ca], total: true }, { label: 'Net PP&E', v: d.ppe }, { label: 'Intangible assets', v: d.intang }, { label: 'Total assets', v: [y[0].ta, y[1].ta], total: true },
      { label: 'Trade payables', v: d.tp }, { label: 'Short-term borrowings', v: d.stb }, { label: 'Accrued liabilities', v: d.accr }, { label: 'Total current liabilities', v: [y[0].cl, y[1].cl], total: true },
      { label: 'Long-term bank loans', v: d.ltd }, { label: 'Preferred share capital', v: [d.pref, d.pref] }, { label: 'Common share capital', v: [d.common, d.common] }, { label: 'Retained earnings', v: [y[0].re, y[1].re] },
      { label: 'Total equity', v: [y[0].te, y[1].te], total: true }
    ] };
  }
  function mergeStatements(a, b) { return { title: a.title, cols: a.cols, rows: a.rows.concat(b.rows) }; }

  /* ---------------- case: ratios (week 2) ---------------- */
  FSM.addSkill({
    id: 'fin_case_ratios', topic: 'fin_case', title: 'Case W2: ratios vs industry',
    formula: 'Current ratio · inventory turnover · D/E · ROE · EPS · P/E',
    build: function (r, c) {
      c.setCur('EUR');
      var cs = getCase(r), d = cs.d;
      var i = r.int(0, 1), yr = 2025 + i, o = cs.y[i], C = c.C;
      var all = [
        { k: 'current ratio', v: o.cr, u: 'x', st: [step('CA / CL = ' + C(o.ca) + ' / ' + C(o.cl), o.cr, 'x', 'balance sheet', 2)], tr: [{ v: (o.ca - o.inv) / o.cl, why: 'That is the quick ratio.' }] },
        { k: 'inventory turnover', v: o.invTurn, u: 'x', st: [step('Total COGS (variable COGS + fixed costs) = ' + C(o.totalCogs), o.totalCogs, 'cur', 'appendix: COGS incl. fixed'), step('Average inventory = (' + C(i ? d.inv[0] : d.inv0) + ' + ' + C(o.inv) + ') / 2', o.avgInv, 'cur', 'opening + closing'), step('Turnover = COGS / average inventory', o.invTurn, 'x', 'formula sheet', 2)],
          tr: [{ v: o.totalCogs / o.inv, why: 'Use average inventory.' }, { v: d.vcogs[i] / o.avgInv, why: 'The appendix gives total COGS (variable + fixed) — use that.' }] },
        { k: 'debt-to-equity ratio', v: o.de, u: 'x', st: [step('Total liabilities = CL + LT loans = ' + C(o.cl) + ' + ' + C(o.ltd), o.tl, 'cur', 'balance sheet'), step('Common equity = total equity − preferred = ' + C(o.te) + ' − ' + C(d.pref), o.ce, 'cur', 'exclude preferred'), step('D/E = TL / common equity', o.de, 'x', 'formula sheet', 2)],
          tr: [{ v: o.tl / o.te, why: 'Use COMMON stock equity (exclude preferred share capital).' }, { v: o.ltd / o.ce, why: 'Total liabilities include current liabilities.' }] },
        { k: 'return on equity', v: o.roe, u: 'pct', st: [step('EACS = net profit − preferred dividends = ' + C(o.ni) + ' − ' + C(d.pd), o.eacs, 'cur', 'dividend ' + C(d.pd / d.prefShares, 2) + ' × ' + F.num(d.prefShares) + ' pref. shares'), step('Common equity = ' + C(o.te) + ' − ' + C(d.pref), o.ce, 'cur', 'exclude preferred'), step('ROE = EACS / common equity', o.roe, 'pct', 'formula sheet', 2)],
          tr: [{ v: o.ni / o.te, why: 'Use EACS and common equity.' }, { v: o.eacs / o.te, why: 'Use COMMON equity (exclude preferred).' }] },
        { k: 'EPS', v: o.eps, u: 'cur', dp: 2, st: [step('EACS = ' + C(o.ni) + ' − ' + C(d.pd), o.eacs, 'cur', 'net profit − preferred dividends'), step('EPS = EACS / ' + F.num(d.shares) + ' common shares', o.eps, 'cur', 'formula sheet', 2)], tr: [{ v: o.ni / d.shares, why: 'Deduct preferred dividends.' }, { v: o.eacs / (d.shares + d.prefShares), why: 'Only COMMON shares count.' }] },
        { k: 'P/E ratio', v: o.pe, u: 'x', st: [step('EPS', o.eps, 'cur', 'EACS / common shares', 2), step('P/E = ' + C(d.price[i], 2) + ' / EPS', o.pe, 'x', 'formula sheet', 2)], tr: [{ v: d.price[i] / (o.ni / d.shares), why: 'EPS must exclude preferred dividends.' }] }
      ];
      var picks = r.sample(all, 3);
      var ind = d.industry || BASE.industry;
      var parts = picks.map(function (p) { return { ask: ['Calculate the ' + p.k + ' for ' + yr + '.', 'What is the ' + yr + ' ' + p.k + '?'], answer: p.v, unit: p.u, dp: p.dp || 2, traps: p.tr.filter(function (t) { return Math.abs(t.v - p.v) > Math.abs(p.v) * 0.01; }), steps: p.st }; });
      parts.push({ kind: 'open', ask: ['Compare these ratios with the industry averages (current 1.80, inventory turnover 3.20×, D/E 0.60, ROE 22%, P/E 12.0×). What does this say about the company?'],
        model: 'Liquidity (current ratio ' + F.num(o.cr, 2) + ' vs 1.80) is ' + (o.cr > 1.8 ? 'above' : 'below') + ' the industry. Inventory turns ' + F.num(o.invTurn, 2) + '× vs 3.20×, so stock moves ' + (o.invTurn > 3.2 ? 'faster' : 'slower') + ' than peers. Leverage is ' + (o.de > 0.6 ? 'much higher' : 'lower') + ' (D/E ' + F.num(o.de, 2) + ' vs 0.60), which helps explain an ROE of ' + h.p(o.roe, 1) + ' vs 22%. A P/E of ' + F.num(o.pe, 1) + ' vs 12 means investors pay relatively ' + (o.pe < 12 ? 'little' : 'much') + ' per euro of earnings (shares are unlisted/illiquid). Overall: profitable, but more debt-financed and therefore riskier than the industry.',
        points: ['Compares each ratio with the industry figure (above/below)', 'Links high ROE to high leverage (debt)', 'Mentions higher financial risk', 'Interprets the P/E (investors pay little per euro of profit / illiquid shares)', 'Gives an overall conclusion'] });
      return { intro: [header(cs) + 'Use the financial statements of ' + cs.name + ' Preferred dividends are ' + C(d.pd) + ' per year; there are ' + F.num(d.shares) + ' common shares; the OTC share price was ' + C(d.price[0], 2) + ' (2025) and ' + C(d.price[1], 2) + ' (2026). Opening inventory on 1 Jan 2025: ' + C(d.inv0) + '. Total COGS (variable + fixed) is ' + C(cs.y[0].totalCogs) + ' (2025) and ' + C(cs.y[1].totalCogs) + ' (2026).'],
        statement: mergeStatements(isStatement(cs), bsStatement(cs)), facts: [], layouts: ['statement'], parts: parts };
    }
  });

  /* ---------------- case: CCC (week 3) ---------------- */
  FSM.addSkill({
    id: 'fin_case_ccc', topic: 'fin_case', title: 'Case W3: working capital & CCC',
    formula: 'CCC = AAI + ACP − APP (averages; credit sales/purchases only)',
    build: function (r, c) {
      c.setCur('EUR');
      var cs = getCase(r), d = cs.d, i = r.int(0, 1), o = cs.y[i], yr = 2025 + i, C = c.C;
      var opInv = i ? d.inv[0] : d.inv0, opAR = i ? d.ar[0] : d.ar0, opAP = i ? d.tp[0] : d.ap0;
      var wc0 = cs.y[0].ca - cs.y[0].cl, wc1 = cs.y[1].ca - cs.y[1].cl;
      return {
        intro: [header(cs) + 'Data for ' + cs.name + ' (365-day year). Opening balances on 1 Jan 2025: inventory ' + C(d.inv0) + ', receivables ' + C(d.ar0) + ', payables ' + C(d.ap0) + '. Total COGS (variable + fixed): ' + C(cs.y[0].totalCogs) + ' (2025), ' + C(cs.y[1].totalCogs) + ' (2026). Cash sales: ' + F.num(d.cashSales[0] * 100) + '% (2025), ' + F.num(d.cashSales[1] * 100) + '% (2026) of revenue. Cash purchases: ' + F.num(d.cashPurch[0] * 100) + '% (2025), ' + F.num(d.cashPurch[1] * 100) + '% (2026) of purchases.'],
        statement: mergeStatements(isStatement(cs), bsStatement(cs)), facts: [], layouts: ['statement'],
        parts: [
          { ask: ['Calculate the average age of inventory for ' + yr + '.'], answer: o.aai, unit: 'days', dp: 1, traps: [{ v: 365 / (o.totalCogs / o.inv), why: 'Use average inventory.' }, { v: 365 / (d.vcogs[i] / o.avgInv), why: 'Use total COGS from the appendix.' }],
            steps: [step('Average inventory = (' + C(opInv) + ' + ' + C(o.inv) + ') / 2', o.avgInv, 'cur', 'opening + closing'), step('Turnover = ' + C(o.totalCogs) + ' / avg inventory', o.invTurn, 'x', 'formula sheet', 2), step('AAI = 365 / turnover', o.aai, 'days', 'formula sheet', 1)] },
          { ask: ['Calculate the average collection period for ' + yr + '.'], answer: o.acp, unit: 'days', dp: 1, traps: [{ v: o.avgAR / (o.rev / 365), why: 'Exclude cash sales: only credit sales create receivables.' }, { v: o.ar / (o.creditSales / 365), why: 'Use average receivables.' }],
            steps: [step('Credit sales = ' + C(o.rev) + ' × ' + F.num((1 - d.cashSales[i]) * 100) + '%', o.creditSales, 'cur', 'exclude cash sales'), step('Average A/R = (' + C(opAR) + ' + ' + C(o.ar) + ') / 2', o.avgAR, 'cur', 'opening + closing'), step('ACP = avg A/R / (credit sales / 365)', o.acp, 'days', 'formula sheet', 1)] },
          { ask: ['Calculate the average payment period for ' + yr + '.'], answer: o.app, unit: 'days', dp: 1, traps: [{ v: o.avgAP / (o.totalCogs * (1 - d.cashPurch[i]) / 365), why: 'Purchases = COGS + change in inventory.' }, { v: o.avgAP / (o.purch / 365), why: 'Exclude cash purchases.' }],
            steps: [step('Purchases = COGS + Δinventory = ' + C(o.totalCogs) + ' + (' + C(o.inv) + ' − ' + C(opInv) + ')', o.purch, 'cur', 'inventory roll-forward'), step('Credit purchases = × ' + F.num((1 - d.cashPurch[i]) * 100) + '%', o.creditPurch, 'cur', 'exclude cash purchases'), step('Average A/P = (' + C(opAP) + ' + ' + C(o.tp) + ') / 2', o.avgAP, 'cur', 'opening + closing'), step('APP = avg A/P / (credit purchases / 365)', o.app, 'days', 'formula sheet', 1)] },
          { ask: ['What is the cash conversion cycle in ' + yr + '?'], answer: o.ccc, unit: 'days', dp: 1, traps: [{ v: o.aai + o.acp + o.app, why: 'Subtract the payment period.' }], steps: [step('CCC = AAI + ACP − APP', o.ccc, 'days', 'parts above', 1)] },
          { kind: 'choice', ask: ['Working capital went from ' + C(wc0) + ' (2025) to ' + C(wc1) + ' (2026). The ' + (wc1 > wc0 ? 'increase' : 'decrease') + ' is…'], choices: [wc1 > wc0 ? 'a cash outflow (more cash tied up in net current assets)' : 'a cash inflow (less cash tied up)', wc1 > wc0 ? 'a cash inflow' : 'a cash outflow', 'not related to cash', 'only relevant for the income statement'], correctChoice: 0, why: 'More net current assets = more cash tied up = outflow (and vice versa).' }
        ]
      };
    }
  });

  /* ---------------- case: funding options (week 4) ---------------- */
  function fundCalc(f) {
    if (f.kind === 'discount') { var rp = f.rate / (100 - f.rate); return { rp: rp, ear: FSM.calc.ear(rp, f.days), txt: 'Discount loan at ' + f.rate + '% for ' + f.days + ' days (interest deducted up front)', how: f.rate + '/(100 − ' + f.rate + ')', days: f.days }; }
    if (f.kind === 'simple') { var rs = f.rate / 100 * f.days / 365; return { rp: rs, ear: FSM.calc.ear(rs, f.days), txt: 'Regular loan at ' + f.rate + '% p.a. simple interest for ' + f.days + ' days', how: f.rate + '% × ' + f.days + '/365', days: f.days }; }
    if (f.kind === 'monthly') { var m = f.rate / 100 / 12; return { rp: Math.pow(1 + m, 12) - 1, ear: Math.pow(1 + m, 12) - 1, txt: 'Nominal ' + F.num(f.rate, 1) + '% p.a., compounded monthly, 12 months', how: '(1 + ' + F.num(f.rate, 1) + '%/12)^12 − 1', days: 365 }; }
    var x = FSM.calc.discountCost(f.cd, f.y, f.z); return { rp: x.rp, ear: x.exact, txt: 'Invoice with terms ' + f.cd + '/' + f.y + ', net/' + f.z, how: f.cd + '/(100 − ' + f.cd + '), N = ' + x.N, days: x.N };
  }
  FSM.addSkill({
    id: 'fin_case_funding', topic: 'fin_case', title: 'Case W4: five short-term funding options',
    formula: 'r_p per option → EAR = (1 + r_p)^(365/days) − 1',
    build: function (r, c) {
      c.setCur('EUR');
      var cs = getCase(r), d = cs.d;
      var fs = d.funding.map(function (f) { var x = fundCalc(f); x.name = f.name; return x; });
      var picks = r.sample([0, 1, 2, 3, 4], 2);
      var best = fs.reduce(function (b, f, i) { return f.ear < fs[b].ear ? i : b; }, 0);
      var parts = [];
      picks.forEach(function (k) {
        var f = fs[k];
        if (d.funding[k].kind !== 'monthly') parts.push({ ask: ['Cost of the ' + f.name + ' option for its own period (in %)?', 'What does the ' + f.name + ' option cost for its period?'], answer: f.rp, unit: 'pct', dp: 2, traps: [{ v: (d.funding[k].rate || d.funding[k].cd) / 100, why: d.funding[k].kind === 'simple' ? 'Scale the p.a. rate to the number of days.' : 'Use rate/(100 − rate).' }], steps: [step('r_p = ' + f.how, f.rp, 'pct', 'terms', 4)] });
        parts.push({ ask: ['Exact effective annual rate of the ' + f.name + ' option?', 'EAR of ' + f.name + '?'], answer: f.ear, unit: 'pct', dp: 2, traps: [{ v: f.rp * 365 / f.days, why: 'That is the approximate rate without compounding.' }], steps: d.funding[k].kind === 'monthly' ? [step('EAR = ' + f.how, f.ear, 'pct', 'compounding 12×', 2)] : [step('r_p = ' + f.how, f.rp, 'pct', 'terms', 4), step('EAR = (1 + r_p)^(365/' + f.days + ') − 1', f.ear, 'pct', 'formula sheet', 2)] });
      });
      var names = fs.map(function (f) { return f.name; });
      parts.push({ kind: 'choice', ask: ['Which option has the lowest effective annual rate?'], choices: [names[best]].concat(names.filter(function (_, i) { return i !== best; }).slice(0, 3)), correctChoice: 0, why: fs.map(function (f) { return f.name + ': ' + h.p(f.ear); }).join('<br>') });
      parts.push({ kind: 'open', ask: ['The company needs the money for about 3 months. Which option would you advise, and why?'],
        model: 'Compare the options on the same basis (EAR) and check whether the period fits 3 months. Lowest EAR: ' + names[best] + ' (' + h.p(fs[best].ear) + '). Supplier options only give money for N days (' + fs[3].days + ' and ' + fs[4].days + ' days); the 12-month facility gives money longer than needed; loans with periods close to 90 days match best. Avoid very expensive options such as forgoing a discount with a short N (' + names[4] + ' ≈ ' + h.p(fs[4].ear) + ').',
        points: ['Uses EAR to compare (not the quoted rates)', 'Checks whether each option\'s period matches the 3-month need', 'Names the cheapest suitable option', 'Notes that skipping a discount with a short N is very expensive'] });
      return { intro: [header(cs) + cs.name + ' needs €1,000,000 of short-term funds. Five options (365-day year):'],
        facts: fs.map(function (f) { return fact(f.name, 0, 'cur', '• ' + f.name + ': ' + f.txt + '.<br>'); }), layouts: ['sentence'], parts: parts };
    }
  });

  /* ---------------- case: leverage & WACC (week 5) ---------------- */
  FSM.addSkill({
    id: 'fin_case_leverage', topic: 'fin_case', title: 'Case W5: DOL, DFL, DTL and WACC',
    formula: 'DOL = CM/EBIT · DFL = EBIT/(EBT − PD/(1−T)) · WACC with book weights',
    build: function (r, c) {
      c.setCur('EUR');
      var cs = getCase(r), d = cs.d, i = r.int(0, 1), o = cs.y[i], yr = 2025 + i, C = c.C;
      var pdg = d.pd / (1 - d.T);
      var parts = [
        { ask: ['DOL for ' + yr + '?'], answer: o.dol, unit: 'x', dp: 2, traps: [{ v: o.rev / o.ebit, why: 'Use contribution margin, not revenue.' }], steps: [step('DOL = CM / EBIT = ' + C(o.cm) + ' / ' + C(o.ebit), o.dol, 'x', 'income statement', 2)] },
        { ask: ['DFL for ' + yr + '?'], answer: o.dfl, unit: 'x', dp: 2, traps: [{ v: o.ebit / o.ebt, why: 'There are preferred dividends: subtract PD/(1 − T) from EBT.' }, { v: o.ebit / (o.ebt - d.pd), why: 'Gross up the preferred dividend: PD/(1 − T).' }],
          steps: [step('PD/(1 − T) = ' + C(d.pd) + ' / 0.75', pdg, 'cur', 'tax rate 25%'), step('DFL = ' + C(o.ebit) + ' / (' + C(o.ebt) + ' − ' + C(pdg) + ')', o.dfl, 'x', 'formula sheet', 2)] },
        { ask: ['DTL for ' + yr + '?'], answer: o.dtl, unit: 'x', dp: 2, traps: [{ v: o.dol + o.dfl, why: 'Multiply DOL × DFL.' }], steps: [step('DTL = DOL × DFL', o.dtl, 'x', 'formula sheet', 2)] },
        { ask: ['WACC for ' + yr + ' (ignore interest-bearing short-term liabilities; use book values)?'], answer: o.w.wacc, unit: 'pct', dp: 2,
          traps: [{ v: o.w.wd * o.rd + o.w.wp * d.rp[i] + o.w.ws * d.rs[i], why: 'Apply (1 − T) to the cost of debt.' }, { v: FSM.calc.wacc({ d: o.ltd, p: d.pref, s: o.te, rd: o.rd, rp: d.rp[i], rs: d.rs[i], T: d.T }).wacc, why: 'Common equity excludes the preferred share capital.' }],
          steps: [step('r_d = interest on LT loans / LT loans = ' + C(d.ltInterest[i]) + ' / ' + C(o.ltd), o.rd, 'pct', 'notes on interest', 2), step('Common equity = total equity − preferred = ' + C(o.te) + ' − ' + C(d.pref), o.ce, 'cur', 'balance sheet'), step('w_d = ' + C(o.ltd) + ' / (' + C(o.ltd) + ' + ' + C(d.pref) + ' + ' + C(o.ce) + ')', o.w.wd, 'pct', 'book weights', 2), step('w_p', o.w.wp, 'pct', 'book weights', 2), step('w_s', o.w.ws, 'pct', 'book weights', 2), step('WACC = w_d × r_d × 0.75 + w_p × ' + h.p(d.rp[i], 1) + ' + w_s × ' + h.p(d.rs[i], 1), o.w.wacc, 'pct', 'formula sheet', 2)] }
      ];
      return { intro: [header(cs) + 'Use the statements of ' + cs.name + ' Tax rate 25%; preferred dividends ' + C(d.pd) + ' per year. Interest on long-term loans: ' + C(d.ltInterest[0]) + ' (2025), ' + C(d.ltInterest[1]) + ' (2026). Required returns: preferred ' + h.p(d.rp[0], 1) + ' / ' + h.p(d.rp[1], 1) + ', common ' + h.p(d.rs[0], 1) + ' / ' + h.p(d.rs[1], 1) + ' (2025 / 2026).'],
        statement: mergeStatements(isStatement(cs), bsStatement(cs)), facts: [], layouts: ['statement'], parts: r.chance(0.5) ? parts : r.sample(parts, 2) };
    }
  });

  /* ---------------- case: acquisition (week 6) ---------------- */
  FSM.addSkill({
    id: 'fin_case_consolidation', topic: 'fin_case', title: 'Case W6: acquisition & consolidated balance sheet',
    formula: 'Goodwill = price − subsidiary equity − asset uplift',
    build: function (r, c) {
      c.setCur('EUR');
      var cs = getCase(r), d = cs.d, s = d.sub, o = cs.y[1], C = c.C;
      var price = d.dealPrice || BASE.deal, loan = d.loan, own = price - loan;
      var subCA = s.cash + s.ar + s.inv, subTA = subCA + s.ppe, subCL = s.tp + s.stb, subEq = subTA - subCL - s.ltd;
      var P = { ca: o.ca + loan, ppe: o.ppe, ip: o.intang, cl: o.cl, ncl: o.ltd + loan, cs: d.pref + d.common, re: o.re };
      var S = { ca: subCA, ppe: s.ppe, cl: subCL, ncl: s.ltd, cs: subEq, re: 0 };
      var x = FSM.calc.consolidate(P, S, price, 'cash', 1);
      var up = d.uplift;
      var y = FSM.calc.consolidate(P, S, price, 'cash', (s.ppe + up) / s.ppe);
      var parts = [
        { ask: ['What is the excess of cost over book value (goodwill if book = market value)?'], answer: x.excess, unit: 'cur', traps: [{ v: price - subTA, why: 'Compare with the subsidiary\'s EQUITY, not its total assets.' }], steps: [step('Equity of ' + cs.target + ' = ' + C(subTA) + ' − ' + C(subCL) + ' − ' + C(s.ltd), subEq, 'cur', 'assets − liabilities'), step('Excess = ' + C(price) + ' − ' + C(subEq), x.excess, 'cur', 'price − equity')] },
        { ask: ['Total assets on the consolidated balance sheet after the purchase?'], answer: x.cons.ta, unit: 'cur', traps: [{ v: x.cons.ta + price, why: 'Eliminate the investment in the subsidiary.' }, { v: o.ta + subTA, why: 'Account for the financing (cash paid, new loan) and the goodwill.' }],
          steps: [step('Parent total assets 2026', o.ta, 'cur', 'balance sheet'), step('+ new loan cash ' + C(loan) + ', − cash paid ' + C(price) + ', + investment ' + C(price), o.ta + loan, 'cur', 'parent after purchase'), step('+ subsidiary total assets', subTA, 'cur', 'subsidiary balance sheet'), step('− investment (eliminated)', price, 'cur', 'consolidation'), step('+ goodwill', x.goodwill, 'cur', 'excess'), step('Consolidated total assets', x.cons.ta, 'cur', 'result')],
          method: ['Record the purchase on the parent (investment, cash paid, new loan)', 'Add parent and subsidiary balance sheets', 'Eliminate the investment against the subsidiary\'s equity', 'Add goodwill for the excess'] },
        { ask: ['Consolidated non-current liabilities?'], answer: x.cons.ncl, unit: 'cur', traps: [{ v: o.ltd + s.ltd, why: 'Include the new acquisition loan.' }], steps: [step('Parent LT loans + new loan = ' + C(o.ltd) + ' + ' + C(loan), o.ltd + loan, 'cur', 'financing'), step('+ subsidiary LT debt', s.ltd, 'cur', 'subsidiary'), step('Total', x.cons.ncl, 'cur', 'sum')] },
        { ask: ['Suppose the market value of ' + cs.target + '\'s PP&E is ' + C(up) + ' above book value. What is goodwill now?'], answer: y.goodwill, unit: 'cur', traps: [{ v: x.goodwill, why: 'Part of the excess is assigned to PP&E first.' }, { v: x.goodwill + up, why: 'The uplift REDUCES goodwill.' }], steps: [step('Excess of cost', x.excess, 'cur', 'previous part'), step('− PP&E uplift', up, 'cur', 'market − book'), step('Goodwill', y.goodwill, 'cur', 'remainder')] }
      ];
      return { intro: [header(cs) + cs.name + ' buys 100% of ' + cs.target + ' on 31 Dec 2026 for ' + C(price) + ' in cash: ' + C(loan) + ' from a new long-term loan and ' + C(own) + ' from its own cash. Balance sheet of ' + cs.target + ': cash ' + C(s.cash) + ', receivables ' + C(s.ar) + ', inventories ' + C(s.inv) + ', PP&E ' + C(s.ppe) + '; trade payables ' + C(s.tp) + ', short-term borrowings ' + C(s.stb) + ', long-term debt ' + C(s.ltd) + '. ' + cs.name + '\'s 2026 balance sheet:'],
        statement: bsStatement(cs), facts: [], layouts: ['statement'], parts: r.chance(0.5) ? parts : r.sample(parts, 3) };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
