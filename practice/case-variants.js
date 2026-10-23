/* Extra question variants for the case exam, covering slide topics the two mocks did not use.
   FSM.caseVariants[slot][name](d, x, params) → question; FSM.caseVariantParams[slot][name](r, d, x) → params. */
(function (root) {
  var FSM = root.FSM, F = FSM.fmt, H = FSM.caseHelpers;
  var E = H.E, Em = H.Em, P = H.P, N = H.N, r1 = H.r1, steps = H.steps, f = H.f;
  var V = FSM.caseVariants = { q1: {}, q2: {}, q3: {}, q4: {}, q5: {}, q6: {}, q7: {}, q8: {}, q9: {} };
  var VP = FSM.caseVariantParams = { q1: {}, q2: {}, q3: {}, q4: {}, q5: {}, q6: {}, q7: {}, q8: {}, q9: {} };

  /* ===================== Q1 (10p) ===================== */
  VP.q1.ratios = function (r) { return { shares: r.pick([1, 2, 2.5, 4, 5]) * 1e6 }; };
  V.q1.ratios = function (d, x, p) {
    var nm = d.short, ca = x.ca[0], cl = x.cl[0], inv = x.inv[0], ta = x.ta[0], tl = x.tl[0], ce = r1(x.common[0] + x.re[0]);
    var eacs = x.NI - x.PD, cr = ca / cl, qr = (ca - inv) / cl, dr = tl / ta, roe = eacs / (ce * 1e6), eps = eacs / p.shares;
    return { n: 1, area: 'fin', title: 'Financial statements & ratios', intro: nm + ' has ' + N(p.shares) + ' common shares outstanding. Use the ' + d.year + ' figures.', parts: [
      { id: '1a', pts: 5, prompt: 'Calculate ' + nm + '\'s current ratio, quick ratio and debt ratio for ' + d.year + '.', fields: [f('Current ratio', cr, 'x', 2, 0.01), f('Quick ratio', qr, 'x', 2, 0.01), f('Debt ratio', dr, 'pct', 2)],
        model: steps(['Current ratio = CA ÷ CL = ' + F.num(ca, 1) + ' ÷ ' + F.num(cl, 1) + ' = <b>' + F.num(cr, 2) + '</b>', 'Quick ratio = (CA − inventory) ÷ CL = (' + F.num(ca, 1) + ' − ' + F.num(inv, 1) + ') ÷ ' + F.num(cl, 1) + ' = <b>' + F.num(qr, 2) + '</b>', 'Debt ratio = total liabilities ÷ total assets = ' + F.num(tl, 1) + ' ÷ ' + F.num(ta, 1) + ' = <b>' + P(dr) + '</b>']) },
      { id: '1b', pts: 5, prompt: 'Calculate ' + nm + '\'s return on equity (ROE) and earnings per share (EPS) for ' + d.year + '.', fields: [f('ROE', roe, 'pct', 2), f('EPS (€)', eps, 'cur', 2, 0.02)],
        model: steps(['Preferred dividend = ' + N(d.pref.n) + ' × ' + E(d.pref.par) + ' × ' + P(d.pref.pct, 0) + ' = ' + E(x.PD), 'Earnings available for common = ' + E(x.NI) + ' − ' + E(x.PD) + ' = ' + E(eacs), 'Common stock equity = common equity + retained earnings = ' + F.num(x.common[0], 1) + ' + ' + F.num(x.re[0], 1) + ' = ' + Em(ce), 'ROE = ' + E(eacs) + ' ÷ ' + E(ce * 1e6) + ' = <b>' + P(roe) + '</b>', 'EPS = ' + E(eacs) + ' ÷ ' + N(p.shares) + ' = <b>' + E(eps, 2) + '</b>']) }
    ] };
  };

  VP.q1.taxforms = function (r) { return { profit: r.pick([80, 100, 120, 150, 200]) * 1000, b1: r.pick([40, 50, 60]) * 1000, t1: r.pick([0.2, 0.25]), t2: r.pick([0.3, 0.37, 0.4]), corp: r.pick([0.19, 0.25]), div: r.pick([0.15, 0.2, 0.25]) }; };
  V.q1.taxforms = function (d, x, p) {
    var nm = d.short, sp = Math.min(p.profit, p.b1) * p.t1 + Math.max(0, p.profit - p.b1) * p.t2, ct = p.profit * p.corp, dv = (p.profit - ct) * p.div, co = ct + dv;
    return { n: 1, area: 'fin', title: 'Legal forms & taxes', intro: 'Before ' + nm + ' was incorporated, the founder ran the business on her own. Suppose the business earns ' + E(p.profit) + ' profit. Personal income tax: ' + P(p.t1, 0) + ' on income up to ' + E(p.b1) + ' and ' + P(p.t2, 0) + ' above that. Corporate tax: flat ' + P(p.corp, 0) + '. Dividend tax: ' + P(p.div, 0) + '. As a corporation, all profit is paid out as a dividend.', parts: [
      { id: '1a', pts: 4, prompt: 'Give two advantages and two disadvantages of a corporation compared with a sole proprietorship.', open: true,
        model: '<ul><li>Advantages: <b>limited liability</b>; easy to raise large amounts by selling shares; shares easy to transfer; long life; can hire professional managers.</li><li>Disadvantages: <b>double taxation</b> (corporate tax + dividend tax); more expensive to set up; more regulation; less secrecy (must publish results).</li></ul>', check: ['Advantage 1', 'Advantage 2', 'Disadvantage 1', 'Disadvantage 2'], need: 4 },
      { id: '1b', pts: 6, prompt: 'Calculate the total tax and the effective tax rate under both legal forms.', fields: [f('Total tax, sole proprietorship (€)', sp, 'cur', 0), f('Total tax, corporation (€)', co, 'cur', 0), f('Effective rate, corporation', co / p.profit, 'pct', 2)],
        model: steps(['Sole proprietorship: ' + E(Math.min(p.profit, p.b1)) + ' × ' + P(p.t1, 0) + (p.profit > p.b1 ? ' + ' + E(p.profit - p.b1) + ' × ' + P(p.t2, 0) : '') + ' = <b>' + E(sp) + '</b> (' + P(sp / p.profit) + ')', 'Corporation: corporate tax ' + E(p.profit) + ' × ' + P(p.corp, 0) + ' = ' + E(ct) + '; dividend ' + E(p.profit - ct) + ' × ' + P(p.div, 0) + ' = ' + E(dv), 'Total = <b>' + E(co) + '</b>; effective rate = ' + E(co) + ' ÷ ' + E(p.profit) + ' = <b>' + P(co / p.profit) + '</b>']) }
    ] };
  };

  VP.q1.cashaccrual = function (r) { var cost = r.range(1, 6, 0.1) * 1e6; return { cost: cost, sales: Math.round(cost * r.range(1.15, 1.5, 0.01) / 1e4) * 1e4, coll: r.pick([0.6, 0.7, 0.75, 0.8, 0.85]), borrow: r.pick([0, 0, 200000, 500000]) }; };
  V.q1.cashaccrual = function (d, x, p) {
    var nm = d.short, prof = p.sales - p.cost, cash = p.sales * p.coll - p.cost;
    return { n: 1, area: 'fin', title: 'Cash vs accrual', intro: 'In its first year a new product line of ' + nm + ' bought goods for ' + E(p.cost) + ', all paid in cash before delivery. It sold all of them on credit for ' + E(p.sales) + ' and collected ' + P(p.coll, 0) + ' of the receivables before year-end.' + (p.borrow ? ' To bridge the gap it borrowed ' + E(p.borrow) + ' short-term.' : ''), parts: [
      { id: '1a', pts: 6, prompt: 'Calculate the accounting profit (accrual basis) and the operating cash flow (cash basis) of this product line.', fields: [f('Accounting profit (€)', prof, 'cur', 0), f('Operating cash flow (€)', cash, 'cur', 0)],
        model: steps(['Profit = sales − cost = ' + E(p.sales) + ' − ' + E(p.cost) + ' = <b>' + E(prof) + '</b>', 'Cash collected = ' + E(p.sales) + ' × ' + P(p.coll, 0) + ' = ' + E(p.sales * p.coll), 'Operating cash flow = ' + E(p.sales * p.coll) + ' − ' + E(p.cost) + ' = <b>' + (cash < 0 ? '−' : '') + E(Math.abs(cash)) + '</b>' + (p.borrow ? ' (the loan is a <b>financing</b> cash flow, not operating)' : '')]) },
      { id: '1b', pts: 4, prompt: 'Explain why profit and cash flow differ, and what this means for ' + nm + ' if this product line keeps growing.', open: true,
        model: '<p>Accounting records the sale when it happens (accrual); finance looks at cash. The difference is the money still owed by customers (' + E(p.sales * (1 - p.coll)) + '). If sales keep growing on credit, receivables grow too, so cash lags behind profit and the company may need to borrow — a profitable firm can still run out of cash. It should collect faster (shorter terms, discounts, monitoring) and/or pay suppliers later.</p>', check: ['Accrual vs cash explained', 'Receivables cause the gap', 'Growth → more cash tied up / liquidity risk', 'A concrete improvement'], need: 3 }
    ] };
  };

  /* ===================== Q2 (10p) ===================== */
  VP.q2.opcycle = function () { return {}; };
  V.q2.opcycle = function (d, x) {
    var nm = d.short, ai = H.avg(x.inv), aar = H.avg(x.ar), aap = H.avg(x.ap), cm = d.cogs / 1e6, sm = d.is.sales / 1e6, cp = d.creditPurch / 1e6;
    var aai = 365 / (cm / ai), acp = aar / (sm / 365), app = aap / (cp / 365), oc = aai + acp, ccc = oc - app;
    return { n: 2, area: 'fin', title: 'Operating cycle', parts: [
      { id: '2a', pts: 6, prompt: 'Calculate ' + nm + '\'s operating cycle and cash conversion cycle for ' + d.year + '.', fields: [f('Operating cycle (days)', oc, 'days', 1, 0.8), f('CCC (days)', ccc, 'days', 1, 0.8)],
        model: steps(['AAI = 365 ÷ (' + F.num(cm, 1) + ' ÷ ' + F.num(ai, 2) + ') = ' + F.num(aai, 2) + ' days', 'ACP = ' + F.num(aar, 2) + ' ÷ (' + F.num(sm, 1) + ' ÷ 365) = ' + F.num(acp, 2) + ' days', 'APP = ' + F.num(aap, 2) + ' ÷ (' + F.num(cp, 1) + ' ÷ 365) = ' + F.num(app, 2) + ' days', 'Operating cycle = AAI + ACP = <b>' + F.num(oc, 2) + ' days</b>', 'CCC = OC − APP = <b>' + F.num(ccc, 2) + ' days</b>']) },
      { id: '2b', pts: 4, prompt: 'Describe three ways ' + nm + ' could shorten its cash conversion cycle, and one risk of doing so.', open: true,
        model: '<ul><li><b>Reduce inventory days</b>: better forecasting, JIT, fewer slow movers (AAI ' + F.num(aai, 0) + ' days).</li><li><b>Collect faster</b>: stricter credit selection, shorter terms, an early-payment discount, active monitoring (ACP ' + F.num(acp, 0) + ' days).</li><li><b>Pay suppliers later</b>: negotiate longer terms (APP ' + F.num(app, 0) + ' days).</li><li>Risk: stricter credit loses sales; paying later can hurt supplier relationships; too little stock causes stockouts.</li></ul>', check: ['Inventory lever', 'Receivables lever', 'Payables lever', 'A risk/trade-off'], need: 4 }
    ] };
  };

  /* ===================== Q3 (15p) ===================== */
  VP.q3.discount = function (r) { var s0 = r.range(2, 12, 0.1) * 1e6; return { s0: s0, s1: Math.round(s0 * r.range(1.02, 1.1, 0.01) / 1e4) * 1e4, cmr: r.pick([0.25, 0.3, 0.35, 0.4]), d: r.pick([1, 1.5, 2]) / 100, take: r.pick([0.5, 0.6, 0.7, 0.8]), acp0: r.pick([50, 60, 65, 75]), acp1: r.pick([30, 35, 40]), rrr: r.pick([0.1, 0.12, 0.15]), segment: r.pick(['wholesale', 'export', 'retail']) }; };
  V.q3.discount = function (d, x, c) {
    var nm = d.short, X = { dCM: (c.s1 - c.s0) * c.cmr, disc1: c.d * c.take * c.s1, ar0: c.s0 * c.acp0 / 365 };
    X.ar1 = (c.s1 - X.disc1) * c.acp1 / 365; X.dAR = X.ar1 - X.ar0; X.costAR = X.dAR * c.rrr; X.net = X.dCM - X.disc1 - X.costAR;
    return { n: 3, area: 'fin', title: 'Credit terms: early-payment discount', intro: nm + ' considers offering its ' + c.segment + ' customers a ' + P(c.d, 1) + ' discount for early payment. Management expects:<ul><li>Credit sales rise from ' + E(c.s0) + ' to ' + E(c.s1) + '; the contribution margin ratio is ' + P(c.cmr, 0) + '.</li><li>' + P(c.take, 0) + ' of customers will take the discount.</li><li>The average collection period falls from ' + c.acp0 + ' to ' + c.acp1 + ' days.</li><li>Bad debts do not change; the required return is ' + P(c.rrr, 0) + '.</li></ul>', parts: [
      { id: '3a', pts: 4, prompt: 'Calculate the change in contribution margin.', fields: [f('ΔCM (€)', X.dCM, 'cur', 0)], model: steps(['ΔCM = (' + E(c.s1) + ' − ' + E(c.s0) + ') × ' + P(c.cmr, 0) + ' = <b>' + E(X.dCM) + '</b>']) },
      { id: '3b', pts: 3, prompt: 'Calculate the annual cost of the discount.', fields: [f('Discount cost (€)', X.disc1, 'cur', 0)], model: steps(['Discount cost = ' + P(c.d, 1) + ' × ' + P(c.take, 0) + ' × ' + E(c.s1) + ' = <b>' + E(X.disc1) + '</b>']) },
      { id: '3c', pts: 6, prompt: 'Calculate the change in the investment in accounts receivable and the related (opportunity) cost or saving.', fields: [f('ΔA/R (€)', X.dAR, 'cur', 0), f('Cost (+) or saving (−) (€)', X.costAR, 'cur', 0)],
        model: steps(['A/R now = ' + E(c.s0) + ' × ' + c.acp0 + ' ÷ 365 = ' + E(X.ar0), 'A/R new = (sales − discount) × ACP ÷ 365 = (' + E(c.s1) + ' − ' + E(X.disc1) + ') × ' + c.acp1 + ' ÷ 365 = ' + E(X.ar1), 'ΔA/R = <b>' + E(X.dAR) + '</b>', '× ' + P(c.rrr, 0) + ' = <b>' + E(X.costAR) + '</b> (negative = a saving)']) },
      { id: '3d', pts: 2, prompt: 'Should ' + nm + ' introduce the discount? Explain.', open: true,
        model: '<p>Net effect = ΔCM − discount cost − cost of ΔA/R = ' + E(X.dCM) + ' − ' + E(X.disc1) + ' − (' + E(X.costAR) + ') = <b>' + E(X.net) + '</b> → ' + (X.net > 0 ? '<b>introduce</b> the discount.' : '<b>do not</b> introduce the discount.') + '</p>', check: ['Correct net effect and conclusion'], need: 1 }
    ] };
  };

  VP.q3.payables = function (r) { var y = r.pick([10, 15, 20]); return { amt: r.range(20, 400, 5) * 1000, cd: r.pick([1, 1.5, 2, 2.5, 3]), y: y, z: y + r.pick([20, 30, 45, 50]), bank: r.pick([0.06, 0.08, 0.1, 0.12, 0.15]), supplier: r.pick(['PolyChem Trading', 'MetalLink Supplies', 'PackRight B.V.']) }; };
  V.q3.payables = function (d, x, c) {
    var nm = d.short, N_ = c.z - c.y, rp = c.cd / (100 - c.cd), ap = rp * 365 / N_, ex = Math.pow(1 + rp, 365 / N_) - 1, pay = c.amt * (1 - c.cd / 100);
    return { n: 3, area: 'fin', title: 'Accounts payable management', intro: nm + ' receives a bill of ' + E(c.amt) + ' from ' + c.supplier + ' with terms ' + c.cd + '/' + c.y + ', n/' + c.z + '. Its bank charges ' + P(c.bank, 0) + ' p.a. on a short-term loan.', parts: [
      { id: '3a', pts: 3, prompt: 'How much does ' + nm + ' pay if it takes the discount, and on which day?', fields: [f('Amount paid with discount (€)', pay, 'cur', 2)], model: steps(['Pay on day ' + c.y + ': ' + E(c.amt) + ' × (1 − ' + c.cd + '%) = <b>' + E(pay, 2) + '</b>']) },
      { id: '3b', pts: 4, prompt: 'Calculate the approximate cost of giving up the discount.', fields: [f('Approximate cost', ap, 'pct', 2)], model: steps(['N = ' + c.z + ' − ' + c.y + ' = ' + N_ + ' days', 'Approx = ' + c.cd + ' ÷ (100 − ' + c.cd + ') × 365 ÷ ' + N_ + ' = <b>' + P(ap) + '</b>']) },
      { id: '3c', pts: 4, prompt: 'Calculate the exact cost of giving up the discount.', fields: [f('Exact cost', ex, 'pct', 2)], model: steps(['Exact = (1 + ' + P(rp, 3) + ')<sup>365/' + N_ + '</sup> − 1 = <b>' + P(ex) + '</b>']) },
      { id: '3d', pts: 4, prompt: 'Should ' + nm + ' take the discount? What about paying even later than day ' + c.z + ' (stretching payables)?', open: true,
        model: '<p>Giving up the discount costs ' + P(ex) + ' per year, ' + (ex > c.bank ? 'which is more than the bank rate of ' + P(c.bank, 0) + ', so ' + nm + ' should <b>take the discount</b> (borrow from the bank if needed and pay on day ' + c.y + ').' : 'which is less than the bank rate of ' + P(c.bank, 0) + ', so it is cheaper to <b>give up the discount</b> and pay on day ' + c.z + '.') + ' Stretching payables (paying after day ' + c.z + ') lowers the cost even further, but it is only an emergency source: it harms the relationship with the supplier.</p>', check: ['Compares the cost with the bank rate', 'Correct decision', 'Stretching = cheaper but harms supplier relations'], need: 3 }
    ] };
  };

  /* ===================== Q4 (15p) ===================== */
  VP.q4.epsforecast = function (r) { return { shares: r.pick([1, 2, 2.5, 4, 5]) * 1e6, chg: r.pick([5, 10, 15, 20]) }; };
  V.q4.epsforecast = function (d, x, p) {
    var nm = d.short, dol = x.CM / x.EBIT, pdPre = x.PD / (1 - d.T), dfl = x.EBIT / (x.EBT - pdPre), dtl = dol * dfl, eps = (x.NI - x.PD) / p.shares, eps2 = eps * (1 + dtl * p.chg / 100);
    return { n: 4, area: 'fin', title: 'Leverage & EPS', intro: nm + ' has ' + N(p.shares) + ' common shares outstanding.', parts: [
      { id: '4a', pts: 5, prompt: 'Calculate the degree of operating leverage (DOL) and the degree of financial leverage (DFL) for ' + d.year + '.', fields: [f('DOL', dol, 'x', 3, 0.01), f('DFL', dfl, 'x', 3, 0.005)],
        model: steps(['DOL = CM ÷ EBIT = ' + E(x.CM) + ' ÷ ' + E(x.EBIT) + ' = <b>' + F.num(dol, 3) + '</b>', 'PD = ' + E(x.PD) + ' → ÷ (1 − ' + P(d.T, 0) + ') = ' + E(pdPre), 'DFL = ' + E(x.EBIT) + ' ÷ (' + E(x.EBT) + ' − ' + E(pdPre) + ') = <b>' + F.num(dfl, 3) + '</b>']) },
      { id: '4b', pts: 5, prompt: 'Calculate EPS for ' + d.year + ' and the DTL.', fields: [f('EPS (€)', eps, 'cur', 2, 0.02), f('DTL', dtl, 'x', 3, 0.01)],
        model: steps(['EPS = (net profit − PD) ÷ shares = (' + E(x.NI) + ' − ' + E(x.PD) + ') ÷ ' + N(p.shares) + ' = <b>' + E(eps, 2) + '</b>', 'DTL = DOL × DFL = <b>' + F.num(dtl, 3) + '</b>']) },
      { id: '4c', pts: 5, prompt: 'Sales are expected to rise by ' + p.chg + '% next year (cost structure unchanged). Estimate next year\'s EPS and explain what DTL tells management.', fields: [f('Expected EPS (€)', eps2, 'cur', 2, 0.03)], open: true,
        model: steps(['%ΔEPS = DTL × %Δsales = ' + F.num(dtl, 3) + ' × ' + p.chg + '% = ' + F.num(dtl * p.chg, 2) + '%', 'New EPS = ' + E(eps, 2) + ' × (1 + ' + F.num(dtl * p.chg / 100, 4) + ') = <b>' + E(eps2, 2) + '</b>', 'DTL shows how strongly EPS reacts to sales: it works both ways, so a ' + p.chg + '% fall in sales would cut EPS by the same ' + F.num(dtl * p.chg, 1) + '%.']), check: ['Explains DTL as sensitivity of EPS to sales (both directions)'], need: 1 }
    ] };
  };

  /* ===================== Q5 (10p) ===================== */
  VP.q5.fx = function (r) { return { amt: r.range(50, 500, 10) * 1000, spot: r.range(1.1, 1.3, 0.01), fwd: 0, cust: r.pick(['the UK', 'Switzerland', 'Norway']) }; };
  V.q5.fx = function (d, x, p) {
    var nm = d.short, cur = p.cust === 'the UK' ? ['£', 'GBP'] : p.cust === 'Switzerland' ? ['CHF ', 'CHF'] : ['NOK ', 'NOK'];
    var spot = p.cust === 'Norway' ? r1(p.spot / 11.5 * 100) / 100 : p.spot; spot = Math.round(spot * 1000) / 1000;
    var fwd = Math.round(spot * (1 - (p.amt % 3 + 2) / 100) * 1000) / 1000, inv = p.amt / spot, locked = inv * fwd;
    return { n: 5, area: 'fin', title: 'Exchange rates', intro: nm + ' sells goods worth ' + E(p.amt) + ' to a customer in ' + p.cust + '. The invoice is stated in ' + cur[1] + ' and will be paid in 2 months. The current exchange rate is €' + F.num(spot, 3) + '/' + cur[0].trim() + '; the 2-month forward rate is €' + F.num(fwd, 3) + '/' + cur[0].trim() + '.', parts: [
      { id: '5a', pts: 5, prompt: 'What is the invoice amount in ' + cur[1] + '? Which risk does ' + nm + ' face?', fields: [f('Invoice (' + cur[1] + ')', inv, 'num', 0, 1)], open: true,
        model: steps(['Invoice = ' + E(p.amt) + ' ÷ ' + F.num(spot, 3) + ' = <b>' + cur[0] + F.num(inv, 0) + '</b>', 'Exchange-rate risk: if the ' + cur[1] + ' weakens before payment, the ' + cur[0] + F.num(inv, 0) + ' will be worth fewer euros than ' + E(p.amt) + '.']), check: ['Identifies exchange-rate (transaction) risk on the foreign invoice'], need: 1 },
      { id: '5b', pts: 5, prompt: 'Explain how a forward contract reduces this risk, and calculate how many euros ' + nm + ' will receive with it.', fields: [f('Euros received with forward (€)', locked, 'cur', 0, 2)], open: true,
        model: steps(['Forward contract: sell ' + cur[0] + F.num(inv, 0) + ' today for delivery in 2 months at €' + F.num(fwd, 3), 'Euros = ' + F.num(inv, 0) + ' × ' + F.num(fwd, 3) + ' = <b>' + E(locked) + '</b>', 'The amount is certain (no risk), but ' + nm + ' gives up any gain if the ' + cur[1] + ' strengthens — here it locks in ' + E(p.amt - locked) + ' less than today\'s value.']), check: ['Forward fixes the rate today for a future date → certainty', 'Mentions giving up possible gains / the cost vs spot'], need: 2 }
    ] };
  };

  VP.q5.equity = function (r) { return { pct: r.pick([0.25, 0.3, 0.35, 0.4]), price: r.range(1, 8, 0.5) * 1e6, ni: r.range(0.5, 3, 0.1) * 1e6, divr: r.pick([0.3, 0.4, 0.5]), name: r.pick(['Beck Systems B.V.', 'Nordlicht GmbH', 'Rivera Packaging S.L.']) }; };
  V.q5.equity = function (d, x, p) {
    var nm = d.short, div = Math.round(p.ni * p.divr / 1000) * 1000, share = p.ni * p.pct, recv = div * p.pct, end = p.price + share - recv;
    return { n: 5, area: 'fin', title: 'Investments in other companies', intro: 'On 1 January ' + d.year + ', ' + nm + ' bought ' + P(p.pct, 0) + ' of the shares of ' + p.name + ' for ' + E(p.price) + '. During ' + d.year + ', ' + p.name + ' reported a net income of ' + E(p.ni) + ' and paid ' + E(div) + ' in dividends.', parts: [
      { id: '5a', pts: 6, prompt: 'Which accounting method should ' + nm + ' use? Calculate the income ' + nm + ' reports from this investment and the value of the investment on 31 December.', fields: [f('Income reported (€)', share, 'cur', 0), f('Investment on 31 Dec (€)', end, 'cur', 0)],
        model: steps(['Ownership ' + P(p.pct, 0) + ' (20–50%) → significant influence → <b>equity method</b>', 'Income = ' + P(p.pct, 0) + ' × ' + E(p.ni) + ' = <b>' + E(share) + '</b>', 'Dividends received = ' + P(p.pct, 0) + ' × ' + E(div) + ' = ' + E(recv) + ' (reduce the investment)', 'Investment = ' + E(p.price) + ' + ' + E(share) + ' − ' + E(recv) + ' = <b>' + E(end) + '</b>']) },
      { id: '5b', pts: 4, prompt: 'How would the income and the investment value differ if ' + nm + ' owned only 10%?', open: true,
        model: '<p>Below 20% → no significant influence → <b>cost method</b>: the investment stays at cost, and only <b>dividends received</b> count as income (10% × ' + E(div) + ' = ' + E(div * 0.1) + '). The share of the net income is not recorded. Above 50% the company would have control and <b>consolidate</b>.</p>', check: ['Cost method below 20%', 'Only dividends are income; investment stays at cost', 'Mentions consolidation above 50%'], need: 2 }
    ] };
  };

  /* ===================== Q6 (10p) ===================== */
  VP.q6.full = function (r) {
    var sc = r.range(30, 120, 5), sre = r.range(20, 90, 5), scl = r.range(30, 90, 5), sppe = r.range(60, 160, 5), sca = sc + sre + scl - sppe;
    if (sca < 20) { sppe -= 20 - sca; sca = 20; }
    var price = Math.round((sc + sre) * r.range(1.1, 1.5, 0.05) / 5) * 5, up = Math.round((price - sc - sre) * r.range(0.2, 0.7, 0.1) / 5) * 5;
    return { sub: { ppe: sppe, ca: sca, sc: sc, re: sre, cl: scl }, par: { ppe: r.range(150, 400, 10), ca: r.range(80, 200, 5), sc: r.range(100, 300, 10), cl: r.range(80, 250, 10) }, price: price, uplift: up, sname: r.pick(['Iron Ltd.', 'Serto B.V.', 'Beta plc', 'Kappa GmbH']) };
  };
  V.q6.full = function (d, x, p) {
    var nm = d.short, s = p.sub, a = p.par, k = function (v) { return '€' + F.num(v, 0) + 'k'; };
    var pre = a.ppe + a.ca + p.price, pre_re = pre - a.sc - a.cl;
    if (pre_re < 30) { a.ppe += 30 - pre_re; pre = a.ppe + a.ca + p.price; pre_re = pre - a.sc - a.cl; }
    var excess = p.price - s.sc - s.re, gw = excess - p.uplift;
    var c1 = { ppe: a.ppe + s.ppe, ca: a.ca + s.ca, ex: excess }; c1.ta = c1.ppe + c1.ca + c1.ex;
    var lines = function (rows) { return '<table class="cs tpl"><tbody>' + rows.map(function (rw) { return '<tr' + (/^Total/.test(rw[0]) ? ' class="s"' : '') + '><td>' + rw[0] + '</td><td>' + rw[1] + '</td><td>' + rw[2] + '</td></tr>'; }).join('') + '</tbody></table>'; };
    var tbl = lines([['(€ thousands)', nm, p.sname], ['PPE', N(a.ppe), N(s.ppe)], ['Investment in ' + p.sname, N(p.price), '–'], ['Current assets', N(a.ca), N(s.ca)], ['Total assets', N(pre), N(s.ppe + s.ca)], ['Share capital', N(a.sc), N(s.sc)], ['Retained earnings', N(pre_re), N(s.re)], ['Current liabilities', N(a.cl), N(s.cl)], ['Total equity & liabilities', N(pre), N(s.sc + s.re + s.cl)]]);
    return { n: 6, area: 'fin', title: 'Consolidation', intro: nm + ' owns 100% of ' + p.sname.replace(/\.$/, '') + '. The balance sheets right after the purchase are:' + tbl, parts: [
      { id: '6a', pts: 6, prompt: 'Prepare the consolidated balance sheet (€ thousands), assuming book values equal market values for now.', fields: [f('PPE', c1.ppe, 'num', 0, 0.6), f('Excess of cost over book value', excess, 'num', 0, 0.6), f('Current assets', c1.ca, 'num', 0, 0.6), f('Total assets', c1.ta, 'num', 0, 0.6), f('Share capital', a.sc, 'num', 0, 0.6), f('Retained earnings', pre_re, 'num', 0, 0.6), f('Current liabilities', a.cl + s.cl, 'num', 0, 0.6)],
        model: steps(['Eliminate the investment (' + k(p.price) + ') against ' + p.sname + '\'s equity (' + k(s.sc) + ' + ' + k(s.re) + ' = ' + k(s.sc + s.re) + ')', 'Excess of cost over book value = ' + k(p.price) + ' − ' + k(s.sc + s.re) + ' = <b>' + k(excess) + '</b>', 'Add the remaining lines: PPE ' + k(c1.ppe) + ', current assets ' + k(c1.ca) + ', current liabilities ' + k(a.cl + s.cl), 'Equity = parent only: share capital ' + k(a.sc) + ', retained earnings ' + k(pre_re), 'Total assets = <b>' + k(c1.ta) + '</b>']) },
      { id: '6b', pts: 4, prompt: 'The market value of ' + p.sname + '\'s PPE is ' + k(p.uplift) + ' above its book value. What are PPE and goodwill on the final consolidated balance sheet?', fields: [f('PPE', c1.ppe + p.uplift, 'num', 0, 0.6), f('Goodwill', gw, 'num', 0, 0.6)],
        model: steps(['PPE = ' + k(c1.ppe) + ' + ' + k(p.uplift) + ' = <b>' + k(c1.ppe + p.uplift) + '</b>', 'Goodwill = excess − uplift = ' + k(excess) + ' − ' + k(p.uplift) + ' = <b>' + k(gw) + '</b>', 'Total assets stay ' + k(c1.ta) + '.']) }
    ] };
  };

  /* ===================== Q7 (10p) ===================== */
  VP.q7.utilities = function () { return {}; };
  V.q7.utilities = function (d) {
    var nm = d.short;
    return { n: 7, area: 'scm', title: 'Value-added roles of logistics', parts: [
      { id: '7a', pts: 5, prompt: 'Name the five types of economic utility and indicate which function (production, logistics or marketing) creates each.', open: true,
        model: '<ul><li><b>Form</b> — production/manufacturing (the product is made).</li><li><b>Time</b> — logistics (available when needed).</li><li><b>Place</b> — logistics (available where needed).</li><li><b>Quantity</b> — logistics (the right amount).</li><li><b>Possession</b> — marketing (the customer can acquire it).</li></ul>', check: ['Form – production', 'Time – logistics', 'Place – logistics', 'Quantity – logistics', 'Possession – marketing'], need: 5 },
      { id: '7b', pts: 5, prompt: 'Give an example from ' + nm + '\'s business of time, place and quantity utility, and explain how the product\'s characteristics affect logistics cost.', open: true,
        model: '<p>Time: goods arrive before the customer\'s production run or peak season. Place: stock in regional depots close to customers. Quantity: deliveries matching the order size. Product factors: higher <b>value</b> raises inventory and insurance costs; higher <b>density</b> lowers transport and storage cost per kg; <b>fragile</b> goods and <b>special handling</b> (e.g. temperature control) raise transport, storage and packaging costs.</p>', check: ['Time example', 'Place example', 'Quantity example', 'At least one product factor explained'], need: 4 }
    ] };
  };
  VP.q7.approaches = function () { return {}; };
  V.q7.approaches = function (d) {
    var nm = d.short;
    return { n: 7, area: 'scm', title: 'Inventory management approaches', parts: [
      { id: '7a', pts: 4, prompt: 'Explain the conflict between marketing, manufacturing and finance about the level of inventory at ' + nm + '.', open: true,
        model: '<p><b>Marketing</b> wants plenty of stock so products are always available. <b>Manufacturing</b> wants long production runs with few changeovers (low unit cost), which creates high stock. <b>Finance</b> wants low inventory: higher inventory turns, fewer assets and more cash.</p>', check: ['Marketing view', 'Manufacturing view', 'Finance view'], need: 3 },
      { id: '7b', pts: 6, prompt: 'Compare the JIT and EOQ approaches on three factors, and say which suits ' + nm + '\'s supplier situation better.', open: true,
        model: '<ul><li>Inventory: EOQ sees it as an asset; JIT as a liability.</li><li>Safety stock: EOQ yes; JIT no.</li><li>Lot sizes / runs: EOQ economic lot, long runs; JIT 1-for-1, short runs.</li><li>Suppliers: EOQ multiple sources, adversaries; JIT single source, partners.</li><li>Lead times: EOQ tolerates them; JIT shortens them — and JIT needs <b>reliable</b> lead times.</li></ul><p>With supplier lead times of ' + d.lead.L + ' ± ' + d.lead.v + ' days and suppliers chosen on price, JIT is risky now; ' + nm + ' would first need fewer, reliable partner suppliers. Until then an EOQ/reorder-point approach with safety stock fits better.</p>', check: ['Factor 1 compared', 'Factor 2 compared', 'Factor 3 compared', 'Reasoned recommendation using the case'], need: 4 }
    ] };
  };

  /* ===================== Q8 (10p) ===================== */
  VP.q8.quadrant = function (r) { return { order: r.shuffle([0, 1, 2, 3]) }; };
  V.q8.quadrant = function (d, x, p) {
    var nm = d.short, items = [
      ['Office paper and cleaning supplies', 'many suppliers, low spend', 'Generics', 'simplify buying (catalogues, e-procurement), little management time'],
      ['Fuel and electricity for the plant', 'many suppliers, high spend', 'Commodities', 'leverage volume and price; use competitive bidding'],
      ['A special spare part from one supplier', 'only one supplier, low spend', 'Distinctives', 'secure supply (safety stock, standardise, look for alternatives)'],
      [d.material + ' of a unique specification', 'few suppliers, high spend, production stops without it', 'Criticals', 'strategic partnership, long-term contracts, joint improvement']];
    var it = p.order.map(function (i) { return items[i]; });
    return { n: 8, area: 'scm', title: 'Types of purchases', intro: nm + ' buys, among other things: ' + it.map(function (t, i) { return '(' + (i + 1) + ') ' + t[0] + ' — ' + t[1]; }).join('; ') + '.', parts: [
      { id: '8a', pts: 6, prompt: 'Using the quadrant technique (value and risk), classify each of the four items and explain your choice.', open: true,
        model: '<ul>' + it.map(function (t, i) { return '<li>(' + (i + 1) + ') <b>' + t[2] + '</b> — ' + t[1] + '.</li>'; }).join('') + '</ul><p>Generics = low value, low risk; commodities = high value, low risk; distinctives = low value, high risk; criticals = high value, high risk.</p>', check: it.map(function (t, i) { return 'Item ' + (i + 1) + ': ' + t[2]; }), need: 4 },
      { id: '8b', pts: 4, prompt: 'Describe a suitable sourcing approach for two of these categories.', open: true,
        model: '<ul>' + it.map(function (t) { return '<li><b>' + t[2] + '</b>: ' + t[3] + '.</li>'; }).join('') + '</ul>', check: ['Approach 1 fits its category', 'Approach 2 fits its category'], need: 2 }
    ] };
  };
  VP.q8.abc = function (r) { var v = []; for (var i = 0; i < 10; i++) v.push(Math.round(r.range(2, 60, 1)) * 1000); v.sort(function (a, b) { return b - a; }); v[0] *= 6; v[1] *= 4; v = r.shuffle(v); return { vals: v.map(function (x, i) { return ['SKU-' + String.fromCharCode(65 + i), x]; }) }; };
  V.q8.abc = function (d, x, p) {
    var nm = d.short, s = p.vals.slice().sort(function (a, b) { return b[1] - a[1]; }), tot = s.reduce(function (t, a) { return t + a[1]; }, 0);
    var A = s[0][1] + s[1][1], C = s.slice(5).reduce(function (t, a) { return t + a[1]; }, 0);
    return { n: 8, area: 'scm', title: 'Inventory classification', intro: 'Annual usage value of ' + nm + '\'s ten stock items: ' + p.vals.map(function (v) { return v[0] + ' ' + E(v[1]); }).join(', ') + '. Rule: A = the top 20% of items (2), B = the next 30% (3), C = the remaining 50% (5), ranked by annual usage value.', parts: [
      { id: '8a', pts: 6, prompt: 'Which items are A-items? Calculate the total annual usage value and the share of value in the A-items and in the C-items.', fields: [f('Total annual usage value (€)', tot, 'cur', 0), f('Share of value in A-items', A / tot, 'pct', 1), f('Share of value in C-items', C / tot, 'pct', 1)],
        model: steps(['Rank by value: ' + s.map(function (v) { return v[0]; }).join(' > '), 'A-items: <b>' + s[0][0] + ' and ' + s[1][0] + '</b> = ' + E(A), 'Total = <b>' + E(tot) + '</b>', 'A share = ' + E(A) + ' ÷ ' + E(tot) + ' = <b>' + P(A / tot, 1) + '</b>; C share = ' + E(C) + ' ÷ ' + E(tot) + ' = <b>' + P(C / tot, 1) + '</b> (Pareto: few items, most value)']) },
      { id: '8b', pts: 4, prompt: 'How should ' + nm + ' manage A-items differently from C-items? Why should C-items not be ignored?', open: true,
        model: '<p>A-items: tight control — frequent reviews, accurate forecasts, close supplier contact, lower safety stock relative to value. C-items: simple rules — larger, less frequent orders, more safety stock (cheap to hold). C-items still matter: a stockout of a cheap part can stop production or lose a sale, so each class needs its own strategy balancing stockout cost and carrying cost.</p>', check: ['A-items: tight control', 'C-items: simple, low-effort control', 'C-items still need a strategy (stockouts)'], need: 3 }
    ] };
  };

  /* ===================== Q9 (10p) ===================== */
  VP.q9.fob = function (r) { return { a: r.pick([0, 1]), b: r.pick([2, 3]) }; };
  V.q9.fob = function (d, x, p) {
    var nm = d.short, T = [['FOB origin, freight collect', 'buyer', 'buyer', 'buyer', 'buyer'], ['FOB origin, freight prepaid', 'buyer', 'buyer', 'seller', 'seller'], ['FOB destination, freight prepaid', 'seller', 'seller', 'seller', 'seller'], ['FOB destination, freight collect', 'seller', 'seller', 'buyer', 'buyer']];
    var A = T[p.a], B = T[p.b];
    var row = function (t) { return '<li><b>' + t[0] + '</b>: owns goods in transit — ' + t[1] + '; files freight claims — ' + t[2] + '; selects and pays the carrier — ' + t[3] + '; bears the freight cost — ' + t[4] + '.</li>'; };
    return { n: 9, area: 'scm', title: 'Terms of sale', intro: nm + ' buys ' + d.material + ' and is offered two contracts: "' + A[0] + '" or "' + B[0] + '".', parts: [
      { id: '9a', pts: 6, prompt: 'For both terms, explain who owns the goods in transit, who files freight claims, who pays the carrier and who ultimately bears the freight cost.', open: true, model: '<ul>' + row(A) + row(B) + '</ul>', check: ['Ownership in transit correct for both', 'Claims correct for both', 'Carrier payment correct for both', 'Freight cost bearer correct for both'], need: 4 },
      { id: '9b', pts: 4, prompt: 'Which term would you advise if ' + nm + ' has more influence with carriers than its supplier? Explain.', open: true,
        model: '<p>The party with more influence over carriers should control the freight. So ' + nm + ' should prefer <b>FOB origin, freight collect</b>: it owns the goods from the supplier\'s dock, chooses and pays the carrier at its own (better) rates, and controls service and claims. Under FOB destination the supplier controls the carrier and builds the freight cost into its price.</p>', check: ['Links control of freight to carrier influence', 'Recommends an FOB origin, freight collect type term with reasons'], need: 2 }
    ] };
  };
  VP.q9.scorecard = function (r) { return { ot: [r.range(93, 99.5, 0.1), r.range(93, 99.5, 0.1)], dmg: [r.range(0.2, 2.2, 0.1), r.range(0.2, 2.2, 0.1)], bill: [r.range(95, 99.8, 0.1), r.range(95, 99.8, 0.1)], cs: [r.pick([3, 4, 5]), r.pick([2, 3, 4, 5])], names: r.pick([['Rhein Cargo', 'TransEuropa'], ['NordFreight', 'Alpine Haulage'], ['DeltaLine', 'BlueRoad Logistics']]) }; };
  V.q9.scorecard = function (d, x, p) {
    var nm = d.short;
    var otS = function (v) { return v > 98 ? 5 : v > 96 ? 4 : v > 94 ? 3 : v > 92 ? 2 : 0; }, dS = function (v) { return v < 0.5 ? 5 : v <= 1 ? 4 : v <= 1.5 ? 3 : v <= 2 ? 2 : 0; }, bS = function (v) { return v > 99 ? 5 : v >= 97 ? 3 : v >= 95 ? 1 : 0; };
    var tot = [0, 1].map(function (i) { return 8 * otS(p.ot[i]) + 5 * dS(p.dmg[i]) + 3 * bS(p.bill[i]) + 2 * 5 + 2 * p.cs[i]; });
    var pdi = p.ot[0] / 100 * (1 - p.dmg[0] / 100) * p.bill[0] / 100;
    var csN = ['', '', 'Fair', 'Average', 'Good', 'Superior'];
    return { n: 9, area: 'scm', title: 'Carrier performance', intro: nm + ' rates its carriers with a weighted scorecard (max 100): on-time delivery weight 8 (>98% = 5, 96.01–98% = 4, 94.01–96% = 3, 92.01–94% = 2, else 0); loss & damage weight 5 (&lt;0.5% = 5, 0.5–1% = 4, 1–1.5% = 3, 1.5–2% = 2, >2% = 0); billing accuracy weight 3 (>99% = 5, 97–99% = 3, 95–97% = 1, &lt;95% = 0); equipment condition weight 2 (safe & clean = 5); customer service weight 2 (superior 5, good 4, average 3, fair 2).<br>' + p.names.map(function (n, i) { return '<b>' + n + '</b>: on-time ' + F.num(p.ot[i], 1) + '%, damage ' + F.num(p.dmg[i], 1) + '%, billing accuracy ' + F.num(p.bill[i], 1) + '%, equipment safe & clean, service ' + csN[p.cs[i]].toLowerCase() + '.'; }).join('<br>'), parts: [
      { id: '9a', pts: 6, prompt: 'Calculate the total score of both carriers. Which carrier performs better?', fields: [f(p.names[0] + ' score', tot[0], 'num', 0, 0.5), f(p.names[1] + ' score', tot[1], 'num', 0, 0.5)],
        model: steps([0, 1].map(function (i) { return p.names[i] + ': 8×' + otS(p.ot[i]) + ' + 5×' + dS(p.dmg[i]) + ' + 3×' + bS(p.bill[i]) + ' + 2×5 + 2×' + p.cs[i] + ' = <b>' + tot[i] + '</b>'; }).concat(['Better: <b>' + (tot[0] >= tot[1] ? p.names[0] : p.names[1]) + '</b>'])) },
      { id: '9b', pts: 4, prompt: 'Calculate the perfect delivery index of ' + p.names[0] + '.', fields: [f('Perfect delivery index', pdi, 'pct', 2)],
        model: steps(['PDI = on-time % × damage-free % × billing accuracy % = ' + F.num(p.ot[0], 1) + '% × ' + F.num(100 - p.dmg[0], 1) + '% × ' + F.num(p.bill[0], 1) + '% = <b>' + P(pdi) + '</b> (target > 95%)']) }
    ] };
  };
})(typeof window !== 'undefined' ? window : globalThis);
