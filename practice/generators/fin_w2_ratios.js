/* Finance Week 2 — Financial statements & ratio analysis (Ch. 3, no DuPont) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;

  FSM.addTopic({ id: 'fin_w2', area: 'Finance', week: 2, title: 'Financial statements & ratios', read: 'Zutter & Smart Ch. 3 (except DuPont)' });

  /* ---------------- build an income statement ---------------- */
  FSM.addSkill({
    id: 'fin_w2_income_statement', topic: 'fin_w2', title: 'Build an income statement, EPS & retained earnings',
    formula: 'Sales − COGS = GP; − operating expenses = EBIT; − interest = EBT; − tax = net income',
    build: function (r, c) {
      var u = 1e6;
      var sales = r.range(50, 900, 1), cogs = h.r0(sales * r.range(0.5, 0.8, 0.01));
      var ga = h.r0(sales * r.range(0.03, 0.08, 0.01)), selling = h.r0(sales * r.range(0.02, 0.06, 0.01)), lease = r.int(1, 10), dep = h.r0(sales * r.range(0.02, 0.08, 0.01));
      var interest = r.int(1, 15);
      var T = r.pick([0.21, 0.25, 0.3]);
      var gp = sales - cogs, opex = ga + selling + lease + dep, ebit = gp - opex, ebt = ebit - interest, tax = ebt * T, ni = ebt - tax;
      var shares = r.range(1, 20, 0.25), dps = r.range(0.2, 2, 0.05);
      var pd = r.chance(0.35) ? r.range(0.5, 3, 0.5) : 0;
      var eacs = ni - pd, eps = eacs / shares, addRE = ni - pd - dps * shares;
      var accts = [['Depreciation', dep], ['General and administrative expenses', ga], ['Sales', sales], ['Selling expenses', selling], ['Cost of goods sold', cogs], ['Lease expense', lease], ['Interest expense', interest]];
      var C = function (v) { return c.C(v * u); };
      var M = function (v) { return v * u; };
      var which = r.pick(['gp', 'ebit', 'ni', 'eps', 'addre']);
      var parts = [];
      var base = [step('Gross profit = sales − COGS = ' + C(sales) + ' − ' + C(cogs), M(gp), 'cur', 'list'), step('Operating expenses = G&A + selling + lease + depreciation', M(opex), 'cur', 'list'), step('Operating profit (EBIT) = GP − operating expenses', M(ebit), 'cur', 'above'), step('EBT = EBIT − interest', M(ebt), 'cur', 'interest from list'), step('Tax = EBT × ' + F.num(T * 100) + '%', M(tax), 'cur', 'tax rate'), step('Net income = EBT − tax', M(ni), 'cur', 'above')];
      if (which === 'gp' || which === 'ebit') parts.push({ ask: ['What is operating profit (EBIT)?', 'Calculate operating profit.'], answer: M(ebit), unit: 'cur', traps: [{ v: M(ebit - interest), why: 'Interest is a financing cost below operating profit.' }, { v: M(gp - ga - selling - lease), why: 'Depreciation is an operating expense too.' }], steps: base.slice(0, 3) });
      if (which !== 'ebit') parts.push({ ask: ['What is net profit after taxes?', 'Calculate net income.'], answer: M(ni), unit: 'cur', traps: [{ v: M(ebit * (1 - T)), why: 'Deduct interest before calculating tax.' }, { v: M(ebt), why: 'Deduct taxes.' }], steps: base,
        method: ['Sales − COGS = gross profit', 'Gross profit − operating expenses = operating profit', 'Operating profit − interest = profit before tax', 'Profit before tax − tax = net income'] });
      if (which === 'eps' || which === 'addre') parts.push({ ask: ['What is EPS?', 'Calculate earnings per share.'], answer: eacs / shares, unit: 'cur', dp: 2, traps: pd ? [{ v: ni / shares, why: 'EPS uses earnings available for COMMON stockholders: deduct preferred dividends.' }] : [{ v: dps, why: 'EPS is earnings per share, not dividends per share.' }],
        steps: [step('Net income', M(ni), 'cur', 'statement'), step('EACS = net income − preferred dividends (' + c.C(M(pd)) + ')', M(eacs), 'cur', 'formula sheet'), step('EPS = EACS / ' + F.num(shares, 2) + 'm shares', eps, 'cur', 'formula sheet', 2)] });
      if (which === 'addre') parts.push({ ask: ['What is the addition to retained earnings?', 'How much is added to retained earnings this year?'], answer: M(addRE), unit: 'cur', traps: [{ v: M(ni), why: 'Subtract the dividends paid.' }, { v: M(ni - dps * shares), why: pd ? 'Preferred dividends are paid too.' : 'Check the dividends.' }].filter(function (t) { return Math.abs(t.v - M(addRE)) > 1; }),
        steps: [step('Common dividends = ' + c.C(dps, 2) + ' × ' + F.num(shares, 2) + 'm shares', M(dps * shares), 'cur', 'DPS × shares'), step('Addition to RE = net income − preferred − common dividends', M(addRE), 'cur', 'what is kept')] });
      return {
        intro: ['A list of accounts for ' + c.company + ' (amounts in millions) is given below. Arrange them into an income statement.', 'Your manager gives you these accounts of ' + c.company + ' (in millions):'],
        statement: { title: 'Accounts (unsorted)', cols: [''], rows: r.shuffle(accts).map(function (a) { return { label: a[0], v: [M(a[1])] }; }) },
        facts: [fact('Tax rate', T, 'pct', 'The tax rate is ' + F.num(T * 100) + '%. The company has ' + F.num(shares, 2) + ' million common shares and pays a dividend of ' + c.C(dps, 2) + ' per share' + (pd ? '; preferred dividends are ' + C(pd) : '') + '.', { alsoInText: true, dp: 0 })],
        layouts: ['statement'], parts: parts
      };
    }
  });

  /* ---------------- statement of retained earnings ---------------- */
  FSM.addSkill({
    id: 'fin_w2_retained_earnings', topic: 'fin_w2', title: 'Statement of retained earnings',
    formula: 'Ending RE = beginning RE + net income − preferred dividends − common dividends',
    build: function (r, c) {
      var beg = r.range(5, 120, 0.05), ni = r.range(1, 20, 0.01);
      var pdPer = r.range(0.1, 0.5, 0.01), pdN = r.pick([1, 2, 4]), pShares = r.range(0.5, 5, 0.25);
      var cdPer = r.range(0.1, 0.6, 0.01), cdN = r.pick([1, 2, 4]), cShares = r.range(2, 15, 0.1);
      var pdv = pdPer * pdN * pShares, cdv = cdPer * cdN * cShares, end = beg + ni - pdv - cdv;
      var freq = function (n) { return n === 1 ? 'one annual' : n === 2 ? 'two semi-annual' : 'four quarterly'; };
      var M = function (v) { return v * 1e6; };
      return {
        intro: [c.company + ' started the year with retained earnings of ' + c.C(M(beg)) + '.'],
        facts: [fact('Preferred', pdPer, 'cur', 'It paid ' + freq(pdN) + ' dividend' + (pdN > 1 ? 's' : '') + ' of ' + c.C(pdPer, 2) + ' per share to ' + F.num(pShares, 2) + ' million preferred shares.'),
          fact('Common', cdPer, 'cur', 'Common stockholders, holding ' + F.num(cShares, 1) + ' million shares, received ' + freq(cdN) + ' dividend' + (cdN > 1 ? 's' : '') + ' of ' + c.C(cdPer, 2) + ' per share.'),
          fact('Net income', ni, 'cur', 'Net profit after taxes was ' + c.C(M(ni)) + '.')],
        layouts: ['sentence', 'case'],
        noise: [fact('x', 0, 'cur', 'Total assets were ' + c.C(M(r.range(50, 500, 1))) + '.')],
        parts: [{ ask: ['What is the ending balance of retained earnings?', 'Prepare the statement of retained earnings: what is the closing balance?'], answer: M(end), unit: 'cur',
          traps: [{ v: M(beg + ni - pdPer * pShares - cdPer * cShares), why: 'Multiply by the number of payments in the year (semi-annual = 2, quarterly = 4).' }, { v: M(beg + ni - cdv), why: 'Preferred dividends are also paid out of retained earnings.' }, { v: M(beg + ni), why: 'Subtract the dividends.' }].filter(function (t) { return Math.abs(t.v - M(end)) > 1; }),
          steps: [step('Beginning RE', M(beg), 'cur', 'given'), step('+ net income', M(ni), 'cur', 'given'), step('− preferred dividends = ' + pdN + ' × ' + c.C(pdPer, 2) + ' × ' + F.num(pShares, 2) + 'm', M(pdv), 'cur', 'payments × DPS × shares'), step('− common dividends = ' + cdN + ' × ' + c.C(cdPer, 2) + ' × ' + F.num(cShares, 1) + 'm', M(cdv), 'cur', 'payments × DPS × shares'), step('Ending RE', M(end), 'cur', 'result')],
          method: ['Start with beginning retained earnings', 'Add net income', 'Subtract preferred dividends', 'Subtract common dividends'] }]
      };
    }
  });

  /* ---------------- ratios from statements ---------------- */
  function makeCompany(r) {
    var sales = r.range(2, 60, 0.1) * 1e6;
    var cogs = h.r0(sales * r.range(0.45, 0.75, 0.01) / 1e3) * 1e3;
    var opex = h.r0(sales * r.range(0.08, 0.2, 0.01) / 1e3) * 1e3;
    var ebit = sales - cogs - opex;
    var interest = h.r0(ebit * r.range(0.05, 0.3, 0.01) / 1e3) * 1e3;
    var T = r.pick([0.21, 0.25, 0.3]);
    var ebt = ebit - interest, tax = h.r0(ebt * T), ni = ebt - tax;
    var pd = r.chance(0.5) ? h.r0(ni * r.range(0.03, 0.1, 0.01) / 1e3) * 1e3 : 0;
    var inv0 = h.r0(cogs * r.range(0.1, 0.3, 0.01) / 1e3) * 1e3, inv1 = h.r0(inv0 * r.range(0.85, 1.25, 0.01) / 1e3) * 1e3;
    var ar = h.r0(sales * r.range(0.06, 0.2, 0.01) / 1e3) * 1e3, cash = h.r0(sales * r.range(0.02, 0.1, 0.01) / 1e3) * 1e3;
    var ca = cash + ar + inv1;
    var nca = h.r0(sales * r.range(0.3, 1.2, 0.01) / 1e3) * 1e3;
    var ta = ca + nca;
    var cl = h.r0(ca * r.range(0.35, 0.8, 0.01) / 1e3) * 1e3;
    var ltd = h.r0(ta * r.range(0.1, 0.35, 0.01) / 1e3) * 1e3;
    var pref = pd ? h.r0(pd * r.range(10, 14, 1) / 1e3) * 1e3 : 0;
    var ce = ta - cl - ltd - pref;
    var shares = r.range(0.2, 10, 0.05) * 1e6;
    var price = h.r2((ni - pd) / shares * r.range(6, 25, 0.5));
    return { sales: sales, cogs: cogs, opex: opex, ebit: ebit, interest: interest, ebt: ebt, tax: tax, ni: ni, pd: pd, eacs: ni - pd, inv0: inv0, inv1: inv1, ar: ar, cash: cash, ca: ca, nca: nca, ta: ta, cl: cl, ltd: ltd, pref: pref, ce: ce, shares: shares, price: price, tl: cl + ltd, gp: sales - cogs };
  }
  var RATIOS = [
    { n: 'current ratio', f: function (x) { return x.ca / x.cl; }, u: 'x', how: function (x, C) { return 'Current assets / current liabilities = ' + C(x.ca) + ' / ' + C(x.cl); }, trap: function (x) { return [{ v: (x.ca - x.inv1) / x.cl, why: 'That is the quick ratio (inventory excluded).' }]; } },
    { n: 'quick ratio', f: function (x) { return (x.ca - x.inv1) / x.cl; }, u: 'x', how: function (x, C) { return '(CA − inventory) / CL = (' + C(x.ca) + ' − ' + C(x.inv1) + ') / ' + C(x.cl); }, trap: function (x) { return [{ v: x.ca / x.cl, why: 'Exclude inventory for the quick ratio.' }]; } },
    { n: 'inventory turnover', f: function (x) { return x.cogs / ((x.inv0 + x.inv1) / 2); }, u: 'x', how: function (x, C) { return 'COGS / average inventory = ' + C(x.cogs) + ' / ((' + C(x.inv0) + ' + ' + C(x.inv1) + ') / 2)'; }, trap: function (x) { return [{ v: x.cogs / x.inv1, why: 'Use AVERAGE inventory (opening + closing) / 2.' }, { v: x.sales / ((x.inv0 + x.inv1) / 2), why: 'Use COGS, not sales.' }]; } },
    { n: 'average collection period (days, all sales on credit)', f: function (x) { return x.ar / (x.sales / 365); }, u: 'days', dp: 1, how: function (x, C) { return 'A/R / (sales / 365) = ' + C(x.ar) + ' / (' + C(x.sales) + ' / 365)'; }, trap: function (x) { return [{ v: x.ar / (x.sales / 360), why: 'Use 365 days.' }, { v: x.ar / (x.cogs / 365), why: 'Receivables relate to sales, not COGS.' }]; } },
    { n: 'total asset turnover', f: function (x) { return x.sales / x.ta; }, u: 'x', how: function (x, C) { return 'Sales / total assets = ' + C(x.sales) + ' / ' + C(x.ta); }, trap: function (x) { return [{ v: x.ta / x.sales, why: 'Sales divided by assets, not the other way around.' }]; } },
    { n: 'debt ratio', f: function (x) { return x.tl / x.ta; }, u: 'pct', dp: 2, how: function (x, C) { return 'Total liabilities / total assets = ' + C(x.tl) + ' / ' + C(x.ta); }, trap: function (x) { return [{ v: x.ltd / x.ta, why: 'Total liabilities include current liabilities.' }, { v: x.tl / x.ce, why: 'That is debt-to-equity.' }]; } },
    { n: 'debt-to-equity ratio', f: function (x) { return x.tl / x.ce; }, u: 'x', how: function (x, C) { return 'Total liabilities / common stock equity = ' + C(x.tl) + ' / ' + C(x.ce); }, trap: function (x) { return [{ v: x.tl / (x.ce + x.pref), why: 'Use COMMON stock equity (exclude preferred stock).' }, { v: x.tl / x.ta, why: 'That is the debt ratio.' }]; } },
    { n: 'times interest earned', f: function (x) { return x.ebit / x.interest; }, u: 'x', how: function (x, C) { return 'EBIT / interest = ' + C(x.ebit) + ' / ' + C(x.interest); }, trap: function (x) { return [{ v: x.ebt / x.interest, why: 'Use EBIT (before interest).' }]; } },
    { n: 'gross profit margin', f: function (x) { return x.gp / x.sales; }, u: 'pct', dp: 2, how: function (x, C) { return 'Gross profit / sales = ' + C(x.gp) + ' / ' + C(x.sales); }, trap: function (x) { return [{ v: x.ebit / x.sales, why: 'That is the operating margin.' }]; } },
    { n: 'operating profit margin', f: function (x) { return x.ebit / x.sales; }, u: 'pct', dp: 2, how: function (x, C) { return 'Operating profit / sales = ' + C(x.ebit) + ' / ' + C(x.sales); }, trap: function (x) { return [{ v: x.gp / x.sales, why: 'Deduct operating expenses.' }]; } },
    { n: 'net profit margin', f: function (x) { return x.eacs / x.sales; }, u: 'pct', dp: 2, how: function (x, C) { return 'EACS / sales = ' + C(x.eacs) + ' / ' + C(x.sales); }, trap: function (x) { return x.pd ? [{ v: x.ni / x.sales, why: 'Use earnings available for COMMON stockholders (net income − preferred dividends).' }] : [{ v: x.ebt / x.sales, why: 'Use profit after tax.' }]; } },
    { n: 'EPS', f: function (x) { return x.eacs / x.shares; }, u: 'cur', dp: 2, how: function (x, C) { return 'EACS / common shares = ' + C(x.eacs) + ' / ' + F.num(x.shares); }, trap: function (x) { return x.pd ? [{ v: x.ni / x.shares, why: 'Deduct preferred dividends first.' }] : []; } },
    { n: 'return on assets (ROA)', f: function (x) { return x.eacs / x.ta; }, u: 'pct', dp: 2, how: function (x, C) { return 'EACS / total assets = ' + C(x.eacs) + ' / ' + C(x.ta); }, trap: function (x) { return [{ v: x.eacs / x.ce, why: 'That is ROE.' }]; } },
    { n: 'return on equity (ROE)', f: function (x) { return x.eacs / x.ce; }, u: 'pct', dp: 2, how: function (x, C) { return 'EACS / common stock equity = ' + C(x.eacs) + ' / ' + C(x.ce); }, trap: function (x) { return [{ v: x.ni / (x.ce + x.pref), why: 'Use EACS and COMMON equity (exclude preferred).' }, { v: x.eacs / x.ta, why: 'That is ROA.' }]; } },
    { n: 'P/E ratio', f: function (x) { return x.price / (x.eacs / x.shares); }, u: 'x', how: function (x, C) { return 'Price / EPS = ' + C(x.price, 2) + ' / ' + C(x.eacs / x.shares, 2); }, trap: function (x) { return [{ v: (x.eacs / x.shares) / x.price, why: 'Price divided by EPS.' }]; } },
    { n: 'market-to-book ratio', f: function (x) { return x.price / (x.ce / x.shares); }, u: 'x', how: function (x, C) { return 'Price / book value per share = ' + C(x.price, 2) + ' / (' + C(x.ce) + ' / ' + F.num(x.shares) + ')'; }, trap: function (x) { return [{ v: x.price / ((x.ce + x.pref) / x.shares), why: 'Book value per share uses COMMON equity only.' }]; } }
  ];
  FSM.addSkill({
    id: 'fin_w2_ratios', topic: 'fin_w2', title: 'Ratio analysis from the statements',
    formula: 'See the Ratios section of the formula sheet',
    build: function (r, c) {
      var x = makeCompany(r);
      var C = c.C;
      var picks = r.sample(RATIOS, r.int(2, 4));
      var rows = [{ head: 'Income statement' }, { label: 'Sales', v: [x.sales] }, { label: 'Cost of goods sold', v: [x.cogs] }, { label: 'Gross profit', v: [x.gp], total: true }, { label: 'Operating expenses', v: [x.opex] }, { label: 'Operating profit (EBIT)', v: [x.ebit], total: true }, { label: 'Interest expense', v: [x.interest] }, { label: 'Profit before tax', v: [x.ebt], total: true }, { label: 'Taxes', v: [x.tax] }, { label: 'Net profit after taxes', v: [x.ni], total: true }, { label: 'Preferred dividends', v: [x.pd] },
        { head: 'Balance sheet (year end)' }, { label: 'Cash', v: [x.cash] }, { label: 'Accounts receivable', v: [x.ar] }, { label: 'Inventory (opening: ' + C(x.inv0) + ')', v: [x.inv1] }, { label: 'Total current assets', v: [x.ca], total: true }, { label: 'Net fixed assets', v: [x.nca] }, { label: 'Total assets', v: [x.ta], total: true }, { label: 'Current liabilities', v: [x.cl] }, { label: 'Long-term debt', v: [x.ltd] }, { label: 'Preferred stock', v: [x.pref] }, { label: 'Common stock equity', v: [x.ce] }, { label: 'Total liabilities & equity', v: [x.ta], total: true }];
      return {
        intro: ['Financial statements of ' + c.company + ' (' + c.industry + '):', 'Use the statements of ' + c.company + ' below.'],
        statement: { title: c.company, cols: [''], rows: rows },
        facts: [fact('Shares & price', x.shares, 'num', 'There are ' + F.num(x.shares) + ' common shares outstanding; the market price is ' + C(x.price, 2) + ' per share.', { alsoInText: true })],
        layouts: ['statement'],
        parts: picks.map(function (p) {
          var v = p.f(x);
          return { ask: ['Calculate the ' + p.n + '.', 'What is the ' + p.n + '?'], answer: v, unit: p.u, dp: p.dp || (p.u === 'x' ? 2 : undefined),
            traps: p.trap(x).filter(function (t) { return Math.abs(t.v - v) > Math.abs(v) * 0.01; }),
            steps: (p.n.indexOf('EACS') >= 0 || /net profit|EPS|ROA|ROE|P\/E/.test(p.n) ? [step('EACS = net profit − preferred dividends = ' + C(x.ni) + ' − ' + C(x.pd), x.eacs, 'cur', 'statement')] : []).concat([step(p.how(x, C), v, p.u, 'formula sheet', p.dp || 2)]) };
        })
      };
    }
  });

  /* ---------------- reverse ratios (McDougal) ---------------- */
  FSM.addSkill({
    id: 'fin_w2_reverse_ratios', topic: 'fin_w2', title: 'Reverse ratios: rebuild the statements',
    formula: 'Rearrange each ratio formula to solve for the unknown',
    build: function (r, c) {
      var sales = r.range(5, 200, 1) * 1e6;
      var gpm = r.range(0.2, 0.8, 0.05), opm = h.r2(gpm * r.range(0.25, 0.6, 0.05)), npm = h.r2(opm * r.range(0.25, 0.6, 0.05)) || 0.01;
      var roa = h.r2(npm * r.range(1, 3, 0.25)), roe = h.r2(roa * r.range(1.2, 2, 0.1));
      var acp = r.range(20, 90, 0.1);
      var C = c.C;
      var items = [
        { q: 'gross profit', v: sales * gpm, st: [step('GP = sales × GPM = ' + C(sales) + ' × ' + h.p(gpm, 0), sales * gpm, 'cur', 'gross profit margin')], tr: [] },
        { q: 'cost of goods sold', v: sales * (1 - gpm), st: [step('GP = ' + C(sales) + ' × ' + h.p(gpm, 0), sales * gpm, 'cur', 'margin'), step('COGS = sales − GP', sales * (1 - gpm), 'cur', 'difference')], tr: [{ v: sales * gpm, why: 'That is gross profit; COGS = sales − GP.' }] },
        { q: 'operating expenses', v: sales * (gpm - opm), st: [step('GP = sales × GPM', sales * gpm, 'cur', 'margin'), step('Operating profit = sales × OPM', sales * opm, 'cur', 'margin'), step('Operating expenses = GP − operating profit', sales * (gpm - opm), 'cur', 'difference')], tr: [{ v: sales * opm, why: 'That is operating profit.' }] },
        { q: 'total assets', v: sales * npm / roa, st: [step('EACS = sales × NPM = ' + C(sales) + ' × ' + h.p(npm, 0), sales * npm, 'cur', 'net profit margin'), step('Total assets = EACS / ROA = ' + C(sales * npm) + ' / ' + h.p(roa, 0), sales * npm / roa, 'cur', 'ROA rearranged')], tr: [{ v: sales * npm * roa, why: 'Divide EACS by ROA.' }, { v: sales / roa, why: 'ROA uses earnings, not sales.' }] },
        { q: 'common stock equity', v: sales * npm / roe, st: [step('EACS = sales × NPM', sales * npm, 'cur', 'net profit margin'), step('Equity = EACS / ROE', sales * npm / roe, 'cur', 'ROE rearranged')], tr: [{ v: sales * npm / roa, why: 'That is total assets (ROA).' }] },
        { q: 'accounts receivable', v: acp * sales / 365, st: [step('Sales per day = ' + C(sales) + ' / 365', sales / 365, 'cur', 'all sales on credit'), step('A/R = ACP × sales per day = ' + F.num(acp, 1) + ' × ' + C(sales / 365), acp * sales / 365, 'cur', 'ACP rearranged')], tr: [{ v: sales / 365 / acp, why: 'A/R = ACP × daily sales.' }, { v: acp * sales / 360, why: 'Use 365 days.' }] }
      ];
      var picks = r.sample(items, r.int(2, 3));
      return {
        intro: [c.company + ' had sales of ' + C(sales) + ' last year. Some ratios are known:', 'Only the ratios of ' + c.company + ' survived a data loss (sales: ' + C(sales) + '):'],
        facts: [fact('Sales', sales, 'cur', ''), fact('Gross profit margin', gpm, 'pct', 'Gross profit margin ' + h.p(gpm, 0) + ',', { dp: 0 }), fact('Operating profit margin', opm, 'pct', 'operating profit margin ' + h.p(opm, 0) + ',', { dp: 0 }), fact('Net profit margin', npm, 'pct', 'net profit margin ' + h.p(npm, 0) + ',', { dp: 0 }), fact('Return on total assets', roa, 'pct', 'ROA ' + h.p(roa, 0) + ',', { dp: 0 }), fact('Return on common equity', roe, 'pct', 'ROE ' + h.p(roe, 0) + ',', { dp: 0 }), fact('Average collection period', acp, 'days', 'average collection period ' + F.num(acp, 1) + ' days (all sales on credit, 365 days).', { dp: 1 })],
        layouts: ['table', 'table', 'sentence'],
        parts: picks.map(function (it) { return { ask: ['Calculate ' + it.q + '.', 'What is the value of ' + it.q + '?'], answer: it.v, unit: 'cur', traps: it.tr, steps: it.st }; })
      };
    }
  });

  /* ---------------- concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w2_concepts', topic: 'fin_w2', title: 'Ratio categories & interpretation',
    items: [
      { term: 'Liquidity ratios', cat: 'cat', defs: ['Measure the ability to meet short-term obligations (current ratio, quick ratio).'] },
      { term: 'Activity ratios', cat: 'cat', defs: ['Measure how efficiently assets and operations are managed (turnover, collection and payment periods).'] },
      { term: 'Debt ratios', cat: 'cat', defs: ['Measure reliance on borrowed money and ability to carry it (debt ratio, D/E, times interest earned).'] },
      { term: 'Profitability ratios', cat: 'cat', defs: ['Measure earnings relative to sales, assets or equity (margins, ROA, ROE, EPS).'] },
      { term: 'Market ratios', cat: 'cat', defs: ['Show how investors value the company relative to earnings and book value (P/E, market-to-book).'] },
      { term: 'Earnings available for common stockholders', cat: 'x', defs: ['Net profit after taxes minus preferred dividends — the numerator of EPS, ROA, ROE and net profit margin.'] },
      { term: 'Common stock equity', cat: 'x', defs: ['Total equity minus preferred stock — used for ROE, D/E and book value per share.'] },
      { term: 'Cross-sectional analysis', cat: 'm', defs: ['Comparing different firms\' ratios at the same point in time, e.g. against competitors or the industry average.'] },
      { term: 'Benchmarking', cat: 'm', defs: ['Cross-sectional analysis against key competitors or firms you want to emulate.'] },
      { term: 'Time-series analysis', cat: 'm', defs: ['Evaluating a firm\'s ratios over time to spot trends.'] },
      { term: 'Combined analysis', cat: 'm', defs: ['Looking at the trend of a firm\'s ratio against the trend of the industry — the most informative approach.'] },
      { term: 'Income statement', cat: 'fs', defs: ['Summary of the firm\'s operating results over a period: revenue down to net income and EPS.'] },
      { term: 'Balance sheet', cat: 'fs', defs: ['Summary of the firm\'s financial position at a point in time: assets = liabilities + equity.'] },
      { term: 'Statement of cash flows', cat: 'fs', defs: ['Summary of operating, investment and financing cash flows, reconciled with the change in cash and marketable securities.'] },
      { term: 'Statement of stockholders\' equity', cat: 'fs', defs: ['Shows all equity-account transactions in a year; the statement of retained earnings is a short form of it.'] },
      { term: 'Notes to the financial statements', cat: 'fs', defs: ['Explanations of accounting policies, calculations and transactions behind the numbers (revenue recognition, debt and lease terms, contingencies).'] },
      { term: 'GAAP', cat: 'rule', defs: ['Generally accepted accounting principles: the US rules for preparing financial statements, set by the FASB.'] },
      { term: 'IFRS', cat: 'rule', defs: ['International Financial Reporting Standards, set by the IASB and required in 90+ countries.'] },
      { term: 'PCAOB', cat: 'rule', defs: ['Board created by Sarbanes-Oxley to oversee the auditors of public companies.'] },
      { term: 'Form 10-K', cat: 'rule', defs: ['Annual report filed with the SEC containing audited financial statements in full detail; 10-Q is the quarterly version.'] },
      { term: 'Retained earnings', cat: 'fs', defs: ['Cumulative earnings kept and reinvested since the start (net of dividends) — not a pile of cash.'] },
      { term: 'Paid-in capital in excess of par', cat: 'fs', defs: ['What investors paid for shares above their (arbitrary) par value when the stock was first sold.'] },
      { term: 'Current rate (translation) method', cat: 'rule', defs: ['Translating a foreign subsidiary\'s assets and liabilities at the year-end exchange rate (equity at the historical rate) for consolidation.'] }
    ],
    groups: {
      'Liquidity ratios': ['Current ratio', 'Quick ratio'],
      'Activity ratios': ['Inventory turnover', 'Average collection period', 'Average payment period', 'Total asset turnover'],
      'Debt ratios': ['Debt ratio', 'Debt-to-equity ratio', 'Times interest earned'],
      'Profitability ratios': ['Gross profit margin', 'Operating profit margin', 'Net profit margin', 'EPS', 'ROA', 'ROE'],
      'Market ratios': ['P/E ratio', 'Market-to-book ratio']
    },
    scenarios: [
      { q: ['An apartment owner has a current ratio of 1.3, a manufacturer 4.2. Why can the landlord live with less liquidity?'], a: 'Liquidity ratios', opts: ['Market ratios', 'Profitability ratios', 'Debt ratios'], why: 'Stable rental income needs less working capital than a manufacturer — compare ratios within an industry, not across industries.' },
      { q: ['Which category answers: “Can the firm pay its bills due in the next 12 months?”'], a: 'Liquidity ratios' },
      { q: ['Which category answers: “How quickly does the firm turn inventory and receivables into sales and cash?”'], a: 'Activity ratios' },
      { q: ['Which category answers: “How much does the market pay per euro of earnings?”'], a: 'Market ratios' },
      { q: ['You compare this year\'s current ratio of your company with its current ratios of the past five years. What type of analysis?'], a: 'Time-series analysis', opts: ['Cross-sectional analysis', 'Benchmarking', 'Combined analysis'] },
      { q: ['You compare your firm\'s net margin with three rivals and the industry average for the same year. What type of analysis?'], a: 'Cross-sectional analysis', opts: ['Time-series analysis', 'Combined analysis', 'Liquidity ratios'] },
      { q: ['Which statement shows where cash came from and went to, split into operating, investment and financing activities?'], a: 'Statement of cash flows', opts: ['Income statement', 'Balance sheet', 'Statement of stockholders\' equity'] },
      { q: ['Where would you look to find out how a company recognises revenue or what its lease terms are?'], a: 'Notes to the financial statements', opts: ['Income statement', 'Balance sheet', 'Statement of cash flows'] }
    ],
    tf: [
      { s: 'A ratio is good or bad on its own, without comparing it to peers.', t: false, why: 'Ratios are meant for comparison with competitors/industry and over time.' },
      { s: 'Comparing ratios of a software firm and a restaurant chain directly can be misleading.', t: true, why: 'Ratios differ structurally across industries.' },
      { s: 'A real-estate company can carry more debt than a software company partly because its buildings can secure the loans.', t: true, why: 'Stable cash flows and collateral support debt.' },
      { s: 'DuPont analysis is part of the FSM exam material.', t: false, why: 'Chapter 3 is studied except DuPont.' },
      { s: 'Investing in several lower-margin firms can be wise because diversification reduces risk.', t: true, why: 'Higher margins may come with higher volatility.' },
      { s: 'An inventory turnover far above the industry average always means excellent inventory management.', t: false, why: 'It can mean too little stock → stockouts, production delays and lost sales. Ratios only flag areas to investigate.' },
      { s: 'Ratios of firms with different fiscal year-ends can safely be compared.', t: false, why: 'Use statements from the same point in the year — seasonality distorts comparisons.' },
      { s: 'High inflation can make older firms look more efficient and profitable than newer ones.', t: true, why: 'Old assets are carried at low historical book values.' },
      { s: 'Creditors mainly care about the firm\'s short-term liquidity and ability to pay interest and principal.', t: true, why: 'Shareholders focus on level and risk of earnings; management on everything.' },
      { s: 'Retained earnings represent cash the firm can spend.', t: false, why: 'They are earnings already reinvested in the business.' },
      { s: 'A single ratio is usually enough to judge a firm\'s overall performance.', t: false, why: 'Use several ratios across categories.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
