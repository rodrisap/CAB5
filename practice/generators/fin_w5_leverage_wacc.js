/* Finance Week 5 — Operating & financial leverage, capital structure, WACC (9.5, 12.1, 13.1) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};

  FSM.addTopic({ id: 'fin_w5', area: 'Finance', week: 5, title: 'Leverage, capital structure & WACC', read: 'Zutter & Smart 9.5, 12.1, 13.1' });

  FSM.calc.leverage = function (o) { // o: cm, fc, interest, tax (amount) or T, pd, shares
    var x = {};
    x.ebit = o.cm - o.fc; x.ebt = x.ebit - o.interest;
    x.T = o.T !== undefined ? o.T : o.tax / x.ebt;
    x.tax = x.ebt * x.T; x.ni = x.ebt - x.tax; x.eacs = x.ni - (o.pd || 0);
    x.dol = o.cm / x.ebit; x.dfl = x.ebit / (x.ebt - (o.pd || 0) / (1 - x.T)); x.dtl = x.dol * x.dfl;
    if (o.shares) x.eps = x.eacs / o.shares;
    return x;
  };
  FSM.calc.wacc = function (o) { // amounts d,p,s ; rates rd,rp,rs (fractions), T
    var tot = o.d + o.p + o.s;
    var x = { wd: o.d / tot, wp: o.p / tot, ws: o.s / tot };
    x.wacc = x.wd * o.rd * (1 - o.T) + x.wp * o.rp + x.ws * o.rs;
    return x;
  };

  /* ---------------- break-even & DOL ---------------- */
  FSM.addSkill({
    id: 'fin_w5_breakeven_dol', topic: 'fin_w5', title: 'Break-even and degree of operating leverage',
    formula: 'Break-even Q = FC / (P − VC) · DOL = CM / EBIT = %ΔEBIT / %ΔSales',
    build: function (r, c) {
      var P = r.range(8, 400, 0.5), VC = h.r2(P * r.range(0.3, 0.75, 0.01));
      var cmu = h.r2(P - VC);
      var be = r.int(200, 20000);
      var FC = h.r2(be * cmu);
      var Q = h.r0(be * r.range(1.1, 1.8, 0.01));
      var chg = r.pick([0.1, 0.15, 0.2, 0.25]);
      var Q2 = h.r0(Q * (1 + chg));
      var ebit = Q * cmu - FC, ebit2 = Q2 * cmu - FC;
      var dol = Q * cmu / ebit;
      var pctS = (Q2 - Q) / Q, pctE = (ebit2 - ebit) / ebit;
      var C = c.C, unitW = r.pick(['units', 'products', 'orders', 'items']);
      var v = r.pick(['be', 'dol', 'pct', 'target']);
      var parts = [];
      var stepBE = [step('Unit contribution margin = ' + C(P, 2) + ' − ' + C(VC, 2), cmu, 'cur', 'price − variable cost', 2), step('Break-even = ' + C(FC, 2) + ' / ' + C(cmu, 2), be, 'units', 'FC ÷ unit CM', 0)];
      if (v === 'be' || v === 'dol') parts.push({ ask: ['What is the operating break-even point in ' + unitW + '?', 'How many ' + unitW + ' must be sold to break even (EBIT = 0)?'], answer: be, unit: 'units', dp: 0,
        traps: [{ v: FC / P, why: 'Divide by the contribution margin per unit, not the price.' }, { v: FC / VC, why: 'Divide by (price − variable cost).' }], steps: stepBE });
      if (v !== 'target') parts.push({ ask: ['What is EBIT at ' + F.num(Q) + ' ' + unitW + '?', 'Calculate operating profit (EBIT) when ' + F.num(Q) + ' ' + unitW + ' are sold.'], answer: ebit, unit: 'cur', dp: 2,
        traps: [{ v: Q * cmu, why: 'Subtract the fixed costs.' }, { v: Q * P - FC, why: 'Use contribution margin (price − variable cost), not price.' }],
        steps: [step('CM = ' + F.num(Q) + ' × ' + C(cmu, 2), Q * cmu, 'cur', 'units × unit CM', 2), step('EBIT = CM − FC = ' + C(Q * cmu, 2) + ' − ' + C(FC, 2), ebit, 'cur', 'fixed costs given', 2)] });
      if (v === 'dol' || v === 'be') parts.push({ ask: ['What is the degree of operating leverage at ' + F.num(Q) + ' ' + unitW + '?', 'Calculate the DOL at a base of ' + F.num(Q) + ' ' + unitW + '.'], answer: dol, unit: 'x', dp: 2,
        traps: [{ v: ebit / (Q * cmu), why: 'DOL = CM / EBIT (not EBIT / CM).' }, { v: Q * P / ebit, why: 'Use contribution margin, not sales, in the numerator.' }],
        steps: [step('CM = ' + F.num(Q) + ' × ' + C(cmu, 2), Q * cmu, 'cur', 'units × unit CM', 2), step('EBIT = CM − FC', ebit, 'cur', 'previous part', 2), step('DOL = CM / EBIT', dol, 'x', 'formula sheet', 2)],
        method: ['Calculate contribution margin at the base volume', 'Subtract fixed costs to get EBIT', 'Divide contribution margin by EBIT'] });
      if (v === 'pct') {
        parts.push({ ask: ['If sales rise from ' + F.num(Q) + ' to ' + F.num(Q2) + ' ' + unitW + ', by what % does EBIT change?', 'Sales volume grows from ' + F.num(Q) + ' to ' + F.num(Q2) + '. What is the % change in EBIT?'], answer: pctE, unit: 'pct', dp: 1,
          traps: [{ v: pctS, why: 'That is the % change in sales; EBIT changes by more because of fixed costs.' }],
          steps: [step('EBIT at ' + F.num(Q) + ' = ' + F.num(Q) + ' × ' + C(cmu, 2) + ' − ' + C(FC, 2), ebit, 'cur', 'base', 2), step('EBIT at ' + F.num(Q2) + ' = ' + F.num(Q2) + ' × ' + C(cmu, 2) + ' − ' + C(FC, 2), ebit2, 'cur', 'new', 2), step('%ΔEBIT = (new − old) / old', pctE, 'pct', 'definition', 1)] });
        parts.push({ ask: ['Use your answers to find the DOL (= %ΔEBIT / %ΔSales).', 'What DOL does this imply?'], answer: pctE / pctS, unit: 'x', dp: 2,
          traps: [{ v: pctS / pctE, why: 'DOL = %ΔEBIT / %ΔSales.' }],
          steps: [step('%ΔSales = (' + F.num(Q2) + ' − ' + F.num(Q) + ') / ' + F.num(Q), pctS, 'pct', 'given volumes', 1), step('DOL = %ΔEBIT / %ΔSales', pctE / pctS, 'x', 'formula sheet', 2), 'Check: CM / EBIT at the base gives the same number.'] });
      }
      if (v === 'target') {
        var target = h.r0(r.range(0.2, 2, 0.1) * FC / 100) * 100;
        var qt = (FC + target) / cmu;
        parts.push({ ask: ['How many ' + unitW + ' must be sold to reach an EBIT of ' + C(target) + '?', 'What sales volume gives operating profit of ' + C(target) + '?'], answer: qt, unit: 'units', dp: 0,
          traps: [{ v: target / cmu, why: 'You also need to cover the fixed costs: (FC + target) / unit CM.' }, { v: (FC + target) / P, why: 'Divide by unit contribution margin, not price.' }],
          steps: [step('Unit CM = ' + C(P, 2) + ' − ' + C(VC, 2), cmu, 'cur', 'price − variable cost', 2), step('Q = (' + C(FC, 2) + ' + ' + C(target) + ') / ' + C(cmu, 2), qt, 'units', 'EBIT = Q × CM − FC', 0)] });
      }
      return {
        intro: [c.company + ' sells ' + unitW + ' at ' + C(P, 2) + ' each.', 'Cost data of ' + c.company + ' (' + c.industry + '):'],
        facts: [
          fact('Selling price per unit', P, 'cur', 'The selling price is ' + C(P, 2) + ' per unit.', { dp: 2 }),
          fact('Variable cost per unit', VC, 'cur', 'Variable operating costs are ' + C(VC, 2) + ' per unit.', { dp: 2 }),
          fact('Fixed operating costs', FC, 'cur', 'Fixed operating costs are ' + C(FC, 2) + ' per year.', { dp: 2 })
        ],
        noise: [fact('x', 0, 'cur', 'The company pays ' + C(r.range(1, 50, 1) * 1000) + ' in interest.')],
        parts: parts
      };
    }
  });

  /* ---------------- DFL & EPS ---------------- */
  FSM.addSkill({
    id: 'fin_w5_dfl', topic: 'fin_w5', title: 'Degree of financial leverage and EPS',
    formula: 'DFL = %ΔEPS / %ΔEBIT = EBIT / (EBT − PD/(1 − T))',
    build: function (r, c) {
      var debt = r.range(50, 2000, 10) * 1000, i = r.range(4, 15, 0.5) / 100, interest = debt * i;
      var T = r.pick([0.2, 0.21, 0.25, 0.3, 0.35, 0.4]);
      var shares = r.range(2, 200, 0.5) * 1000;
      var pd = r.chance(0.45) ? h.r0(r.range(0.05, 0.3, 0.01) * interest / 100) * 100 : 0;
      var ebit1 = h.r0(r.range(1.8, 5, 0.05) * (interest + pd / (1 - T)) / 500) * 500;
      var ebit2 = h.r0(ebit1 * r.range(1.1, 1.5, 0.01) / 500) * 500;
      function eps(e) { var ebt = e - interest; return (ebt * (1 - T) - pd) / shares; }
      var eps1 = eps(ebit1), eps2 = eps(ebit2);
      var ebt1 = ebit1 - interest;
      var dfl = ebit1 / (ebt1 - pd / (1 - T));
      var C = c.C;
      var facts = [
        fact('Debt', debt, 'cur', c.company + ' has ' + C(debt) + ' of ' + F.num(i * 100, 1) + '% debt'),
        fact('Interest rate', i, 'pct', '', { dp: 1 }),
        fact('Common shares', shares, 'num', 'and ' + F.num(shares) + ' common shares outstanding.'),
        fact('Tax rate', T, 'pct', 'The tax rate is ' + F.num(T * 100) + '%.', { dp: 0 })
      ];
      if (pd) facts.push(fact('Preferred dividends', pd, 'cur', 'It pays ' + C(pd) + ' in preferred dividends per year.'));
      var epsSteps = function (e, label) {
        var ebt = e - interest;
        return [step('Interest = ' + C(debt) + ' × ' + F.num(i * 100, 1) + '%', interest, 'cur', 'debt × rate'), step('EBT = ' + C(e) + ' − interest', ebt, 'cur', 'EBIT − interest'), step('Net income = EBT × (1 − ' + F.num(T * 100) + '%)', ebt * (1 - T), 'cur', 'after tax'), step('EACS = net income − preferred dividends', ebt * (1 - T) - pd, 'cur', pd ? 'preferred dividends given' : 'no preferred dividends'), step('EPS = EACS / ' + F.num(shares) + ' shares', eps(e), 'cur', 'formula sheet', 2)];
      };
      var parts = [
        { ask: ['What is EPS when EBIT is ' + C(ebit1) + '?', 'Calculate earnings per share at EBIT of ' + C(ebit1) + '.'], answer: eps1, unit: 'cur', dp: 2,
          traps: [{ v: (ebt1 * (1 - T)) / shares, why: 'Deduct preferred dividends before dividing by common shares.' }, { v: ebit1 * (1 - T) / shares, why: 'Deduct interest before tax.' }].filter(function (t) { return Math.abs(t.v - eps1) > 0.005; }),
          steps: epsSteps(ebit1) },
        { ask: ['What is EPS when EBIT is ' + C(ebit2) + '?', 'And at an EBIT of ' + C(ebit2) + '?'], answer: eps2, unit: 'cur', dp: 2,
          traps: [{ v: (ebit2 - interest) * (1 - T) / shares, why: 'Deduct preferred dividends.' }].filter(function (t) { return Math.abs(t.v - eps2) > 0.005; }), steps: epsSteps(ebit2) },
        { ask: ['Calculate the degree of financial leverage (DFL) using EBIT of ' + C(ebit1) + ' as the base.', 'What is the DFL at the base EBIT of ' + C(ebit1) + '?'], answer: dfl, unit: 'x', dp: 2,
          traps: pd ? [{ v: ebit1 / (ebt1 - pd), why: 'Gross up preferred dividends: PD / (1 − T).' }, { v: ebit1 / ebt1, why: 'EBIT/EBT only works without preferred dividends.' }] : [{ v: ebt1 / ebit1, why: 'DFL = EBIT / EBT, not the inverse.' }],
          steps: [step('EBT = ' + C(ebit1) + ' − ' + C(interest), ebt1, 'cur', 'EBIT − interest'), pd ? step('PD / (1 − T) = ' + C(pd) + ' / ' + F.num(1 - T, 2), pd / (1 - T), 'cur', 'pre-tax equivalent of preferred dividends') : 'No preferred dividends, so DFL = EBIT / EBT.', step('DFL = EBIT / (EBT − PD/(1 − T))', dfl, 'x', 'formula sheet', 2), 'Check: %ΔEPS / %ΔEBIT = ' + h.p((eps2 - eps1) / eps1, 1) + ' / ' + h.p((ebit2 - ebit1) / ebit1, 1) + ' = ' + F.num(((eps2 - eps1) / eps1) / ((ebit2 - ebit1) / ebit1), 2)],
          method: ['Calculate EBT = EBIT − interest', 'Convert preferred dividends to a pre-tax amount (PD / (1 − T))', 'Divide EBIT by (EBT − PD/(1 − T))'] },
        { kind: 'choice', ask: ['What does a DFL of ' + F.num(dfl, 2) + ' mean?'], choices: ['If EBIT rises by 1%, EPS rises by about ' + F.num(dfl, 2) + '%.', 'If sales rise by 1%, EBIT rises by ' + F.num(dfl, 2) + '%.', 'The company has ' + F.num(dfl, 2) + ' times more debt than equity.', 'EPS is ' + F.num(dfl, 2) + ' times EBIT.'], correctChoice: 0, why: 'DFL links % changes in EBIT to % changes in EPS (financial leverage from fixed financing costs).' }
      ];
      return { intro: ['Capital structure of ' + c.company + ':', c.company + ' wants to understand its financial risk.'], facts: facts, parts: r.chance(0.5) ? parts : [parts[0], parts[2], parts[3]] };
    }
  });

  /* ---------------- full statement: DOL, DFL, DTL, new EPS (mirrors FSM_Leverage.xlsx) ---------------- */
  var VAR_LINES = ['Direct labor', 'Direct materials', 'Commissions', 'Packaging', 'Shipping and delivery', 'Energy costs', 'Transaction fees', 'Supplies'];
  var FIX_LINES = ['Rent or lease expenses', 'Salaries of non-production staff', 'Depreciation of equipment', 'Insurance premiums', 'Software licences', 'Professional fees', 'Property taxes', 'R&D expenses'];
  FSM.addSkill({
    id: 'fin_w5_dtl_statement', topic: 'fin_w5', title: 'DOL, DFL, DTL from an income statement + EPS forecast',
    formula: 'DOL = CM/EBIT · DFL = EBIT/(EBT − PD/(1−T)) · DTL = DOL × DFL · %ΔEPS = DTL × %ΔSales',
    build: function (r, c) {
      var sales = (r.int(2, 9) * 100000 + 20000 * r.int(1, 9));
      var cmr = r.int(2, 6) / 10;
      var cm = sales * cmr, vc = sales - cm;
      var vl = r.sample(VAR_LINES, 3), fl = r.sample(FIX_LINES, 3);
      var v1 = h.r0(vc * r.range(0.1, 0.3, 0.05) / 100) * 100, v2 = h.r0(vc * r.range(0.05, 0.2, 0.05) / 100) * 100, v0 = vc - v1 - v2;
      var fc = h.r0(cm * r.range(0.15, 0.45, 0.01) / 1000) * 1000;
      var f1 = h.r0(fc * 0.4 / 1000) * 1000, f2 = h.r0(fc * 0.3 / 1000) * 1000, f3 = fc - f1 - f2;
      var ebit = cm - fc;
      var interest = h.r0(ebit * r.range(0.05, 0.35, 0.01) / 1000) * 1000;
      var ebt = ebit - interest;
      var T = r.range(0.15, 0.35, 0.01);
      var tax = h.r0(ebt * T); T = tax / ebt;
      var ni = ebt - tax;
      var pd = r.chance(0.7) ? h.r0(ni * r.range(0.03, 0.12, 0.01) / 1000) * 1000 : 0;
      var eacs = ni - pd;
      var shares = r.int(1, 9) * 1000 + r.int(1, 9) * 5000;
      var L = FSM.calc.leverage({ cm: cm, fc: fc, interest: interest, tax: tax, pd: pd, shares: shares });
      var up = r.int(1, 5) * 0.05;
      var newSales = sales * (1 + up);
      var pctEPS = L.dtl * up;
      var newEacs = eacs * (1 + pctEPS), newEPS = newEacs / shares;
      var rows = [
        { label: 'Net sales revenue', v: [sales] },
        { label: vl[0], v: [v0] }, { label: vl[1], v: [v1] }, { label: vl[2], v: [v2] },
        { label: 'Total variable costs', v: [vc], total: true },
        { label: 'Contribution margin', v: [cm], total: true },
        { label: fl[0], v: [f1] }, { label: fl[1], v: [f2] }, { label: fl[2], v: [f3] },
        { label: 'Total fixed costs', v: [fc], total: true },
        { label: 'Earnings before interest and taxes', v: [ebit], total: true },
        { label: 'Interest expense', v: [interest] },
        { label: 'Earnings before taxes', v: [ebt], total: true },
        { label: 'Tax expense', v: [tax] },
        { label: 'Net profit after taxes', v: [ni], total: true },
        { label: 'Preferred stock dividends', v: [pd] },
        { label: 'Earnings available for common stockholders', v: [eacs], total: true }
      ];
      var C = c.C;
      var tsteps = [step('Tax rate T = tax / EBT = ' + C(tax) + ' / ' + C(ebt), T, 'pct', 'income statement', 2)];
      return {
        intro: [c.company + ' has prepared the following income statement (contribution format):', 'Income statement of ' + c.company + ':'],
        statement: { title: c.company, cols: [''], rows: rows },
        facts: [fact('Shares', shares, 'num', 'The company has ' + F.num(shares) + ' shares of common stock.', { alsoInText: true })],
        layouts: ['statement'],
        parts: [
          { ask: ['a) Calculate the degree of operating leverage (DOL).', 'a) What is the DOL?'], answer: L.dol, unit: 'x', dp: 3,
            traps: [{ v: sales / ebit, why: 'DOL = contribution margin / EBIT (not sales / EBIT).' }, { v: cm / ebt, why: 'Use EBIT, before interest.' }],
            steps: [step('DOL = CM / EBIT = ' + C(cm) + ' / ' + C(ebit), L.dol, 'x', 'statement', 3)] },
          { ask: ['a) Calculate the degree of financial leverage (DFL).', 'a) What is the DFL?'], answer: L.dfl, unit: 'x', dp: 3,
            traps: pd ? [{ v: ebit / (ebt - pd), why: 'Gross up preferred dividends: PD / (1 − T).' }, { v: ebit / ebt, why: 'With preferred dividends, DFL ≠ EBIT/EBT.' }] : [{ v: ebt / ebit, why: 'DFL = EBIT / EBT.' }],
            steps: tsteps.concat([pd ? step('PD / (1 − T) = ' + C(pd) + ' / (1 − ' + h.p(T) + ')', pd / (1 - T), 'cur', 'pre-tax preferred dividends') : 'No preferred dividends.', step('DFL = ' + C(ebit) + ' / (' + C(ebt) + (pd ? ' − ' + C(h.r2(pd / (1 - T))) : '') + ')', L.dfl, 'x', 'formula sheet', 3)]),
            method: ['Calculate the tax rate as tax / EBT', 'Gross up preferred dividends with 1/(1 − T)', 'DFL = EBIT / (EBT − PD/(1 − T))'] },
          { ask: ['a) Calculate the degree of total leverage (DTL).', 'a) What is the DTL?'], answer: L.dtl, unit: 'x', dp: 3,
            traps: [{ v: L.dol + L.dfl, why: 'DTL = DOL × DFL (multiply, don\'t add).' }],
            steps: [step('DTL = DOL × DFL = ' + F.num(L.dol, 3) + ' × ' + F.num(L.dfl, 3), L.dtl, 'x', 'formula sheet', 3)] },
          { ask: ['b) Sales are expected to increase to ' + C(newSales) + '. What will EPS become?', 'b) Using your leverage figures, what is EPS if sales rise to ' + C(newSales) + '?'], answer: newEPS, unit: 'cur', dp: 2,
            traps: [{ v: eacs * (1 + up) / shares, why: 'EPS grows by DTL × %Δsales, not by the same % as sales.' }, { v: eacs * (1 + L.dol * up) / shares, why: 'Use total leverage (DTL), not just DOL.' }],
            steps: [step('%ΔSales = ' + C(newSales) + ' / ' + C(sales) + ' − 1', up, 'pct', 'given', 1), step('%ΔEPS = DTL × %ΔSales = ' + F.num(L.dtl, 3) + ' × ' + h.p(up, 1), pctEPS, 'pct', 'DTL definition', 2), step('New EACS = ' + C(eacs) + ' × (1 + ' + h.p(pctEPS) + ')', newEacs, 'cur', 'EACS from statement', 2), step('New EPS = new EACS / ' + F.num(shares) + ' shares', newEPS, 'cur', 'formula sheet', 2)],
            method: ['Calculate the % increase in sales', 'Multiply by DTL to get the % increase in EPS', 'Apply that % to earnings available for common stockholders', 'Divide by the number of common shares'] }
        ]
      };
    }
  });

  /* ---------------- high vs low fixed costs ---------------- */
  FSM.addSkill({
    id: 'fin_w5_fixedcost_compare', topic: 'fin_w5', title: 'High vs low fixed costs: effect of a sales change',
    formula: 'EBIT = Sales × CM ratio − Fixed costs',
    build: function (r, c) {
      var sales = r.range(1, 20, 1) * 100000;
      var vA = r.range(0.3, 0.5, 0.05), vB = r.range(0.6, 0.8, 0.05);
      var ebit0 = h.r0(sales * r.range(0.05, 0.12, 0.01) / 1000) * 1000;
      var fA = sales * (1 - vA) - ebit0, fB = sales * (1 - vB) - ebit0;
      var chg = r.pick([-0.5, -0.3, -0.2, 0.2, 0.5, 1]);
      var s1 = sales * (1 + chg);
      var eA = s1 * (1 - vA) - fA, eB = s1 * (1 - vB) - fB;
      var A = c.company, B = c.other();
      var C = c.C;
      return {
        intro: ['Two firms both have sales of ' + C(sales) + ' and EBIT of ' + C(ebit0) + '.', A + ' and ' + B + ' currently earn the same operating profit of ' + C(ebit0) + ' on sales of ' + C(sales) + '.'],
        facts: [
          fact(A + ' variable costs (% of sales)', vA, 'pct', A + '\'s variable costs are ' + F.num(vA * 100) + '% of sales and its fixed costs ' + C(fA) + '.', { dp: 0 }),
          fact(A + ' fixed costs', fA, 'cur', ''),
          fact(B + ' variable costs (% of sales)', vB, 'pct', B + '\'s variable costs are ' + F.num(vB * 100) + '% of sales and its fixed costs ' + C(fB) + '.', { dp: 0 }),
          fact(B + ' fixed costs', fB, 'cur', '')
        ],
        layouts: ['sentence', 'table'],
        parts: [
          { ask: ['Sales change by ' + (chg > 0 ? '+' : '') + F.num(chg * 100) + '%. What is EBIT of ' + A + '?', 'If sales ' + (chg > 0 ? 'rise' : 'fall') + ' by ' + F.num(Math.abs(chg) * 100) + '%, what is ' + A + '\'s new EBIT?'], answer: eA, unit: 'cur',
            traps: [{ v: ebit0 * (1 + chg), why: 'EBIT does not move proportionally with sales because fixed costs stay the same.' }],
            steps: [step('New sales = ' + C(sales) + ' × (1 ' + (chg > 0 ? '+ ' : '− ') + F.num(Math.abs(chg) * 100) + '%)', s1, 'cur', 'given change'), step('CM = ' + C(s1) + ' × (1 − ' + F.num(vA * 100) + '%)', s1 * (1 - vA), 'cur', 'variable cost %'), step('EBIT = CM − ' + C(fA), eA, 'cur', 'fixed costs unchanged')] },
          { ask: ['And the new EBIT of ' + B + '?', 'What is ' + B + '\'s EBIT after the same change?'], answer: eB, unit: 'cur',
            traps: [{ v: ebit0 * (1 + chg), why: 'Fixed costs do not change with sales.' }],
            steps: [step('CM = ' + C(s1) + ' × (1 − ' + F.num(vB * 100) + '%)', s1 * (1 - vB), 'cur', 'variable cost %'), step('EBIT = CM − ' + C(fB), eB, 'cur', 'fixed costs unchanged')] },
          { kind: 'choice', ask: ['Which statement is correct?'], choices: [A + ' has higher operating leverage, so its EBIT reacts more strongly to sales changes — up and down.', B + ' has higher operating leverage because its variable costs are higher.', 'Both firms have the same risk because their EBIT is equal today.', 'Operating leverage only matters when sales rise.'], correctChoice: 0, why: 'Higher fixed costs = higher operating leverage = profits AND losses are magnified.' }
        ]
      };
    }
  });

  /* ---------------- capital structure ROE ---------------- */
  FSM.addSkill({
    id: 'fin_w5_roe_structure', topic: 'fin_w5', title: 'Capital structure: ROE, tax shield and risk',
    formula: 'ROE = Net income / Equity · Interest is tax-deductible',
    build: function (r, c) {
      var assets = r.range(20, 500, 10) * 1e6;
      var dA = r.range(0.55, 0.8, 0.05), dB = r.range(0.1, 0.4, 0.05);
      var iA = r.range(5, 9, 0.5) / 100, iB = Math.max(0.02, iA - r.range(0.5, 2, 0.5) / 100);
      var T = r.pick([0.2, 0.25, 0.3]);
      var ebit = h.r0(assets * r.range(0.08, 0.16, 0.01) / 1e5) * 1e5;
      var DA = assets * dA, DB = assets * dB, EA = assets - DA, EB = assets - DB;
      var niA = (ebit - DA * iA) * (1 - T), niB = (ebit - DB * iB) * (1 - T);
      var A = c.company, B = c.other(), C = c.C;
      var who = r.pick(['A', 'B']);
      var D = who === 'A' ? DA : DB, E = who === 'A' ? EA : EB, ii = who === 'A' ? iA : iB, ni = who === 'A' ? niA : niB, nm = who === 'A' ? A : B;
      return {
        intro: ['Two firms in the same industry each have total assets of ' + C(assets) + ' and expected EBIT of ' + C(ebit) + '. The tax rate is ' + F.num(T * 100) + '%.'],
        facts: [
          fact(A + ': debt / equity', DA, 'cur', A + ' is financed with ' + C(DA) + ' of debt at ' + F.num(iA * 100, 1) + '% and ' + C(EA) + ' of equity.'),
          fact(B + ': debt / equity', DB, 'cur', B + ' has ' + C(DB) + ' of debt at ' + F.num(iB * 100, 1) + '% and ' + C(EB) + ' of equity.')
        ],
        layouts: ['sentence'],
        parts: [
          { ask: ['What is the net income of ' + nm + '?', 'Calculate ' + nm + '\'s net income after interest and taxes.'], answer: ni, unit: 'cur',
            traps: [{ v: ebit * (1 - T) - D * ii, why: 'Interest is deducted BEFORE tax (tax shield).' }, { v: ebit - D * ii, why: 'Deduct taxes.' }],
            steps: [step('Interest = ' + C(D) + ' × ' + F.num(ii * 100, 1) + '%', D * ii, 'cur', 'debt × rate'), step('EBT = ' + C(ebit) + ' − interest', ebit - D * ii, 'cur', 'EBIT − interest'), step('Net income = EBT × (1 − ' + F.num(T * 100) + '%)', ni, 'cur', 'tax rate')] },
          { ask: ['What is the ROE of ' + nm + '?', 'Calculate return on equity for ' + nm + '.'], answer: ni / E, unit: 'pct', dp: 2,
            traps: [{ v: ni / assets, why: 'That is ROA; ROE divides by equity.' }],
            steps: [step('ROE = net income / equity = ' + C(ni) + ' / ' + C(E), ni / E, 'pct', 'formula sheet', 2)] },
          { kind: 'choice', ask: ['Which firm makes the better trade-off?'], choices: ['It depends: the more indebted firm has a higher ROE but also higher financial risk.', 'The firm with more debt is always better because its ROE is higher.', 'The firm with less debt is always better because it pays less interest.', 'Capital structure has no effect on shareholders.'], correctChoice: 0, why: 'Classic risk–return trade-off: debt magnifies returns and losses and raises bankruptcy risk.' }
        ]
      };
    }
  });

  /* ---------------- WACC ---------------- */
  FSM.addSkill({
    id: 'fin_w5_wacc', topic: 'fin_w5', title: 'Weighted average cost of capital (WACC)',
    formula: 'WACC = (w_d × r_d)(1 − T) + (w_p × r_p) + (w_s × r_s); r_d = interest on LT debt / LT debt',
    build: function (r, c) {
      var s = r.range(10, 300, 0.5) * 1e6, p = r.chance(0.7) ? r.range(2, 60, 0.5) * 1e6 : 0, d = r.range(5, 200, 0.5) * 1e6;
      var rs = r.range(8, 16, 0.5) / 100, rp = p ? r.range(5, 11, 0.5) / 100 : 0, rd = r.range(3, 9, 0.1) / 100;
      var T = r.pick([0.2, 0.25, 0.3, 0.35]);
      var viaInterest = r.chance(0.4);
      var interest = d * rd;
      var x = FSM.calc.wacc({ d: d, p: p, s: s, rd: rd, rp: rp, rs: rs, T: T });
      var C = c.C;
      var facts = [
        fact('Common equity (incl. retained earnings)', s, 'cur', 'Common equity (including retained earnings) is ' + C(s) + ' with a required return of ' + F.num(rs * 100, 1) + '%.'),
        fact('Required return on common equity', rs, 'pct', '', { dp: 1 })
      ];
      if (p) facts.push(fact('Preferred stock', p, 'cur', 'Preferred stock of ' + C(p) + ' requires ' + F.num(rp * 100, 1) + '%.'), fact('Required return on preferred', rp, 'pct', '', { dp: 1 }));
      facts.push(viaInterest ? fact('Long-term debt', d, 'cur', 'Long-term debt is ' + C(d) + ' with an annual interest expense of ' + C(interest) + '.') : fact('Long-term debt', d, 'cur', 'Long-term debt is ' + C(d) + ' at a cost of ' + F.num(rd * 100, 1) + '%.'));
      facts.push(viaInterest ? fact('Interest on long-term debt', interest, 'cur', '') : fact('Cost of debt', rd, 'pct', '', { dp: 1 }));
      facts.push(fact('Tax rate', T, 'pct', 'The corporate tax rate is ' + F.num(T * 100) + '%.', { dp: 0 }));
      var proj = h.r2(x.wacc + r.pick([-1, 1]) * r.range(0.5, 3, 0.5) / 100);
      var steps = [
        step('Total capital = ' + C(d) + ' + ' + C(p) + ' + ' + C(s), d + p + s, 'cur', 'debt + preferred + common'),
        step('w_d = ' + C(d) + ' / total', x.wd, 'pct', 'weight of debt', 2),
        p ? step('w_p = ' + C(p) + ' / total', x.wp, 'pct', 'weight of preferred', 2) : 'No preferred stock.',
        step('w_s = ' + C(s) + ' / total', x.ws, 'pct', 'weight of common equity', 2)
      ];
      if (viaInterest) steps.push(step('r_d = interest / LT debt = ' + C(interest) + ' / ' + C(d), rd, 'pct', 'formula sheet', 2));
      steps.push(step('WACC = ' + h.p(x.wd) + ' × ' + h.p(rd, 1) + ' × (1 − ' + F.num(T * 100) + '%)' + (p ? ' + ' + h.p(x.wp) + ' × ' + h.p(rp, 1) : '') + ' + ' + h.p(x.ws) + ' × ' + h.p(rs, 1), x.wacc, 'pct', 'formula sheet', 2));
      var parts = [
        { ask: ['Calculate the weighted average cost of capital.', 'What is the WACC of ' + c.company + '?', 'What minimum return must new projects earn (WACC)?'], answer: x.wacc, unit: 'pct', dp: 2,
          traps: [{ v: x.wd * rd + x.wp * rp + x.ws * rs, why: 'The cost of debt is after tax: multiply by (1 − T).' }, { v: (rd * (1 - T) + rp + rs) / (p ? 3 : 2), why: 'Weight each source by its share of total capital.' }, { v: x.wd * rd * (1 - T) + x.wp * rp * (1 - T) + x.ws * rs, why: 'Only debt gets the tax shield — preferred dividends are not tax-deductible.' }],
          steps: steps,
          method: ['Add up all capital sources', 'Calculate each weight', 'Multiply the cost of debt by (1 − T)', 'Sum weight × cost for each source'] }
      ];
      if (viaInterest && r.chance(0.5)) parts.unshift({ ask: ['What is the cost of debt r_d?'], answer: rd, unit: 'pct', dp: 2, traps: [{ v: rd * (1 - T), why: 'r_d itself is before tax; the (1 − T) is applied inside the WACC.' }], steps: [step('r_d = ' + C(interest) + ' / ' + C(d), rd, 'pct', 'formula sheet', 2)] });
      parts.push({ kind: 'choice', ask: ['A project is expected to return ' + h.p(proj) + '. Should the company accept it?'], choices: proj > x.wacc ? ['Accept — it earns more than the WACC.', 'Reject — it earns less than the WACC.'] : ['Reject — it earns less than the WACC.', 'Accept — it earns more than the WACC.'], correctChoice: 0, why: 'The WACC is the hurdle rate: accept projects with a return above it.' });
      return { intro: ['Capital structure of ' + c.company + ':', c.company + ' wants to know its cost of capital.'], facts: facts, parts: parts, layouts: ['sentence', 'case'] };
    }
  });

  /* ---------------- concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w5_concepts', topic: 'fin_w5', title: 'Leverage & capital structure concepts',
    items: [
      { term: 'Operating leverage', cat: 'lev', defs: ['The magnifying effect of fixed operating costs on how EBIT reacts to a change in sales.', 'Leverage that comes from fixed costs in the business model.'] },
      { term: 'Financial leverage', cat: 'lev', defs: ['The magnifying effect of fixed financing costs (interest, preferred dividends) on how EPS reacts to EBIT.', 'Leverage created by debt in the capital structure.'] },
      { term: 'Total leverage', cat: 'lev', defs: ['The combined effect of fixed operating and financing costs on how EPS reacts to sales.', 'DOL × DFL.'] },
      { term: 'Capital structure', cat: 'cs', defs: ['The mix of debt and equity a company uses to finance itself.'] },
      { term: 'Tax shield', cat: 'cs', defs: ['The tax saving from deducting interest expenses before tax.', 'Why net income falls by less than the extra interest when a firm borrows more.'] },
      { term: 'Cost of capital', cat: 'cs', defs: ['The return investors require for providing funds — the firm\'s hurdle rate for new investments.'] },
      { term: 'WACC', cat: 'cs', defs: ['The average required return of all capital providers, weighted by their share of capital, with debt cost after tax.'] },
      { term: 'Operating break-even point', cat: 'lev', defs: ['The sales volume at which EBIT equals zero: fixed costs ÷ unit contribution margin.'] },
      { term: 'Earnings available for common stockholders', cat: 'cs', defs: ['Net profit after taxes minus preferred dividends.'] }
    ],
    groups: {
      'Advantages of debt': ['Interest is tax-deductible', 'Cheaper than equity', 'No dilution of ownership'],
      'Advantages of equity': ['No mandatory payments', 'Lower bankruptcy risk', 'Attracts growth investors'],
      'Disadvantages of debt': ['Fixed obligations increase financial risk', 'Higher bankruptcy probability', 'Can hurt credit rating']
    },
    scenarios: [
      { q: ['A car maker with huge factories sees sales drop 10% and its EBIT drop 60%. Which concept explains this?'], a: 'Operating leverage' },
      { q: ['After a new bond issue, EPS swings much more when EBIT changes. Which concept?'], a: 'Financial leverage' },
      { q: ['A project returns 8% but investors in the firm require 9.3% on average. Which number tells you to reject it?'], a: 'WACC' },
      { q: ['Firm A borrows €2.7m more interest than Firm B, but its net income is only €2.0m lower. Why?'], a: 'Tax shield' }
    ],
    tf: [
      { s: 'Leverage magnifies both profits and losses.', t: true, why: 'Fixed costs/obligations stay the same whether sales go up or down.' },
      { s: 'Dividends on common stock are tax-deductible, just like interest.', t: false, why: 'Only interest is tax-deductible.' },
      { s: 'Equity is generally cheaper than debt because there are no mandatory payments.', t: false, why: 'Equity investors take more risk, so they require a higher return — equity is more expensive.' },
      { s: 'Retained earnings are part of common equity when calculating WACC weights.', t: true, why: 'Equity includes retained earnings.' },
      { s: 'If there are no preferred dividends, DFL = EBIT / EBT.', t: true, why: 'PD = 0 drops out of the formula.' },
      { s: 'A consulting firm with low fixed costs typically has higher operating leverage than a car manufacturer.', t: false, why: 'High fixed costs (car manufacturer) = higher operating leverage.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
