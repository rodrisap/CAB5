/* Case-based mock exams: the two official mocks + a generator for fresh cases in the same format.
   Every case is a data object; buildExam(d) turns it into 9 questions with course-method solutions. */
(function (root) {
  var FSM = root.FSM, F = FSM.fmt;
  var E = function (v, dp) { return '€' + F.num(v, dp || 0); };          // euros
  var Em = function (v) { return '€' + F.num(v, 1) + 'm'; };               // millions
  var P = function (x, dp) { return F.num(x * 100, dp === undefined ? 2 : dp) + '%'; };
  var N = function (v, dp) { return F.num(v, dp || 0); };
  var r1 = function (x) { return Math.round(x * 10) / 10; };
  var avg = function (a) { return (a[0] + a[1]) / 2; };

  /* ===================== derived figures ===================== */
  function derive(d) {
    var x = {};
    x.varTot = d.is.varLines.reduce(function (s, l) { return s + l[1]; }, 0);
    x.CM = d.is.sales - x.varTot;
    x.FC = d.is.fixedLines.reduce(function (s, l) { return s + l[1]; }, 0);
    x.EBIT = x.CM - x.FC; x.EBT = x.EBIT - d.is.interest; x.tax = x.EBT * d.T; x.NI = x.EBT - x.tax;
    var b = d.bs;
    ['cash', 'ar', 'inv', 'ppe', 'intang', 'ap', 'stb', 'ltd', 'pref', 'common', 're'].forEach(function (k) { x[k] = b[k]; });
    x.ca = [0, 1].map(function (i) { return r1(b.cash[i] + b.ar[i] + b.inv[i]); });
    x.nca = [0, 1].map(function (i) { return r1(b.ppe[i] + b.intang[i]); });
    x.ta = [0, 1].map(function (i) { return r1(x.ca[i] + x.nca[i]); });
    x.cl = [0, 1].map(function (i) { return r1(b.ap[i] + b.stb[i]); });
    x.tl = [0, 1].map(function (i) { return r1(x.cl[i] + b.ltd[i]); });
    x.te = [0, 1].map(function (i) { return r1(b.pref[i] + b.common[i] + b.re[i]); });
    x.PD = d.pref.n * d.pref.par * d.pref.pct;
    return x;
  }

  /* ===================== case document (HTML) ===================== */
  function caseHTML(d, x) {
    var h = '<h2 class="case-title">Case: ' + d.name + '</h2><p class="small muted">Fiscal year ending 31 December ' + d.year + ' · all figures in EUR unless stated otherwise</p>';
    h += '<h3>Company overview</h3>' + d.overview.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    h += '<h3>Operational & financial details</h3><ul>' + d.ops.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    h += '<h3>Income statement ' + d.year + '</h3><table class="cs"><tbody>';
    h += '<tr class="b"><td>Net sales revenue' + (d.allCredit ? ' (all on credit)' : '') + '</td><td>' + N(d.is.sales) + '</td></tr>';
    d.is.varLines.forEach(function (l) { h += '<tr><td class="in">' + l[0] + '</td><td>' + N(l[1]) + '</td></tr>'; });
    h += '<tr class="s"><td>Total variable costs</td><td>' + N(x.varTot) + '</td></tr><tr class="b"><td>Contribution margin</td><td>' + N(x.CM) + '</td></tr>';
    d.is.fixedLines.forEach(function (l) { h += '<tr><td class="in">' + l[0] + '</td><td>' + N(l[1]) + '</td></tr>'; });
    h += '<tr class="s"><td>Total fixed costs</td><td>' + N(x.FC) + '</td></tr><tr class="b"><td>Earnings before interest and taxes (EBIT)</td><td>' + N(x.EBIT) + '</td></tr>';
    h += '<tr><td class="in">Interest expense</td><td>' + N(d.is.interest) + '</td></tr><tr class="b"><td>Earnings before taxes</td><td>' + N(x.EBT) + '</td></tr>';
    h += '<tr><td class="in">Tax expense (' + P(d.T, 0) + ')</td><td>' + N(x.tax) + '</td></tr><tr class="b"><td>Net profit after taxes</td><td>' + N(x.NI) + '</td></tr></tbody></table>';
    if (d.isNote) h += '<p class="small muted">' + d.isNote + '</p>';
    var Y = [d.year, d.year - 1], row = function (lab, a, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + lab + '</td><td>' + F.num(a[0], 1) + '</td><td>' + F.num(a[1], 1) + '</td></tr>'; };
    h += '<h3>Balance sheet (€ millions)</h3><div class="bs2"><table class="cs"><thead><tr><th>Assets</th><th>' + Y[0] + '</th><th>' + Y[1] + '</th></tr></thead><tbody>' +
      row('Cash & cash equivalents', x.cash) + row('Accounts receivable', x.ar) + row('Inventory', x.inv) + row('Total current assets', x.ca, 's') +
      row('Property, plant & equipment (net)', x.ppe) + row('Intangible assets', x.intang) + row('Total non-current assets', x.nca, 's') + row('Total assets', x.ta, 'b') + '</tbody></table>' +
      '<table class="cs"><thead><tr><th>Liabilities & equity</th><th>' + Y[0] + '</th><th>' + Y[1] + '</th></tr></thead><tbody>' +
      row('Accounts payable', x.ap) + row('Short-term borrowings', x.stb) + row('Total current liabilities', x.cl, 's') + row('Long-term debt', x.ltd) + row('Total liabilities', x.tl, 's') +
      row('Preferred equity', x.pref) + row('Common equity', x.common) + row('Retained earnings', x.re) + row('Total equity', x.te, 's') + row('Total liabilities & equity', [x.tl[0] + x.te[0], x.tl[1] + x.te[1]], 'b') + '</tbody></table></div>';
    if (d.bsNote) h += '<p class="small muted">' + d.bsNote + '</p>';
    return h;
  }

  /* ===================== questions ===================== */
  function steps(arr) { return '<ol>' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function f(label, ans, unit, dp, tol) { return { label: label, ans: ans, unit: unit || 'cur', dp: dp, tolAbs: tol }; }

  function buildExam(d) {
    var x = derive(d), Q = [], v = d.variants;
    var nm = d.short;

    /* ---- Q1 ---- */
    if (v.q1.v === 'legal') {
      var p = v.q1.profit, corp = p * d.T, div = p - corp, wht = div * v.q1.wht, tot = corp + wht;
      Q.push({ n: 1, area: 'fin', title: 'Legal forms', intro: nm + ' is structured as a ' + d.form + ', the ' + d.formNote + ' variant of incorporation.', parts: [
        { id: '1a', pts: 4, prompt: 'Name three features of the corporate form that make it particularly suitable for a company like ' + nm + '.', open: true,
          model: '<p>Any three, each linked to the company:</p><ul><li><b>Limited liability</b>: owners can lose only what they invested; their personal assets are protected.</li><li><b>Easy transfer of ownership</b>: shares can be sold to new investors (e.g. a growth-equity investor) without ending the company.</li><li><b>Unlimited life / continuity</b>: the company continues when owners change.</li><li><b>Easier to raise capital</b>: it can issue shares to many investors to fund growth.</li></ul>', check: ['Limited liability (explained)', 'Easy transfer of ownership (explained)', 'Unlimited life / continuity (explained)', 'Easier access to capital (explained)'], need: 3 },
        { id: '1b', pts: 6, prompt: 'Suppose ' + nm + ' generates ' + E(p) + ' in pre-tax profit and distributes all of it as dividends. The dividend withholding tax rate is ' + P(v.q1.wht, 0) + '. Using the tax rates applicable to ' + nm + ' and its shareholders, calculate the effective tax rate on the distributed profits (total tax paid as a percentage of pre-tax profit).',
          fields: [f('Total tax paid (€)', tot, 'cur', 0), f('Effective tax rate', tot / p, 'pct', 2)],
          model: steps(['Corporate tax = ' + E(p) + ' × ' + P(d.T, 0) + ' = <b>' + E(corp) + '</b>', 'Dividend = ' + E(p) + ' − ' + E(corp) + ' = ' + E(div), 'Withholding tax = ' + E(div) + ' × ' + P(v.q1.wht, 0) + ' = <b>' + E(wht) + '</b>', 'Total tax = ' + E(corp) + ' + ' + E(wht) + ' = <b>' + E(tot) + '</b>', 'Effective rate = ' + E(tot) + ' ÷ ' + E(p) + ' = <b>' + P(tot / p) + '</b>']) }
      ] });
    } else {
      var q = v.q1, pay = q.shares * q.ask, etc = q.shares * 0.5 * (q.ask - q.bid);
      var raised = q.steps.filter(function (s) { return s.y; });
      Q.push({ n: 1, area: 'fin', title: 'Stock market', intro: nm + ' is listed on ' + q.exchange + ', a dealer market. Your broker quotes a bid price of ' + E(q.bid, 2) + ' and an ask price of ' + E(q.ask, 2) + ' per share. You do not have to pay any commissions.', parts: [
        { id: '1a', pts: 4, prompt: 'Suppose you purchase ' + N(q.shares) + ' ' + nm + ' common shares. How much will you pay in total, and what are your effective transaction costs?',
          fields: [f('Total paid (€)', pay, 'cur', 2), f('Effective transaction costs (€)', etc, 'cur', 2)],
          model: steps(['You buy at the <b>ask</b>: ' + N(q.shares) + ' × ' + E(q.ask, 2) + ' = <b>' + E(pay, 2) + '</b>', 'Spread = ' + E(q.ask, 2) + ' − ' + E(q.bid, 2) + ' = ' + E(q.ask - q.bid, 2), 'Effective transaction cost = ' + N(q.shares) + ' × ½ × ' + E(q.ask - q.bid, 2) + ' + €0 commission = <b>' + E(etc, 2) + '</b>']) },
        { id: '1b', pts: 6, prompt: 'The early financing history of ' + nm + ':<ol>' + q.steps.map(function (s) { return '<li>' + s.t + '</li>'; }).join('') + '</ol>Identify and explain which of the above steps raise funds for the company.', open: true,
          model: '<ul>' + q.steps.map(function (s, i) { return '<li><b>Step ' + (i + 1) + ': ' + (s.y ? 'raises funds' : 'does NOT raise funds') + '.</b> ' + s.why + '</li>'; }).join('') + '</ul><p>Only primary transactions (the company itself issues new shares) bring money into the company; secondary transactions move money between investors.</p>',
          check: q.steps.map(function (s, i) { return 'Step ' + (i + 1) + ' correctly ' + (s.y ? 'identified as raising funds' : 'identified as not raising funds') + ' with reason'; }), need: q.steps.length }
      ] });
    }

    /* ---- Q2 CCC ---- */
    var ai = avg(x.inv), aar = avg(x.ar), aap = avg(x.ap), cogsM = d.cogs / 1e6, salesM = d.is.sales / 1e6, cpM = d.creditPurch / 1e6;
    var turn = cogsM / ai, aai = 365 / turn, acp = aar / (salesM / 365), app = aap / (cpM / 365), ccc = aai + acp - app, res = ai + aar - aap;
    Q.push({ n: 2, area: 'fin', title: 'Cash conversion cycle', parts: [
      { id: '2a', pts: 5, prompt: 'Calculate ' + nm + '\'s cash conversion cycle (CCC) for ' + d.year + '.',
        fields: [f('AAI (days)', aai, 'days', 1, 0.6), f('ACP (days)', acp, 'days', 1, 0.6), f('APP (days)', app, 'days', 1, 0.6), f('CCC (days)', ccc, 'days', 1, 0.8)],
        model: steps(['Average inventory = (' + F.num(x.inv[1], 1) + ' + ' + F.num(x.inv[0], 1) + ') ÷ 2 = ' + Em(ai) + '; inventory turnover = COGS ÷ avg inventory = ' + F.num(cogsM, 1) + ' ÷ ' + F.num(ai, 2) + ' = ' + F.num(turn, 4) + '; <b>AAI</b> = 365 ÷ ' + F.num(turn, 4) + ' = <b>' + F.num(aai, 2) + ' days</b>',
          'Average A/R = (' + F.num(x.ar[1], 1) + ' + ' + F.num(x.ar[0], 1) + ') ÷ 2 = ' + Em(aar) + '; credit sales per day = ' + F.num(salesM, 1) + ' ÷ 365 = ' + F.num(salesM / 365, 5) + '; <b>ACP</b> = ' + F.num(aar, 2) + ' ÷ ' + F.num(salesM / 365, 5) + ' = <b>' + F.num(acp, 2) + ' days</b>',
          'Average A/P = (' + F.num(x.ap[1], 1) + ' + ' + F.num(x.ap[0], 1) + ') ÷ 2 = ' + Em(aap) + '; credit purchases per day = ' + F.num(cpM, 1) + ' ÷ 365 = ' + F.num(cpM / 365, 5) + '; <b>APP</b> = ' + F.num(aap, 2) + ' ÷ ' + F.num(cpM / 365, 5) + ' = <b>' + F.num(app, 2) + ' days</b>',
          '<b>CCC</b> = AAI + ACP − APP = ' + F.num(aai, 2) + ' + ' + F.num(acp, 2) + ' − ' + F.num(app, 2) + ' = <b>' + F.num(ccc, 2) + ' days</b>']) },
      { id: '2b', pts: 5, prompt: 'Calculate how many resources are needed to support the cash conversion cycle (also for ' + d.year + ').',
        fields: [f('Resources needed (€ millions)', res, 'num', 2, 0.06)],
        model: steps(['Resources = average inventory + average receivables − average payables', '= ' + F.num(ai, 2) + ' + ' + F.num(aar, 2) + ' − ' + F.num(aap, 2) + ' = <b>' + Em(res) + '</b>', 'Same result with the formula sheet: AAI/365 × COGS + ACP/365 × credit sales − APP/365 × credit purchases.']) }
    ] });

    /* ---- Q3 ---- */
    if (v.q3.v === 'credit') {
      var c = v.q3, dCM = (c.s1 - c.s0) * c.cmr, ar0 = c.s0 * c.acp0 / 365, ar1 = c.s1 * c.acp1 / 365, dAR = ar1 - ar0, cost = dAR * c.rrr, bd0 = c.s0 * c.b0, bd1 = c.s1 * c.b1, dBD = bd1 - bd0, net = dCM - cost - dBD;
      Q.push({ n: 3, area: 'fin', title: 'Credit terms', intro: nm + ' is considering relaxing its credit policy for its ' + c.segment + ' clients. Management has provided the following information:<ul><li>Annual credit sales for this client segment are currently ' + E(c.s0) + ' and are expected to increase to ' + E(c.s1) + '.</li><li>The contribution margin ratio for this segment is ' + P(c.cmr, 0) + '.</li><li>The average collection period is expected to increase from ' + c.acp0 + ' to ' + c.acp1 + ' days.</li><li>The bad debt rate is currently ' + P(c.b0, 1) + ' of credit sales and is expected to rise to ' + P(c.b1, 1) + ' under the new policy.</li><li>' + nm + ' requires a ' + P(c.rrr, 0) + ' return on invested capital for new sales.</li></ul>', parts: [
        { id: '3a', pts: 4, prompt: 'Calculate the impact of the proposed policy change on ' + nm + '\'s annual contribution margin.', fields: [f('Change in contribution margin (€)', dCM, 'cur', 0)],
          model: steps(['ΔCM = (' + E(c.s1) + ' − ' + E(c.s0) + ') × ' + P(c.cmr, 0) + ' = <b>+' + E(dCM) + '</b>']) },
        { id: '3b', pts: 6, prompt: 'Calculate the impact of the proposed policy change on ' + nm + '\'s investment in accounts receivable, and determine the associated (opportunity) cost.', fields: [f('Change in A/R investment (€)', dAR, 'cur', 0), f('Opportunity cost (€)', cost, 'cur', 0)],
          model: steps(['A/R now = ' + E(c.s0) + ' × ' + c.acp0 + ' ÷ 365 = ' + E(ar0), 'A/R new = ' + E(c.s1) + ' × ' + c.acp1 + ' ÷ 365 = ' + E(ar1), 'ΔA/R = ' + E(ar1) + ' − ' + E(ar0) + ' = <b>+' + E(dAR) + '</b>', 'Opportunity cost = ' + E(dAR) + ' × ' + P(c.rrr, 0) + ' = <b>' + E(cost) + '</b>']) },
        { id: '3c', pts: 4, prompt: 'Calculate the impact of the proposed policy change on ' + nm + '\'s annual bad debt expense.', fields: [f('Change in bad debts (€)', dBD, 'cur', 0)],
          model: steps(['Bad debts now = ' + E(c.s0) + ' × ' + P(c.b0, 1) + ' = ' + E(bd0), 'Bad debts new = ' + E(c.s1) + ' × ' + P(c.b1, 1) + ' = ' + E(bd1), 'Δ = <b>+' + E(dBD) + '</b>']) },
        { id: '3d', pts: 1, prompt: 'Based on your answers to 3a, 3b and 3c, explain whether ' + nm + ' should implement the proposed credit policy change.', open: true,
          model: '<p>Net effect = ' + E(dCM) + ' − ' + E(cost) + ' − ' + E(dBD) + ' = <b>' + (net >= 0 ? '+' : '−') + E(Math.abs(net)) + '</b>. ' + (net >= 0 ? 'The extra contribution margin is larger than the extra costs, so ' + nm + ' <b>should implement</b> the change.' : 'The extra costs are larger than the extra contribution margin, so ' + nm + ' <b>should not</b> implement the change.') + '</p>', check: ['Combines 3a − 3b − 3c into a net effect and draws the right conclusion'], need: 1 }
      ] });
    } else {
      var o = v.q3, opts = [
        { lab: 'Discount loan', rp: o.X / (100 - o.X), days: o.d1, how: o.X + ' ÷ (100 − ' + o.X + ')' },
        { lab: 'Regular loan', rp: o.Y / 100 * o.d2 / 365, days: o.d2, how: o.Y + '% × ' + o.d2 + ' ÷ 365' },
        { lab: 'Supplier bill', rp: o.cd / (100 - o.cd), days: o.z - o.y, how: o.cd + ' ÷ (100 − ' + o.cd + ')' }];
      opts.forEach(function (k) { k.eur = o.amt * k.rp; k.ear = Math.pow(1 + k.rp, 365 / k.days) - 1; });
      var best = opts.reduce(function (b, k, i) { return k.eur < opts[b].eur ? i : b; }, 0), bestEar = opts.reduce(function (b, k, i) { return k.ear < opts[b].ear ? i : b; }, 0);
      Q.push({ n: 3, area: 'fin', title: 'Short-term liabilities', intro: nm + ' requires short-term financing and is evaluating the following three options, each of which raises ' + E(o.amt) + ':<ul><li>A discount loan from ' + o.bank1 + ' at ' + o.X + '% for a period of ' + o.d1 + ' days.</li><li>A regular loan from ' + o.bank2 + ' at ' + o.Y + '% p.a. simple interest for a period of ' + o.d2 + ' days.</li><li>A bill from ' + o.supplier + ' with terms ' + o.cd + '/' + o.y + ', n/' + o.z + '.</li></ul>', parts: [
        { id: '3a', pts: 5, prompt: 'Calculate the total interest expense of each option in euros.', fields: opts.map(function (k) { return f(k.lab + ' (€)', k.eur, 'cur', 0); }),
          model: steps(opts.map(function (k) { return k.lab + ': r<sub>p</sub> = ' + k.how + ' = ' + P(k.rp, 3) + ' → ' + E(o.amt) + ' × ' + P(k.rp, 3) + ' = <b>' + E(k.eur) + '</b>'; })) },
        { id: '3b', pts: 5, prompt: 'Calculate the cost of each option as an effective annual rate (EAR). For the supplier bill, give the exact value, not the approximation.', fields: opts.map(function (k) { return f(k.lab + ' EAR', k.ear, 'pct', 2); }),
          model: steps(opts.map(function (k) { return k.lab + ': EAR = (1 + ' + P(k.rp, 3) + ')<sup>365/' + k.days + '</sup> − 1 = <b>' + P(k.ear) + '</b>' + (k.lab === 'Supplier bill' ? ' (N = ' + o.z + ' − ' + o.y + ' = ' + k.days + ' days)' : ''); })) },
        { id: '3c', pts: 5, prompt: nm + ' expects this to be a ' + (o.recurring ? 'recurring' : 'one-off') + ' financing need. Explain which option it should choose and why.', open: true,
          model: '<p>' + (o.recurring ? 'For a <b>recurring</b> need the company should compare the annualised cost, so it picks the <b>lowest EAR</b>: <b>' + opts[bestEar].lab + '</b> (' + P(opts[bestEar].ear) + ').' : 'For a <b>one-off</b> need only the cost for this period matters, so it picks the <b>lowest total interest expense</b>: <b>' + opts[best].lab + '</b> (' + E(opts[best].eur) + ').' + (best !== bestEar ? ' (If the need were recurring, the lowest EAR — ' + opts[bestEar].lab + ' — would be the choice.)' : '')) + '</p>', check: ['Uses the right criterion (one-off → lowest total cost; recurring → lowest EAR)', 'Names the correct option', 'Refers to the numbers from 3a/3b'], need: 3 }
      ] });
    }

    /* ---- Q4 leverage ---- */
    var dol = x.CM / x.EBIT, pdPre = x.PD / (1 - d.T), dfl = x.EBIT / (x.EBT - pdPre), dtl = dol * dfl;
    Q.push({ n: 4, area: 'fin', title: 'Leverage', parts: [
      { id: '4a', pts: v.q4pts[0], prompt: 'Calculate ' + nm + '\'s degree of operating leverage (DOL) for ' + d.year + '.', fields: [f('DOL', dol, 'x', 3, 0.01)], model: steps(['DOL = CM ÷ EBIT = ' + E(x.CM) + ' ÷ ' + E(x.EBIT) + ' = <b>' + F.num(dol, 3) + '</b>']) },
      { id: '4b', pts: v.q4pts[1], prompt: 'Calculate ' + nm + '\'s degree of financial leverage (DFL) for ' + d.year + '.', fields: [f('DFL', dfl, 'x', 3, 0.005)],
        model: steps(['Preferred dividend PD = ' + N(d.pref.n) + ' × ' + E(d.pref.par) + ' × ' + P(d.pref.pct, 0) + ' = ' + E(x.PD), 'Before tax: PD ÷ (1 − T) = ' + E(x.PD) + ' ÷ ' + F.num(1 - d.T, 2) + ' = ' + E(pdPre), 'DFL = EBIT ÷ (EBT − PD/(1 − T)) = ' + E(x.EBIT) + ' ÷ (' + E(x.EBT) + ' − ' + E(pdPre) + ') = <b>' + F.num(dfl, 3) + '</b>']) },
      { id: '4c', pts: v.q4pts[2], prompt: v.q4c === 'eps' ? 'Calculate ' + nm + '\'s degree of total leverage (DTL) for ' + d.year + ' and explain what happens to earnings per share (EPS) if sales go up by 1%.' : 'Calculate ' + nm + '\'s degree of total leverage (DTL) for ' + d.year + '. Based on your answers to a) and b), explain which type of leverage contributes more to total leverage, and what this implies for management.',
        fields: [f('DTL', dtl, 'x', 3, 0.01)], open: true,
        model: steps(['DTL = DOL × DFL = ' + F.num(dol, 3) + ' × ' + F.num(dfl, 3) + ' = <b>' + F.num(dtl, 3) + '</b>', v.q4c === 'eps' ? 'If sales rise by 1%, EPS rises by about <b>' + F.num(dtl, 2) + '%</b> (DTL × 1%).' : 'DOL (' + F.num(dol, 2) + ') ' + (dol > dfl ? '>' : '<') + ' DFL (' + F.num(dfl, 2) + '): <b>' + (dol > dfl ? 'operating leverage' : 'financial leverage') + '</b> contributes most. ' + (dol > dfl ? 'Risk comes mainly from high fixed operating costs, so management should focus on stable sales and controlling fixed costs; the low DFL suggests there is room to use more debt.' : 'Risk comes mainly from debt and preferred dividends, so management should be careful with extra borrowing.')]),
        check: v.q4c === 'eps' ? ['States EPS changes by DTL × 1% (≈ ' + F.num(dtl, 2) + '%)'] : ['Compares DOL with DFL and names the bigger one', 'Gives an implication for management'], need: v.q4c === 'eps' ? 1 : 2 }
    ] });

    /* ---- Q5 ---- */
    if (v.q5.v === 'wacc') {
      var D = x.ltd[0], Pf = x.pref[0], S = r1(x.common[0] + x.re[0]), T5 = D + Pf + S, rd = d.is.interest / 1e6 / D;
      var wd = D / T5, wp = Pf / T5, ws = S / T5, wacc = wd * rd * (1 - d.T) + wp * d.rp + ws * d.rs;
      var proj = v.q5.proj;
      Q.push({ n: 5, area: 'fin', title: 'Cost of capital', parts: [
        { id: '5a', pts: 7, prompt: 'Calculate ' + nm + '\'s weighted average cost of capital (WACC), based on the book value of equity and liabilities. Assume that all interest expense is attributable to long-term debt.', fields: [f('WACC', wacc, 'pct', 2)],
          model: steps(['Long-term capital (€m): LT debt ' + F.num(D, 1) + ' + preferred ' + F.num(Pf, 1) + ' + common equity (' + F.num(x.common[0], 1) + ' + retained earnings ' + F.num(x.re[0], 1) + ' = ' + F.num(S, 1) + ') = ' + F.num(T5, 1) + ' (current liabilities are left out)', 'w<sub>d</sub> = ' + F.num(D, 1) + ' ÷ ' + F.num(T5, 1) + ' = ' + F.num(wd, 4) + '; w<sub>p</sub> = ' + F.num(wp, 4) + '; w<sub>s</sub> = ' + F.num(ws, 4), 'r<sub>d</sub> = interest ÷ LT debt = ' + F.num(d.is.interest / 1e6, 2) + ' ÷ ' + F.num(D, 1) + ' = ' + P(rd, 3), 'WACC = ' + F.num(wd, 4) + ' × ' + P(rd, 3) + ' × (1 − ' + P(d.T, 0) + ') + ' + F.num(wp, 4) + ' × ' + P(d.rp, 1) + ' + ' + F.num(ws, 4) + ' × ' + P(d.rs, 1) + ' = ' + P(wd * rd * (1 - d.T), 3) + ' + ' + P(wp * d.rp, 3) + ' + ' + P(ws * d.rs, 3) + ' = <b>' + P(wacc) + '</b>']) },
        { id: '5b', pts: 3, prompt: nm + ' has an opportunity to invest in a project that yields a ' + P(proj, 0) + ' return on investment. Explain how the WACC can be used to evaluate this opportunity. Refer explicitly to your answer to question a).', open: true,
          model: '<p>The WACC is the minimum return needed to pay all providers of capital (the hurdle rate). The project yields ' + P(proj, 0) + ', which is ' + (proj > wacc ? '<b>above</b>' : '<b>below</b>') + ' the WACC of ' + P(wacc) + ', so it ' + (proj > wacc ? 'creates value and should be <b>accepted</b>' : 'destroys value and should be <b>rejected</b>') + ' (assuming the project has the same risk as the company).</p>', check: ['Explains WACC as the minimum required return / hurdle rate', 'Compares ' + P(proj, 0) + ' with the WACC from a)', 'Correct accept/reject conclusion'], need: 3 }
      ] });
    } else {
      var t = v.q5, ft = t.pretax * t.fr, dv = t.pretax - ft, ht = dv * d.T;
      Q.push({ n: 5, area: 'fin', title: 'International finance', intro: nm + '\'s ' + t.city + ' subsidiary generated a pre-tax profit of ' + E(t.pretax) + ' in ' + d.year + '. The corporate tax rate in ' + t.country + ' is ' + P(t.fr, 0) + '. ' + nm + ' receives the after-tax profit as a dividend, which is then subject to ' + d.countryAdj + ' corporate tax.', parts: [
        { id: '5a', pts: 5, prompt: 'Calculate the total tax paid on the subsidiary\'s profit, assuming foreign taxes are not deductible in ' + d.country + '.', fields: [f('Total tax (€)', ft + ht, 'cur', 0)],
          model: steps(['Tax in ' + t.country + ' = ' + E(t.pretax) + ' × ' + P(t.fr, 0) + ' = ' + E(ft), 'Dividend = ' + E(t.pretax) + ' − ' + E(ft) + ' = ' + E(dv), d.countryAdj + ' tax = ' + E(dv) + ' × ' + P(d.T, 0) + ' = ' + E(ht), 'Total = ' + E(ft) + ' + ' + E(ht) + ' = <b>' + E(ft + ht) + '</b> (' + P((ft + ht) / t.pretax, 1) + ')']) },
        { id: '5b', pts: 5, prompt: 'Calculate the total tax paid on the subsidiary\'s profit, assuming ' + nm + ' can deduct ' + t.country + ' taxes already paid from its ' + d.countryAdj + ' tax liability.', fields: [f('Total tax (€)', ft + Math.max(0, ht - ft), 'cur', 0)],
          model: steps([d.countryAdj + ' tax after credit = max(0, ' + E(ht) + ' − ' + E(ft) + ') = ' + E(Math.max(0, ht - ft)) + (ht < ft ? ' (it cannot go below zero)' : ''), 'Total = ' + E(ft) + ' + ' + E(Math.max(0, ht - ft)) + ' = <b>' + E(ft + Math.max(0, ht - ft)) + '</b>']) }
      ] });
    }

    /* ---- Q6 consolidation ---- */
    var c6 = v.q6, tg = c6.target, lines = ['Cash & cash equivalents', 'Accounts receivable', 'Inventory', '?', 'PPE (net)', 'Intangible assets', 'Total assets', 'Accounts payable & current liabilities', 'Short-term borrowings', 'Long-term debt', 'Total liabilities', 'Equity', 'Total liabilities & equity'];
    var excess = r1(c6.price - tg.eq), gw = r1(excess - c6.uplift);
    var pre = null, fin;
    if (c6.v === 'templates') {
      var cashPaid = r1(c6.price * c6.cashPct), loan = r1(c6.price - cashPaid);
      pre = [r1(x.cash[0] - cashPaid), x.ar[0], x.inv[0], c6.price, x.ppe[0], x.intang[0]];
      pre.push(r1(pre.reduce(function (s, a) { return s + a; }, 0)));
      var preL = [x.ap[0], x.stb[0], r1(x.ltd[0] + loan)]; preL.push(r1(preL[0] + preL[1] + preL[2])); preL.push(x.te[0]); preL.push(r1(preL[3] + preL[4]));
      pre = pre.concat(preL);
      var part = [r1(pre[0] + tg.cash), r1(x.ar[0] + tg.ar), r1(x.inv[0] + tg.inv), excess, r1(x.ppe[0] + tg.nca), x.intang[0]];
      part.push(r1(part.reduce(function (s, a) { return s + a; }, 0)));
      var partL = [r1(x.ap[0] + tg.cl), x.stb[0], r1(pre[9] + tg.ltd)]; partL.push(r1(partL[0] + partL[1] + partL[2])); partL.push(x.te[0]); partL.push(r1(partL[3] + partL[4]));
      c6.partial = part.concat(partL);
    }
    var pt = c6.partial; // partially consolidated: [cash, ar, inv, excess, ppe, intang, TA, cl, stb, ltd, TL, eq, TLE]
    fin = [pt[0], pt[1], pt[2], gw, r1(pt[4] + c6.uplift), pt[5], pt[6], pt[7], pt[8], pt[9], pt[10], pt[11], pt[12]];
    function tableHTML(vals, qmark) { return '<table class="cs tpl"><tbody>' + lines.map(function (l, i) { return '<tr' + (/^Total/.test(l) ? ' class="s"' : '') + '><td>' + (l === '?' ? qmark : l) + '</td><td>' + F.num(vals[i], 1) + '</td></tr>'; }).join('') + '</tbody></table>'; }
    var partialShown = '<table class="cs tpl"><tbody>' + lines.map(function (l, i) { return '<tr' + (/^Total/.test(l) ? ' class="s"' : '') + '><td>' + (l === '?' ? 'Excess of cost over book value' : l) + '</td><td>' + F.num(pt[i], 1) + '</td></tr>'; }).join('') + '</tbody></table>';
    var finFields = lines.map(function (l, i) { return f(l === '?' ? '? (name it in your notes) — amount' : l, fin[i], 'num', 1, 0.06); });
    var q6parts = [];
    if (c6.v === 'templates') {
      q6parts.push({ id: '6a', pts: 5, prompt: 'Prepare ' + nm + '\'s balance sheet immediately after the purchase, but before consolidation (€ millions). Complete the template (the "?" line is the new item).',
        fields: lines.map(function (l, i) { return f(l === '?' ? '? (name it in your notes) — amount' : l, pre[i], 'num', 1, 0.06); }),
        model: steps(['Cash paid = ' + P(c6.cashPct, 0) + ' × ' + Em(c6.price) + ' = ' + Em(r1(c6.price * c6.cashPct)) + ' → cash ' + F.num(x.cash[0], 1) + ' − ' + F.num(r1(c6.price * c6.cashPct), 1) + ' = ' + F.num(pre[0], 1), 'Bank loan = ' + Em(r1(c6.price - c6.price * c6.cashPct)) + ' → long-term debt ' + F.num(x.ltd[0], 1) + ' + ' + F.num(r1(c6.price - c6.price * c6.cashPct), 1) + ' = ' + F.num(pre[9], 1), '"?" = <b>Investment in ' + tg.name + '</b> at cost: ' + Em(c6.price), 'All other lines are unchanged.']) + tableHTML(pre, 'Investment in ' + tg.name) });
    } else {
      q6parts.push({ id: '6a', pts: 5, prompt: 'When consolidating two companies\' balance sheets, the investment in the subsidiary must be cancelled out against the subsidiary\'s equity. Explain why.', open: true,
        model: '<p>The parent\'s investment represents its ownership of the subsidiary\'s net assets (assets − liabilities). In consolidation those assets and liabilities are already added line by line. Keeping the investment as well would count the same net assets <b>twice</b>. The subsidiary\'s equity is owned entirely by the parent, not by outside shareholders, so it is not equity of the group. Cancelling the investment against the subsidiary\'s equity removes the double counting. Any difference (price above book equity) becomes the excess of cost over book value.</p>', check: ['Double counting of the same net assets', 'Subsidiary equity is owned by the parent (not outside owners)', 'Difference becomes excess of cost over book value / goodwill'], need: 2 });
    }
    q6parts.push({ id: '6b', pts: 5, prompt: 'As a final step, the "Excess of cost over book value" account must be closed. ' + tg.name + '\'s non-current assets have a market value that is ' + Em(c6.uplift) + ' above their book value. The partially consolidated balance sheet (€ millions) is:' + partialShown + 'Prepare the final consolidated balance sheet. Complete the template.',
      fields: finFields,
      model: steps(['Excess of cost over book value = ' + Em(excess) + (c6.v === 'templates' ? ' (price ' + Em(c6.price) + ' − ' + tg.name + ' equity ' + Em(tg.eq) + ')' : ''), 'First raise non-current assets to market value: PPE ' + F.num(pt[4], 1) + ' + ' + F.num(c6.uplift, 1) + ' = ' + F.num(fin[4], 1), 'The rest is <b>goodwill</b>: ' + F.num(excess, 1) + ' − ' + F.num(c6.uplift, 1) + ' = <b>' + Em(gw) + '</b> (this replaces the "?" line)', 'Total assets stay ' + Em(fin[6]) + '; liabilities and equity do not change.']) + tableHTML(fin, 'Goodwill') });
    Q.push({ n: 6, area: 'fin', title: 'Consolidation', intro: nm + ' has agreed to acquire ' + tg.name + (c6.v === 'templates' ? ' for ' + E(c6.price * 1e6) + '. ' + nm + ' will finance ' + P(c6.cashPct, 0) + ' of the purchase price in cash, with the remaining ' + P(1 - c6.cashPct, 0) + ' borrowed from the bank (long-term). The balance sheet of ' + tg.name + ' at 31 December ' + d.year + ' (€ millions): cash ' + F.num(tg.cash, 1) + ', accounts receivable ' + F.num(tg.ar, 1) + ', inventory ' + F.num(tg.inv, 1) + ', non-current assets (PPE) ' + F.num(tg.nca, 1) + '; current liabilities ' + F.num(tg.cl, 1) + ', long-term debt ' + F.num(tg.ltd, 1) + ', equity ' + F.num(tg.eq, 1) + '.' : ', ' + tg.desc + '.'), parts: q6parts });

    /* ---- Q7 ---- */
    var L = d.lead.L, vv = d.lead.v;
    function impact(ch, label) {
      var L2 = r1(L * ch.f), v2 = ch.v2, tot0 = L + vv, tot1 = L2 + v2, short = ch.f < 1;
      return {
        model: '<ul><li><b>(a) Cycle stock ' + (short ? '↓' : '↑') + '</b>: cycle stock follows the lead time (' + L + ' → ' + F.num(L2, 1) + ' days).</li>' +
          '<li><b>(b) Safety stock ' + (v2 < vv ? '↓' : '↑') + '</b>: safety stock covers uncertainty; variability goes from ±' + vv + ' to ±' + F.num(v2, 1) + ' days' + (v2 > vv ? ' (less reliable → bigger buffer)' : ' (more reliable → smaller buffer)') + '.</li>' +
          '<li><b>(c) Order costs ' + (short ? '↑' : '↓') + '</b>: ' + (short ? 'to keep the lower cycle stock, ' + nm + ' orders smaller quantities more often.' : 'fewer, larger orders.') + '</li>' +
          '<li><b>(d) Transportation costs ' + (short ? '↑' : '↓') + '</b>: ' + (short ? 'smaller, more frequent shipments lose consolidation (fewer full loads).' : 'larger shipments can be consolidated.') + '</li>' +
          '<li><b>(e) ROA ' + (tot1 < tot0 ? '↑' : '↓') + '</b>: total stock goes from ' + tot0 + ' to ' + F.num(tot1, 1) + ' days, so inventory (assets) ' + (tot1 < tot0 ? 'falls and ROA rises' : 'rises and ROA falls') + ' — as long as the higher order/transport costs do not eat up the gain.</li></ul>',
        check: ['(a) cycle stock direction + reason', '(b) safety stock direction + reason', '(c) order costs direction + reason', '(d) transport costs direction + reason', '(e) ROA direction + reason'] };
    }
    if (v.q7.v === 'inventory') {
      var im = impact(v.q7.change);
      Q.push({ n: 7, area: 'scm', title: 'Inventory management', parts: [
        { id: '7a', pts: 5, prompt: 'Describe three inventory management decisions ' + nm + ' could implement to reduce its inventory investment while maintaining current delivery performance.', open: true,
          model: '<ul><li><b>Centralise / pool stock</b>: ' + d.poolHint + ' Holding safety stock in fewer locations needs less total buffer for the same service.</li><li><b>ABC analysis</b>: control the few A-items (most of the value) tightly with frequent reviews; keep lower stock of C-items.</li><li><b>Reduce lead time and variability</b>: choose suppliers on reliability, not only price (the bidding process now picks the cheapest) → lower cycle and safety stock.</li><li><b>Better forecasting / information sharing</b> or <b>VMI</b> with key suppliers → less buffer stock.</li><li><b>Remove slow-moving SKUs</b>.</li></ul>', check: ['Decision 1 described and linked to lower stock', 'Decision 2 described and linked to lower stock', 'Decision 3 described and linked to lower stock'], need: 3 },
        { id: '7b', pts: 5, prompt: nm + ' is considering switching to a new preferred supplier that promises to ' + v.q7.change.desc + ', while maintaining the same delivered price. Indicate the likely impact, and explain why, on ' + nm + '\'s: (a) cycle stock, (b) safety stock, (c) order costs, (d) transportation costs, (e) return on assets.', open: true, model: im.model, check: im.check, need: 5 }
      ] });
    } else {
      Q.push({ n: 7, area: 'scm', title: 'Logistics & customer service', parts: [
        { id: '7a', pts: 4, prompt: 'Define Logistics and explain the goal of Logistics.', open: true,
          model: '<p><b>Logistics</b> is the process of planning, implementing and controlling the efficient and effective flow and storage of raw materials, in-process inventory, finished goods, related services and information from point of origin to point of consumption, to conform to customer (and organisational) requirements.</p><p><b>Goal</b>: to provide an acceptable level of customer service at the lowest possible total cost.</p>', check: ['Plan / implement / control', 'Efficient and effective flow AND storage (goods, services, information)', 'From origin to consumption, to meet customer requirements', 'Goal: acceptable customer service at lowest total cost'], need: 4 },
        { id: '7b', pts: 6, prompt: 'Explain the meaning of "Logistics Customer Service" using the 7Rs model.', open: true,
          model: '<p>Logistics customer service means getting:</p><ul><li>the <b>right product</b> (exactly what was ordered),</li><li>to the <b>right customer</b>,</li><li>at the <b>right place</b>,</li><li>in the <b>right quantity</b>,</li><li>in the <b>right condition</b> (undamaged, within spec),</li><li>at the <b>right time</b> (when needed),</li><li>for the <b>right price</b> (cost acceptable to customer and company).</li></ul><p>Example for ' + nm + ': ' + d.sevenRsHint + '</p>', check: ['Right product', 'Right customer', 'Right place', 'Right quantity', 'Right condition', 'Right time', 'Right price'], need: 7 }
      ] });
    }

    /* ---- Q8 ---- */
    if (v.q8.v === 'criteria') {
      Q.push({ n: 8, area: 'scm', title: 'Supplier selection', parts: [
        { id: '8', pts: 10, prompt: nm + ' currently selects suppliers based solely on price through a competitive bidding process. Name and explain five additional criteria ' + nm + ' should consider when selecting suppliers.', open: true,
          model: '<ul><li><b>Quality</b>: technical specifications, defect rates, certifications (e.g. ISO 9001), so products meet ' + nm + '\'s standards.</li><li><b>Reliability</b>: on-time delivery and performance history; unreliable deliveries force more safety stock.</li><li><b>Capability</b>: production and technical capacity, management, information systems to grow with ' + nm + '.</li><li><b>Financial stability</b>: a supplier that may go bankrupt is a supply risk.</li><li><b>Risk</b>: lead-time and supply uncertainty, location, dependence on one source.</li><li><b>Sustainability</b>: environmental and social commitment (fits ' + nm + '\'s positioning).</li><li><b>Desirable qualities</b>: cultural fit, location, packaging, after-sales service and training.</li></ul>', check: ['Criterion 1 named + explained', 'Criterion 2 named + explained', 'Criterion 3 named + explained', 'Criterion 4 named + explained', 'Criterion 5 named + explained'], need: 5 }
      ] });
    } else {
      var im8 = impact(v.q8.change);
      Q.push({ n: 8, area: 'scm', title: 'New supplier impact', intro: nm + ' is considering switching to a new supplier for ' + d.material + ', who promises to ' + v.q8.change.desc + ', while maintaining the same delivered price.', parts: [
        { id: '8', pts: 10, prompt: 'Indicate the likely impact, and explain why, of this new supplier relationship on ' + nm + '\'s: (a) cycle stock, (b) safety stock, (c) order costs, (d) transportation costs, (e) return on assets.', open: true, model: im8.model, check: im8.check, need: 5 }
      ] });
    }

    /* ---- Q9 ---- */
    if (v.q9.v === 'tlc') {
      var t9 = v.q9, pr = t9.units * t9.price, b9 = pr + t9.transport, du = b9 * t9.duty, sb = b9 + du, va = sb * t9.vat, tl = sb + va;
      Q.push({ n: 9, area: 'scm', title: 'Total landed cost', intro: 'When evaluating suppliers, ' + nm + '\'s procurement team initially compared suppliers based on purchase price alone.', parts: [
        { id: '9a', pts: 5, prompt: 'Explain what "total landed cost" means and why it is a more appropriate basis for supplier comparison than purchase price alone.', open: true,
          model: '<p><b>Total landed cost</b> is the total cost of getting a product to your own door: purchase price + transport + insurance + customs duties + taxes + handling, inventory and other costs. It is a better basis because suppliers that look cheap on price can be expensive once these hidden costs (long-distance transport, duties, extra inventory for long and unreliable lead times) are added. Comparing on TLC shows the real cost of each option.</p>', check: ['Definition: all costs to get the goods to your location', 'Names several cost elements (transport, duties, taxes, inventory…)', 'Explains that a low price can hide higher total costs'], need: 3 },
        { id: '9b', pts: 5, prompt: nm + ' is evaluating a supplier in ' + t9.origin + ' for ' + t9.item + '. The supplier quotes an ex-works price of ' + E(t9.price, 2) + ' per unit for an order of ' + N(t9.units) + ' units. Transportation to ' + d.countryShort + ' costs ' + E(t9.transport) + '. Upon arrival, the goods are subject to a customs duty of ' + P(t9.duty, 0) + ', calculated on the sum of the purchase price and transport cost. Finally, VAT of ' + P(t9.vat, 0) + ' is levied on the total cost including customs duty. Calculate the total landed cost of this order.',
          fields: [f('Total landed cost (€)', tl, 'cur', 0)],
          model: steps(['Purchase price = ' + N(t9.units) + ' × ' + E(t9.price, 2) + ' = ' + E(pr), '+ transport = ' + E(pr) + ' + ' + E(t9.transport) + ' = ' + E(b9), 'Duty = ' + E(b9) + ' × ' + P(t9.duty, 0) + ' = ' + E(du) + ' → ' + E(sb), 'VAT = ' + E(sb) + ' × ' + P(t9.vat, 0) + ' = ' + E(va), '<b>Total landed cost = ' + E(tl) + '</b> (' + E(tl / t9.units, 3) + ' per unit)']) }
      ] });
    } else {
      var m9 = v.q9;
      Q.push({ n: 9, area: 'scm', title: 'Transport mode selection', intro: nm + ' needs to transport ' + m9.what + '. ' + m9.situation, parts: [
        { id: '9a', pts: 5, prompt: 'Recommend the two most suitable modes of transportation for this shipment. For each mode, explain your recommendation by aligning the characteristics of the product and situation with the selected mode.', open: true, model: m9.model, check: m9.check, need: m9.check.length },
        { id: '9b', pts: 5, prompt: nm + ' is considering expanding its supplier base to include a supplier in ' + m9.far + '. Explain how switching to this supplier might affect ' + nm + '\'s inventory levels at the ' + d.plant + ' facility.', open: true,
          model: '<p>A supplier in ' + m9.far + ' means a much <b>longer lead time</b> (sea freight of several weeks) and usually <b>more variability</b> (port congestion, customs, weather). As a result: <b>cycle stock ↑</b> (more days to cover between orders, and larger, consolidated orders such as full containers), <b>safety stock ↑</b> (more uncertainty), and more <b>in-transit (pipeline) inventory</b> that ' + nm + ' may own depending on the terms of sale. The reorder point must be raised to cover the longer lead-time demand. Total inventory, and its carrying cost, will rise even if the purchase price is lower — so compare on total landed cost.</p>', check: ['Longer lead time → more cycle stock / higher reorder point', 'More variability → more safety stock', 'In-transit inventory / larger orders', 'Link to higher carrying cost / total landed cost'], need: 3 }
      ] });
    }
    Q.forEach(function (q) { q.parts.forEach(function (p) { p.area = q.area; }); });
    return { html: caseHTML(d, x), questions: Q, d: d, x: x };
  }

  /* ===================== the two official mocks ===================== */
  var MOCK1 = {
    id: 'mock1', label: 'Mock exam 1 — VerdantFlow Logistics B.V.', name: 'VerdantFlow Logistics B.V.', short: 'VerdantFlow', form: 'B.V.', formNote: 'Dutch', country: 'the Netherlands', countryAdj: 'Dutch', countryShort: 'the Netherlands', plant: 'Rotterdam', year: 2024, T: 0.25, allCredit: true,
    overview: ['VerdantFlow Logistics B.V. is a Dutch trading company specialising in sustainable cold-chain packaging and logistics supplies, headquartered in Rotterdam. Established in 2011, it sources and distributes temperature-controlled packaging materials, refrigerant consumables and last-mile delivery equipment to food retailers, pharmaceutical distributors and e-commerce platforms across the Netherlands, Belgium and Germany. In 2024 it generated EUR 96 million in net sales revenue.', 'The company operates from a central warehousing and distribution hub in Rotterdam, with regional depots in Amsterdam, Antwerp and Düsseldorf. Ownership is split between the two founding partners (60%) and a growth-equity investor (40%); the firm is a limited liability company (besloten vennootschap, B.V.) under Dutch law.'],
    ops: ['Shares outstanding: 200,000 common shares; 50,000 preferred shares (6% cumulative preference dividend on EUR 10 par value). No common dividends declared this year; preferred dividends paid in full.', 'Cost of equity: 7.8% for common equity; 6.0% for preferred equity.', 'Sales are made exclusively on credit. Cost of goods sold for 2024 was EUR 48 million, of which EUR 36 million consisted of credit purchases from suppliers.', 'Three regional depots outside Rotterdam carry full-range buffer stock of traded goods. Supplier lead times average 30 days with a variability of ±8 days, requiring the company to hold 30 days of cycle stock and 8 days of safety stock.', 'Current sales mix: Netherlands 70%, Belgium 20%, Germany 10%. Management is targeting significant growth in the German market.', 'The company operates a competitive supplier-bidding process. Total inventory investment has been increasing year-on-year and currently stands above EUR 11 million.'],
    is: { sales: 96e6, varLines: [['Purchased goods (trading goods cost)', 36e6], ['Outbound freight & distribution', 960000], ['Sales commissions & packaging', 960000]], fixedLines: [['Depreciation: warehouse & equipment', 6.4e6], ['Facility lease & maintenance', 5.6e6], ['General & administrative', 7e6]], interest: 2.4e6 },
    cogs: 48e6, creditPurch: 36e6,
    bs: { cash: [8.5, 6.0], ar: [17.5, 14.5], inv: [11.5, 10.0], ppe: [58.0, 55.0], intang: [6.5, 6.0], ap: [15.0, 12.0], stb: [4.5, 3.5], ltd: [28.0, 26.0], pref: [5.0, 5.0], common: [30.0, 28.0], re: [19.5, 17.0] },
    pref: { n: 50000, par: 10, pct: 0.06 }, rp: 0.06, rs: 0.078, lead: { L: 30, v: 8 },
    poolHint: 'the three depots each carry full-range buffer stock; keep slow movers only in Rotterdam and supply depots from there.',
    sevenRsHint: 'the right cold-chain packaging, in the right condition (correct temperature), delivered at the right time to pharmaceutical clients.',
    material: 'cold-chain packaging',
    variants: {
      q1: { v: 'legal', profit: 1e6, wht: 0.15 },
      q3: { v: 'credit', segment: 'pharmaceutical distribution', s0: 9.6e6, s1: 12e6, cmr: 0.6, acp0: 45, acp1: 60, b0: 0.012, b1: 0.025, rrr: 0.10 },
      q4pts: [5, 7, 3], q4c: 'eps',
      q5: { v: 'wacc', proj: 0.07 },
      q6: { v: 'templates', price: 20, cashPct: 0.3, uplift: 4, target: { name: 'ThermoLink B.V.', cash: 0, ar: 8, inv: 0, nca: 16, cl: 4, ltd: 6, eq: 14 } },
      q7: { v: 'inventory', change: { f: 0.5, v2: 2, desc: 'reduce average lead times by 50% and cut variability to ±2 days' } },
      q8: { v: 'criteria' },
      q9: { v: 'tlc', origin: 'China', item: 'cold-chain packaging materials', price: 1.2, units: 5e6, transport: 800000, duty: 0.3, vat: 0.21 }
    }
  };
  var MOCK2 = {
    id: 'mock2', label: 'Mock exam 2 — Hartmann Precision AG', name: 'Hartmann Precision AG', short: 'Hartmann', form: 'AG', formNote: 'German', country: 'Germany', countryAdj: 'German', countryShort: 'Germany', plant: 'Stuttgart', year: 2024, T: 0.30, allCredit: true,
    overview: ['Hartmann Precision AG is a German manufacturer of high-performance industrial sealing components (gaskets, flanges and O-rings), headquartered in Stuttgart. Founded in 1987, it supplies the automotive, aerospace and chemical processing industries across Europe and North America, and holds ISO 9001 and IATF 16949 certifications. In 2024 it generated EUR 90 million in net sales revenue.', 'Hartmann operates two production facilities, its main plant in Stuttgart and a secondary facility in Prague, along with a sales and distribution subsidiary in Detroit, United States. It is an Aktiengesellschaft (AG) listed on the Frankfurt Stock Exchange. The Hartmann family retains a 55% controlling stake; the remaining 45% is held by public shareholders.'],
    ops: ['Hartmann sources specialty alloys, elastomers and polymer compounds from approved suppliers across Germany, Austria and Eastern Europe; materials from Eastern Europe are transported to Stuttgart by road.', 'Supplier lead times average 18 days with a variability of ±6 days, requiring 18 days of cycle stock and 6 days of safety stock at each facility. Hartmann uses a competitive bidding process and awards contracts to the lowest bidder. Inventory investment is above €15 million and rising.', 'Finished goods are distributed from Stuttgart directly to industrial customers. Hartmann offers standard credit terms and buys most raw materials on credit.', 'Sales mix: automotive 50%, aerospace 30%, chemical 20%; Europe 75%, North America 20%, Asia 5%.', 'Preferred dividend: 40,000 shares outstanding at EUR 150 par value, carrying a 5% cumulative preference dividend. Cost of preferred equity 5.5%; cost of common equity 8.2%.'],
    is: { sales: 90e6, varLines: [['Direct material costs', 27e6], ['Direct labour', 13.5e6], ['Variable manufacturing overhead', 5.4e6], ['Variable selling expenses', 3.6e6]], fixedLines: [['Depreciation', 6.5e6], ['Fixed manufacturing overhead', 5.2e6], ['General & administrative', 6.3e6]], interest: 2.8e6 },
    isNote: 'All sales are on credit. Cost of goods sold for 2024 was EUR 49,500,000, of which EUR 28,000,000 consisted of credit purchases from suppliers.',
    cogs: 49.5e6, creditPurch: 28e6,
    bs: { cash: [4.5, 3.8], ar: [18.0, 15.5], inv: [15.0, 13.0], ppe: [58.0, 54.0], intang: [9.5, 8.5], ap: [8.0, 7.2], stb: [5.0, 4.0], ltd: [32.0, 29.0], pref: [6.0, 6.0], common: [38.0, 35.0], re: [16.0, 13.6] },
    pref: { n: 40000, par: 150, pct: 0.05 }, rp: 0.055, rs: 0.082, lead: { L: 18, v: 6 },
    poolHint: 'both plants hold their own buffers; pool safety stock where possible.',
    sevenRsHint: 'the right O-rings, in the right condition (within tolerance), delivered at the right time for the customer\'s production line.',
    material: 'specialty alloys',
    variants: {
      q1: { v: 'market', exchange: 'the Frankfurt Stock Exchange', bid: 38.2, ask: 38.5, shares: 200, steps: [
        { t: 'The Hartmann family founded the company in 1987, investing €200,000 of personal capital in exchange for 100% ownership.', y: true, why: 'The family buys newly issued shares: the €200,000 goes into the company (primary).' },
        { t: 'The Hartmann family sells 40% of their stake in the company to a venture capital firm for €800,000.', y: false, why: 'Existing shares change hands: the €800,000 goes to the family, not to the company (secondary).' },
        { t: 'Hartmann issued €2,000,000 worth of new shares to a group of private investors.', y: true, why: 'New shares are issued: the company receives €2,000,000 (primary, private placement).' },
        { t: 'Hartmann went public on the Frankfurt Stock Exchange, issuing no additional shares. The company was valued at €12,000,000 at the time of the IPO.', y: false, why: 'No new shares are issued, so the company raises nothing; only existing shareholders can sell.' }] },
      q3: { v: 'options', amt: 500000, bank1: 'Stuttgart Landesbank', X: 6, d1: 120, bank2: 'Rhine Capital', Y: 13, d2: 60, supplier: 'AlloyCraft Suppliers (specialty alloy components)', cd: 2, y: 15, z: 60, recurring: false },
      q4pts: [5, 5, 5], q4c: 'compare',
      q5: { v: 'tax', city: 'Detroit', country: 'the United States', pretax: 1e6, fr: 0.35 },
      q6: { v: 'explain', uplift: 2.5, target: { name: 'Merano Components S.r.l.', desc: 'an Italian manufacturer of precision-stamped metal parts', eq: 0 }, price: 4,
        partial: [0.9, 23.0, 15.0, 4.0, 68.0, 9.5, 120.4, 16.0, 0, 44.4, 60.4, 60.0, 120.4] },
      q7: { v: 'logistics' },
      q8: { v: 'supplier', change: { f: 0.5, v2: 6.6, desc: 'reduce average delivery times by 50% but is 10% less reliable than the existing supplier' } },
      q9: { v: 'mode', what: 'large quantities of specialty alloys and polymer compounds from suppliers in Eastern Europe and Central Asia to its Stuttgart production facility', far: 'South Korea',
        situation: 'The materials are heavy, relatively low in value per kilogram, and non-perishable. Hartmann\'s current reorder point is reached when there is enough inventory to meet 3 weeks of production demand. The cost of stockouts is high.',
        model: '<ul><li><b>Rail</b>: high capacity and low cost per ton suit heavy, low-value bulk over long land distances (Eastern Europe, Central Asia). Slower transit is acceptable because the goods are not perishable and the reorder point gives 3 weeks of cover.</li><li><b>Truck</b> (alone from Eastern Europe, or with rail as intermodal): door-to-door accessibility and high reliability protect against the high cost of stockouts and cover the first/last mile to the Stuttgart plant.</li><li>Not air (far too expensive for low-value heavy goods), not pipeline (liquids/gas only); water is less suitable for land-locked routes to Stuttgart.</li></ul>', check: ['Mode 1 named and linked to product characteristics (heavy, low value, non-perishable)', 'Mode 2 named and linked to the situation (stockout cost, reorder point, accessibility)'] }
    }
  };
  // Mock 2 Q6: partially consolidated BS has no short-term borrowings line; reuse the template with 0
  /* ===================== random case generator ===================== */
  var COMPANIES = [
    { name: 'Nordwind Fasteners GmbH', short: 'Nordwind', form: 'GmbH', formNote: 'German', country: 'Germany', countryAdj: 'German', countryShort: 'Germany', plant: 'Bremen', T: 0.30, kind: 'mfg', what: 'industrial bolts, rivets and fasteners', customers: 'wind-turbine builders, shipyards and machine makers', city: 'Bremen', material: 'steel wire rod', item: 'stainless steel fittings' },
    { name: 'Lumora Lighting B.V.', short: 'Lumora', form: 'B.V.', formNote: 'Dutch', country: 'the Netherlands', countryAdj: 'Dutch', countryShort: 'the Netherlands', plant: 'Eindhoven', T: 0.25, kind: 'mfg', what: 'LED lighting systems for offices and warehouses', customers: 'installers, wholesalers and facility managers', city: 'Eindhoven', material: 'LED chips and aluminium housings', item: 'LED driver modules' },
    { name: 'Freshline Foods Trading B.V.', short: 'Freshline', form: 'B.V.', formNote: 'Dutch', country: 'the Netherlands', countryAdj: 'Dutch', countryShort: 'the Netherlands', plant: 'Venlo', T: 0.25, kind: 'trade', what: 'chilled and frozen convenience foods', customers: 'supermarkets, caterers and online grocers', city: 'Venlo', material: 'frozen vegetables', item: 'insulated shipping boxes' },
    { name: 'Alpenglas AG', short: 'Alpenglas', form: 'AG', formNote: 'German', country: 'Germany', countryAdj: 'German', countryShort: 'Germany', plant: 'Munich', T: 0.30, kind: 'mfg', what: 'technical glass for laboratories and the solar industry', customers: 'lab-equipment makers, universities and solar-panel producers', city: 'Munich', material: 'quartz sand and soda ash', item: 'glass tubing' },
    { name: 'Velocita Bike Components S.p.A.', short: 'Velocita', form: 'S.p.A.', formNote: 'Italian', country: 'Italy', countryAdj: 'Italian', countryShort: 'Italy', plant: 'Verona', T: 0.24, kind: 'mfg', what: 'bicycle drivetrains and brake systems', customers: 'bicycle brands and specialist dealers', city: 'Verona', material: 'aluminium alloys', item: 'bicycle chains' },
    { name: 'Polaris Medical Supplies B.V.', short: 'Polaris', form: 'B.V.', formNote: 'Dutch', country: 'the Netherlands', countryAdj: 'Dutch', countryShort: 'the Netherlands', plant: 'Utrecht', T: 0.25, kind: 'trade', what: 'disposable medical supplies (gloves, syringes, dressings)', customers: 'hospitals, pharmacies and care homes', city: 'Utrecht', material: 'nitrile gloves', item: 'nitrile examination gloves' },
    { name: 'Kronberg Pumps AG', short: 'Kronberg', form: 'AG', formNote: 'German', country: 'Germany', countryAdj: 'German', countryShort: 'Germany', plant: 'Dortmund', T: 0.30, kind: 'mfg', what: 'industrial pumps and valves', customers: 'water utilities, chemical plants and food processors', city: 'Dortmund', material: 'cast iron and stainless steel castings', item: 'pump seals' }
  ];
  var TARGETS = ['Brightway Components B.V.', 'Tecnoforma S.r.l.', 'Ostsee Logistik GmbH', 'Flandria Parts N.V.', 'Danubia Tech Kft.', 'Iberica Moldes S.L.'];
  var FAR = [['China', 'Shanghai'], ['South Korea', 'Busan'], ['Vietnam', 'Ho Chi Minh City'], ['India', 'Chennai'], ['Brazil', 'Santos']];
  var SUBS = [['United States', 'Chicago', 0.21], ['United States', 'Atlanta', 0.35], ['Canada', 'Toronto', 0.27], ['Poland', 'Wrocław', 0.19], ['Mexico', 'Monterrey', 0.30], ['United Kingdom', 'Leeds', 0.25]];
  var MODE_SCEN = [
    { what: 'large volumes of heavy, low-value raw materials (%MAT%) from suppliers in Eastern Europe to its %PLANT% plant', situation: 'The materials are heavy, low in value per kilogram and non-perishable. The reorder point is reached when there is enough stock for 3 weeks of production. Stockouts are very costly.', model: '<ul><li><b>Rail</b>: low cost per ton and high capacity for heavy, low-value goods over long land distances; speed is less important for non-perishable goods with 3 weeks of cover.</li><li><b>Truck</b> (or rail + truck intermodal): door-to-door accessibility and reliability protect against costly stockouts.</li><li>Not air (too expensive), not pipeline (liquids only).</li></ul>', check: ['Rail (or water) linked to heavy / low value / non-perishable', 'Truck or intermodal linked to accessibility / reliability / stockout cost'] },
    { what: 'small batches of high-value, urgently needed spare parts to customers in North America', situation: 'Each shipment weighs less than 100 kg but is worth more than €50,000. Customers\' production lines stop if parts arrive late.', model: '<ul><li><b>Air</b>: fastest transit for high-value, light, urgent goods; the high rate is small relative to the value and to the cost of a stopped line.</li><li><b>Truck</b>: pickup and final delivery to the customer\'s door (air needs truck at both ends); reliable and accessible.</li><li>Not water/rail: far too slow for urgent needs.</li></ul>', check: ['Air linked to high value / urgency / low weight', 'Truck linked to door-to-door delivery / accessibility'] },
    { what: 'full containers of finished goods from its Asian contract manufacturer to the European distribution centre', situation: 'Volumes are large and predictable, the goods are medium value and not time-critical, and the company wants the lowest cost per unit.', model: '<ul><li><b>Water (ocean container)</b>: lowest cost per unit for large, predictable intercontinental volumes; slow but acceptable for planned, non-urgent flows.</li><li><b>Rail or truck</b> from the port to the DC (intermodal): reaches the inland DC; rail for longer inland distances, truck for flexibility.</li></ul>', check: ['Water linked to large volume / intercontinental / low cost', 'Rail or truck linked to inland leg / accessibility'] }
  ];

  function generate(seed) {
    var r = new FSM.RNG(seed), co = r.pick(COMPANIES);
    var t10 = function (v) { return Math.round(v * 10) / 10; };
    var S = r.range(60, 160, 0.5) * 1e6, vr = r.range(0.42, 0.6, 0.01), V = Math.round(S * vr / 1e5) * 1e5;
    var CM = S - V, FC = Math.round(CM * r.range(0.4, 0.62, 0.01) / 1e5) * 1e5;
    var varLines = co.kind === 'mfg' ? [['Direct material costs', 0.5], ['Direct labour', 0.27], ['Variable manufacturing overhead', 0.13], ['Variable selling expenses', 0.10]] : [['Purchased goods', 0.86], ['Outbound freight & distribution', 0.08], ['Sales commissions & packaging', 0.06]];
    var acc = 0; varLines = varLines.map(function (l, i) { var v = i === varLines.length - 1 ? V - acc : Math.round(V * l[1] / 1e5) * 1e5; acc += v; return [l[0], v]; });
    var fixedLines = [['Depreciation', 0.36], ['Fixed overhead & facilities', 0.30], ['General & administrative', 0.34]];
    acc = 0; fixedLines = fixedLines.map(function (l, i) { var v = i === 2 ? FC - acc : Math.round(FC * l[1] / 1e5) * 1e5; acc += v; return [l[0], v]; });
    var cogs = Math.round(S * r.range(0.45, 0.6, 0.01) / 1e5) * 1e5, cp = Math.round(cogs * r.range(0.5, 0.8, 0.01) / 1e5) * 1e5;
    var Sm = S / 1e6, cm = cogs / 1e6, cpm = cp / 1e6;
    var ar1 = t10(Sm * r.int(40, 75) / 365), ar0 = t10(ar1 * r.range(0.82, 0.95, 0.01));
    var inv1 = t10(cm * r.int(55, 110) / 365), inv0 = t10(inv1 * r.range(0.82, 0.95, 0.01));
    var ap1 = t10(cpm * r.int(55, 120) / 365), ap0 = t10(ap1 * r.range(0.85, 0.97, 0.01));
    var cash1 = t10(r.range(3, 9, 0.1)), cash0 = t10(r.range(2.5, 8, 0.1)), stb1 = t10(r.range(2, 6, 0.1)), stb0 = t10(stb1 * 0.85);
    var ltd1 = t10(Sm * r.range(0.22, 0.4, 0.01)), ltd0 = t10(ltd1 * r.range(0.88, 0.97, 0.01));
    var rd = r.range(0.055, 0.09, 0.005), interest = Math.round(ltd1 * rd * 10) / 10 * 1e6;
    var EBIT = CM - FC; if (interest > EBIT * 0.35) interest = Math.round(EBIT * 0.2 / 1e5) * 1e5;
    var par = r.pick([10, 25, 50, 100, 150]), prefT = r.range(3, 9, 0.5), nP = Math.round(prefT * 1e6 / par / 10000) * 10000, pref = t10(nP * par / 1e6), ppct = r.pick([0.05, 0.06, 0.07, 0.08]);
    var common1 = t10(r.range(22, 45, 0.5)), common0 = common1 - r.pick([0, 2, 3]), re1 = t10(r.range(10, 26, 0.5)), re0 = t10(re1 - r.range(1.5, 4, 0.1));
    var intang1 = t10(r.range(3, 10, 0.5)), intang0 = t10(intang1 * 0.92);
    var ppe1 = t10(ap1 + stb1 + ltd1 + pref + common1 + re1 - cash1 - ar1 - inv1 - intang1);
    if (ppe1 < 15) { var add = t10(20 - ppe1); common1 = t10(common1 + add); common0 = t10(common0 + add); ppe1 = t10(ppe1 + add); }
    var ppe0 = t10(ap0 + stb0 + ltd0 + pref + common0 + re0 - cash0 - ar0 - inv0 - intang0);
    if (ppe0 < 10) { var add0 = t10(14 - ppe0); re0 = t10(re0 + add0); ppe0 = t10(ppe0 + add0); }
    var T = co.T, L = r.pick([14, 18, 21, 25, 30]), vv = r.pick([4, 5, 6, 8]);
    var rp = t10(r.range(5, 7.5, 0.1)) / 100, rs = Math.round((rp + r.range(0.015, 0.035, 0.001)) * 1000) / 1000;
    var d = {
      id: 'gen' + seed, label: 'Random case — version ' + seed, name: co.name, short: co.short, form: co.form, formNote: co.formNote, country: co.country, countryAdj: co.countryAdj, countryShort: co.countryShort, plant: co.plant, year: 2024, T: T, allCredit: true,
      overview: [co.name + ' is a ' + co.formNote + ' ' + (co.kind === 'mfg' ? 'manufacturer' : 'trading company') + ' of ' + co.what + ', headquartered in ' + co.city + '. It supplies ' + co.customers + ' and generated EUR ' + F.num(Sm, 1) + ' million in net sales revenue in 2024.', 'The company is structured as a' + (/^[AEIOU]/.test(co.form) ? 'n ' : ' ') + co.form + '. The founding family owns ' + r.pick([51, 55, 60, 65]) + '% of the shares; the rest is held by ' + r.pick(['a private-equity investor', 'public shareholders', 'a growth-equity fund']) + '.'],
      ops: [F.num(nP) + ' preferred shares outstanding (EUR ' + par + ' par value, ' + P(ppct, 0) + ' cumulative preference dividend, paid in full). Cost of preferred equity ' + P(rp, 1) + '; cost of common equity ' + P(rs, 1) + '.', 'All sales are on credit. Cost of goods sold for 2024 was EUR ' + F.num(cm, 1) + ' million, of which EUR ' + F.num(cpm, 1) + ' million consisted of credit purchases from suppliers.', 'Supplier lead times average ' + L + ' days with a variability of ±' + vv + ' days, requiring ' + L + ' days of cycle stock and ' + vv + ' days of safety stock' + (co.kind === 'trade' ? ' at each of its three regional depots, which all carry the full range.' : '.'), 'Suppliers are selected through a competitive bidding process on price. Inventory investment has risen year-on-year.', 'Management is targeting growth in ' + r.pick(['Germany', 'France', 'Scandinavia', 'North America', 'Poland']) + '.'],
      is: { sales: S, varLines: varLines, fixedLines: fixedLines, interest: interest },
      cogs: cogs, creditPurch: cp,
      bs: { cash: [cash1, cash0], ar: [ar1, ar0], inv: [inv1, inv0], ppe: [ppe1, ppe0], intang: [intang1, intang0], ap: [ap1, ap0], stb: [stb1, stb0], ltd: [ltd1, ltd0], pref: [pref, pref], common: [common1, common0], re: [re1, re0] },
      pref: { n: nP, par: par, pct: ppct }, rp: rp, rs: rs, lead: { L: L, v: vv },
      poolHint: co.kind === 'trade' ? 'the three depots each hold the full range; keep slow movers in one central location.' : 'hold safety stock centrally instead of at every location.',
      sevenRsHint: 'the right ' + co.what.split(' ')[0] + ' products, in the right condition, at the right time for ' + co.customers.split(',')[0] + '.',
      material: co.material, variants: {}
    };
    var x0 = derive(d);
    // variants
    var vq = d.variants;
    vq.q1 = r.chance(0.5) ? { v: 'legal', profit: r.pick([1, 2, 5]) * 1e6, wht: r.pick([0.15, 0.15, 0.2, 0.25]) } : (function () {
      var bid = r.range(15, 90, 0.05), sp = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]);
      var a = r.range(100, 500, 50) * 1000, vc = r.range(4, 12, 1) * a / 2, np = r.range(1, 5, 0.5) * 1e6;
      return { v: 'market', exchange: r.pick(['Euronext Amsterdam', 'the Frankfurt Stock Exchange', 'Borsa Italiana']), bid: Math.round(bid * 100) / 100, ask: Math.round((bid + sp) * 100) / 100, shares: r.pick([100, 200, 300, 500]), steps: r.shuffle([
        { t: 'The founders started the company, investing ' + E(a) + ' of their own money for 100% of the shares.', y: true, why: 'New shares issued to the founders: the money goes into the company.' },
        { t: 'The founders sold ' + r.pick([20, 30, 40]) + '% of their shares to a venture capital firm for ' + E(vc) + '.', y: false, why: 'Existing shares are sold: the money goes to the founders (secondary).' },
        { t: 'The company issued ' + E(np) + ' of new shares to private investors.', y: true, why: 'New shares: the company receives the money (primary).' },
        { t: 'The company listed on the stock exchange at a value of ' + E(r.range(10, 40, 1) * 1e6) + ', issuing no new shares.', y: false, why: 'No new shares are issued, so the company raises nothing.' }]) };
    })();
    vq.q3 = r.chance(0.5) ? (function () { var s0 = r.range(4, 15, 0.1) * 1e6; return { v: 'credit', segment: r.pick(['wholesale', 'small-business', 'export', 'online-retail']), s0: s0, s1: Math.round(s0 * r.range(1.1, 1.35, 0.01) / 1e4) * 1e4, cmr: r.pick([0.3, 0.35, 0.4, 0.5, 0.6]), acp0: r.pick([30, 40, 45]), acp1: r.pick([50, 60, 75]), b0: r.pick([0.01, 0.012, 0.015, 0.02]), b1: r.pick([0.025, 0.03, 0.04, 0.05]), rrr: r.pick([0.08, 0.1, 0.12, 0.15]) }; })()
      : { v: 'options', amt: r.range(2, 10, 1) * 100000, bank1: r.pick(['Nordbank', 'Rhein Kreditbank', 'Harborview Trust Bank']), X: r.pick([4, 5, 6, 7]), d1: r.pick([90, 120, 150, 180]), bank2: r.pick(['Crestline Capital', 'Delta Savings Bank', 'Summit National Bank']), Y: r.range(8, 16, 1), d2: r.pick([30, 45, 60, 90]), supplier: r.pick(['FuelMaster Suppliers', 'PolyChem Trading', 'MetalLink Supplies']), cd: r.pick([1, 1.5, 2, 2.5]), y: r.pick([10, 15, 20]), z: r.pick([45, 60, 75]), recurring: r.chance(0.35) };
    vq.q4pts = r.pick([[5, 7, 3], [5, 5, 5]]); vq.q4c = vq.q4pts[2] === 3 ? 'eps' : 'compare';
    if (r.chance(0.55)) {
      var D = x0.ltd[0], Pf = x0.pref[0], Sx = x0.common[0] + x0.re[0], Tt = D + Pf + Sx, rdd = interest / 1e6 / D;
      var w = D / Tt * rdd * (1 - T) + Pf / Tt * rp + Sx / Tt * rs;
      vq.q5 = { v: 'wacc', proj: Math.round((w + r.pick([-1, 1]) * r.range(0.004, 0.012, 0.001)) * 200) / 200 };
    } else { var sb = r.pick(SUBS); vq.q5 = { v: 'tax', country: 'the ' + sb[0].replace(/^the /, ''), city: sb[1], fr: sb[2], pretax: r.pick([0.5, 1, 1.5, 2]) * 1e6 }; if (!/^United/.test(sb[0])) vq.q5.country = sb[0]; }
    var teq = t10(r.range(6, 18, 0.5)), tcl = t10(r.range(2, 6, 0.5)), tltd = t10(r.range(2, 8, 0.5)), tTA = teq + tcl + tltd;
    var tcash = t10(r.range(0.2, 1.5, 0.1)), tar = t10(tTA * r.range(0.15, 0.25, 0.01)), tinv = t10(tTA * r.range(0.1, 0.2, 0.01)), tnca = t10(tTA - tcash - tar - tinv);
    var price = Math.round(teq * r.range(1.2, 1.6, 0.05) * 2) / 2, exc = t10(price - teq), upl = t10(Math.max(0.5, Math.min(exc - 0.5, exc * r.range(0.3, 0.7, 0.1))));
    var cpct = r.pick([0.1, 0.2, 0.3, 0.4]); while (cpct > 0 && price * cpct > cash1 - 0.5) cpct -= 0.1; cpct = Math.max(0, Math.round(cpct * 10) / 10);
    vq.q6 = { v: 'templates', price: price, cashPct: cpct, uplift: upl, target: { name: r.pick(TARGETS), cash: tcash, ar: tar, inv: tinv, nca: tnca, cl: tcl, ltd: tltd, eq: teq } };
    var f1 = r.pick([0.5, 0.6, 0.7]);
    var good = r.chance(0.5);
    var ch = good ? { f: f1, v2: r.pick([1, 2, 3].filter(function (k) { return k < vv; })), desc: 'reduce average lead times by ' + F.num((1 - f1) * 100) + '% and cut variability to ±' } : { f: f1, v2: t10(vv * 1.1), desc: 'reduce average delivery times by ' + F.num((1 - f1) * 100) + '% but is 10% less reliable than the existing supplier' };
    if (good) ch.desc += ch.v2 + ' days';
    if (r.chance(0.5)) { vq.q7 = { v: 'inventory', change: ch }; vq.q8 = { v: 'criteria' }; }
    else { vq.q7 = { v: 'logistics' }; vq.q8 = r.chance(0.5) ? { v: 'supplier', change: ch } : { v: 'criteria' }; }
    if (r.chance(0.5)) { var fr = r.pick(FAR); vq.q9 = { v: 'tlc', origin: fr[0], item: co.item, price: r.range(0.5, 4, 0.05), units: r.pick([0.5, 1, 2, 4, 5]) * 1e6, duty: r.pick([0.05, 0.1, 0.12, 0.2, 0.3]), vat: co.country === 'Germany' ? 0.19 : co.country === 'Italy' ? 0.22 : 0.21 }; vq.q9.price = Math.round(vq.q9.price * 100) / 100; vq.q9.transport = Math.round(vq.q9.units * vq.q9.price * r.range(0.06, 0.2, 0.01) / 1e4) * 1e4; }
    else { var ms = r.pick(MODE_SCEN); vq.q9 = { v: 'mode', what: ms.what.replace('%MAT%', co.material).replace('%PLANT%', co.plant), situation: ms.situation, model: ms.model, check: ms.check, far: r.pick(FAR)[0] }; }
    return d;
  }

  FSM.cases = { buildExam: buildExam, generate: generate, MOCKS: [MOCK1, MOCK2], derive: derive };
})(typeof window !== 'undefined' ? window : globalThis);
