/* Mock-exam style skills (built after FSM mock exams 1 and 2). Course methods only. */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  var M = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- 1. Effective tax on distributed profit (mock 1, Q1b) ---------- */
  FSM.addSkill({
    id: 'fin_w1_effective_tax', topic: 'fin_w1', title: 'Effective tax: corporate tax + dividend withholding tax',
    formula: 'Corporate tax = profit × T · Withholding = dividend × W · Effective rate = total tax ÷ pre-tax profit',
    build: function (r, c) {
      var C = c.C, P = r.range(0.2, 12, 0.1) * 1e6, T = r.pick([0.19, 0.2, 0.21, 0.25, 0.258, 0.3]), W = r.pick([0.1, 0.15, 0.15, 0.2, 0.25]);
      var pay = r.pick([1, 1, 1, 0.5, 0.6, 0.8]);
      var corp = P * T, after = P - corp, div = after * pay, wht = div * W, tot = corp + wht;
      var base = pay === 1 ? P : P; // effective rate measured on pre-tax profit
      return {
        intro: [c.company + ' (a ' + r.pick(['B.V.', 'N.V.', 'GmbH', 'AG']) + ') earns ' + C(P) + ' profit before tax and pays out ' + (pay === 1 ? 'all of its after-tax profit' : F.num(pay * 100) + '% of its after-tax profit') + ' as dividends.'],
        facts: [fact('Corporate tax rate', T, 'pct', 'The corporate tax rate is ' + F.num(T * 100, 1) + '%.', { dp: 1 }), fact('Dividend withholding tax', W, 'pct', 'Dividends are subject to ' + F.num(W * 100) + '% dividend withholding tax.', { dp: 0 })],
        layouts: ['sentence', 'table'],
        parts: [
          { ask: ['How much corporate tax does the company pay?'], answer: corp, unit: 'cur', traps: [{ v: P * W, why: 'Corporate tax uses the corporate rate.' }], steps: [step('Corporate tax = ' + C(P) + ' × ' + F.num(T * 100, 1) + '%', corp, 'cur', 'corporate rate')] },
          { ask: ['How much dividend withholding tax is paid?'], answer: wht, unit: 'cur', traps: [{ v: P * W, why: 'Withholding tax is on the DIVIDEND, which is paid out of after-tax profit.' }],
            steps: [step('After-tax profit = ' + C(P) + ' − ' + C(corp), after, 'cur', 'profit − corporate tax'), step('Dividend = ' + C(after) + (pay === 1 ? '' : ' × ' + F.num(pay * 100) + '%'), div, 'cur', 'payout'), step('Withholding = ' + C(div) + ' × ' + F.num(W * 100) + '%', wht, 'cur', 'withholding rate')] },
          { ask: ['What is the effective tax rate on the pre-tax profit (total tax ÷ pre-tax profit)?', 'Calculate the total tax as a percentage of pre-tax profit.'], answer: tot / base, unit: 'pct', dp: 2,
            traps: [{ v: T + W, why: 'You cannot just add the rates: withholding applies to the smaller after-tax amount.' }, { v: T, why: 'Include the dividend withholding tax.' }],
            steps: [step('Total tax = ' + C(corp) + ' + ' + C(wht), tot, 'cur', 'both taxes'), step('Effective rate = ' + C(tot) + ' / ' + C(base), tot / base, 'pct', 'total ÷ pre-tax profit', 2)] }
        ]
      };
    }
  });

  /* ---------- 2. Which steps raise funds for the company (mock 2, Q1b) ---------- */
  FSM.addSkill({
    id: 'fin_w1_raise_funds', topic: 'fin_w1', title: 'Which financing steps raise money for the company?',
    formula: 'Primary transaction (company issues new shares/debt) = money for the company; secondary (owners sell existing shares) = money for the sellers',
    build: function (r, c) {
      var C = c.C, fam = r.pick(['The founding family', 'The two founders', 'The Jansen family', 'The founder']);
      var a = r.range(100, 900, 50) * 1000, pct = r.pick([20, 25, 30, 40]), vc = r.range(3, 12, 1) * a / 4, newP = r.range(1, 6, 0.5) * 1e6, val = r.range(8, 40, 1) * 1e6;
      var all = [
        { t: fam + ' founded the company, investing ' + C(a) + ' of their own money for 100% of the shares.', y: true, amt: a, why: 'New shares are issued to the founders: the money goes INTO the company.' },
        { t: fam + ' sold ' + pct + '% of their shares to a venture capital firm for ' + C(vc) + '.', y: false, amt: 0, why: 'Existing shares change owner: the money goes to the family, not to the company (secondary transaction).' },
        { t: 'The company issued ' + C(newP) + ' of new shares to a group of private investors.', y: true, amt: newP, why: 'New shares = primary transaction: the company receives the money.' },
        { t: 'The company went public on the stock exchange at a value of ' + C(val) + ', issuing no new shares.', y: false, amt: 0, why: 'No new shares are issued; only existing owners can sell. The company raises nothing.' },
        { t: 'The company issued a ' + C(newP / 2) + ' bond to finance a new plant.', y: true, amt: newP / 2, why: 'New debt is a primary transaction: the company receives the money.' },
        { t: 'A private investor sold her shares to a pension fund on the stock exchange.', y: false, amt: 0, why: 'Trading between investors (secondary market): the company receives nothing.' }
      ];
      var picks = [0, 1, 2, 3].concat(r.chance(0.5) ? [r.pick([4, 5])] : []);
      var steps = picks.map(function (i) { return all[i]; });
      var total = steps.reduce(function (s, x) { return s + x.amt; }, 0);
      var parts = [{ ask: ['How much money in total did these steps raise FOR THE COMPANY?', 'Add up the funds that actually flowed into the company.'], answer: total, unit: 'cur',
        traps: [{ v: steps.reduce(function (s, x) { return s + (x.amt || 0); }, 0) + vc, why: 'The sale to the VC firm is a secondary transaction: that money goes to the sellers.' }],
        steps: steps.map(function (x, k) { return step('Step ' + (k + 1) + (x.y ? ' raises ' + C(x.amt) : ' raises nothing'), x.amt, 'cur', x.y ? 'primary' : 'secondary'); }).concat([step('Total for the company', total, 'cur', 'sum')]) }];
      var k = r.int(0, steps.length - 1);
      parts.push({ kind: 'choice', ask: ['Does step ' + (k + 1) + ' raise funds for the company?'], choices: steps[k].y ? ['Yes', 'No'] : ['No', 'Yes'], correctChoice: 0, why: steps[k].why });
      return { intro: ['The early financing history of ' + c.company + ':<br>' + steps.map(function (x, i) { return (i + 1) + '. ' + x.t; }).join('<br>')], facts: [], layouts: ['sentence'], parts: parts };
    }
  });

  /* ---------- 3. Three short-term options in euros + EAR (mock 2, Q3) ---------- */
  FSM.addSkill({
    id: 'fin_w4_three_options', topic: 'fin_w4', title: 'Three funding options: euro cost, EAR, one-off choice',
    formula: 'Discount loan r_p = X/(100 − X) · simple r_p = X × d/365 · supplier r_p = CD/(100 − CD) · € cost = amount × r_p · EAR = (1 + r_p)^(365/days) − 1',
    build: function (r, c) {
      var C = c.C, amt = r.range(1, 20, 1) * 100000;
      var X = r.pick([3, 4, 5, 6, 7, 8]), d1 = r.pick([60, 90, 120, 150, 180]);
      var Y = r.range(6, 18, 1), d2 = r.pick([30, 45, 60, 75, 90]);
      var cd = r.pick([1, 1.5, 2, 2.5, 3]), y = r.pick([10, 15, 20]), z = y + r.pick([20, 30, 45, 60]);
      var o = [
        { n: 'a discount loan from ' + r.pick(['Stuttgart Landesbank', 'Nordbank Nederland', 'Harborview Trust Bank', 'Delta Savings Bank']) + ' at ' + X + '% for a period of ' + d1 + ' days', rp: X / (100 - X), days: d1, how: X + ' / (100 − ' + X + ')' },
        { n: 'a regular loan from ' + r.pick(['Rhine Capital', 'Crestline Capital', 'Summit National Bank']) + ' at ' + Y + '% p.a. simple interest for a period of ' + d2 + ' days', rp: Y / 100 * d2 / 365, days: d2, how: Y + '% × ' + d2 + ' / 365' },
        { n: 'a bill from ' + r.pick(['AlloyCraft Suppliers', 'FuelMaster Suppliers', 'PolyChem Trading', 'SteelStructures Ltd.']) + ' with terms ' + cd + '/' + y + ', n/' + z, rp: cd / (100 - cd), days: z - y, how: cd + ' / (100 − ' + cd + ')' }
      ];
      o.forEach(function (x) { x.eur = amt * x.rp; x.ear = Math.pow(1 + x.rp, 365 / x.days) - 1; });
      o[2].eurAlt = o[2].eur; o[2].eur = amt * cd / 100; o[1].earAlt = Y / 100;
      var i = r.int(0, 2), cheapest = o.reduce(function (b, x, k) { return x.eur < o[b].eur ? k : b; }, 0), lowestEar = o.reduce(function (b, x, k) { return x.ear < o[b].ear ? k : b; }, 0);
      var lab = ['Option 1 (discount loan)', 'Option 2 (regular loan)', 'Option 3 (supplier bill)'];
      var recurring = r.chance(0.4);
      var pick = recurring ? lowestEar : cheapest;
      var choices = [lab[pick]].concat(lab.filter(function (_, k) { return k !== pick; }));
      return {
        intro: [c.company + ' needs short-term financing and is evaluating three options, each of which raises ' + C(amt) + ' (365-day year):<br>1) ' + o[0].n + '.<br>2) ' + o[1].n + '.<br>3) ' + o[2].n + '.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is the total interest expense of option ' + (i + 1) + ' in euros?'], answer: o[i].eur, alts: o[i].eurAlt ? [o[i].eurAlt] : [], unit: 'cur', dp: 0,
            traps: i === 0 ? [{ v: amt * X / 100, why: 'Interest is deducted up front, so you must borrow MORE than ' + C(amt) + ': ' + C(amt) + ' ÷ ' + F.num(1 - X / 100, 2) + '. Interest = amount × X/(100 − X).' }] : i === 1 ? [{ v: amt * Y / 100, why: 'Simple interest p.a. must be scaled to ' + d2 + ' days.' }] : [],
            steps: i === 2 ? [step('Cost = ' + cd + '% × ' + C(amt) + ' (discount you give up)', o[2].eur, 'cur', 'course case method')] : i === 0 ? [step('Amount to borrow = ' + C(amt) + ' ÷ (1 − ' + X + '%)', amt / (1 - X / 100), 'cur', 'gross-up', 2), step('Interest = borrowed − ' + C(amt), o[0].eur, 'cur', '= amount × X/(100 − X)')] : [step('Interest = ' + C(amt) + ' × ' + Y + '% × ' + d2 + '/365', o[1].eur, 'cur', 'simple interest')] },
          { ask: ['What is the effective annual rate (exact, with compounding) of option ' + (i + 1) + '?'], answer: o[i].ear, alts: o[i].earAlt ? [o[i].earAlt] : [], unit: 'pct', dp: 2,
            traps: [{ v: o[i].rp * 365 / o[i].days, why: 'That is the approximate (no compounding) value; the question asks for the exact EAR.' }],
            steps: [step('Days = ' + o[i].days + (i === 2 ? ' (N = ' + z + ' − ' + y + ')' : ''), o[i].days, 'days', 'period length'), step('EAR = (1 + ' + h.p(o[i].rp, 3) + ')^(365/' + o[i].days + ') − 1', o[i].ear, 'pct', 'formula sheet', 2)],
            method: ['Find the period rate r_p for the option', 'Find the number of days of the period', 'Raise (1 + r_p) to the power 365/days', 'Subtract 1'] },
          { kind: 'choice', ask: [recurring ? 'The company expects to need this financing regularly. Which option should it choose?' : 'This is a one-off financing need. Which option should it choose?'], choices: choices, correctChoice: 0,
            why: o.map(function (x, k) { return lab[k] + ': ' + C(x.eur) + ', EAR ' + h.p(x.ear, 2); }).join(' · ') + '. ' + (recurring ? 'Recurring need → lowest EAR.' : 'One-off need → lowest total interest cost (in euros / r_p).') }
        ]
      };
    }
  });

  /* ---------- 4. DOL, DFL (with preferred shares), DTL from a case income statement (mocks Q4) ---------- */
  FSM.addSkill({
    id: 'fin_w5_leverage_case', topic: 'fin_w5', title: 'DOL, DFL and DTL from a contribution income statement',
    formula: 'DOL = CM ÷ EBIT · PD = shares × par × % · DFL = EBIT ÷ (EBT − PD/(1 − T)) · DTL = DOL × DFL',
    build: function (r, c) {
      var C = c.C, S = r.range(20, 150, 1) * 1e6, vr = r.range(0.4, 0.65, 0.01), V = Math.round(S * vr / 1e5) * 1e5, CM = S - V;
      var FC = Math.round(CM * r.range(0.3, 0.6, 0.01) / 1e5) * 1e5, EBIT = CM - FC, I = Math.round(EBIT * r.range(0.04, 0.2, 0.01) / 1e4) * 1e4, EBT = EBIT - I;
      var T = r.pick([0.21, 0.25, 0.25, 0.3]), tax = EBT * T, NI = EBT - tax;
      var nP = r.pick([20000, 40000, 50000, 100000]), par = r.pick([10, 25, 50, 100, 150]), pr = r.pick([4, 5, 6, 8]) / 100, PD = nP * par * pr;
      var dol = CM / EBIT, dfl = EBIT / (EBT - PD / (1 - T)), dtl = dol * dfl, chg = r.pick([1, 2, 5, 10]);
      var bigger = dol > dfl ? 0 : 1;
      return {
        intro: ['Use the income statement of ' + c.company + '. The company has ' + F.num(nP) + ' preferred shares with a par value of ' + C(par) + ' carrying a ' + F.num(pr * 100) + '% preferred dividend.'],
        statement: { title: 'Income statement (' + c.company + ')', cols: ['EUR'], rows: [
          { label: 'Net sales', v: [S] }, { label: 'Total variable costs', v: [V] }, { label: 'Contribution margin', v: [CM] }, { label: 'Total fixed costs', v: [FC] },
          { label: 'EBIT', v: [EBIT] }, { label: 'Interest expense', v: [I] }, { label: 'Earnings before taxes', v: [EBT] }, { label: 'Tax (' + F.num(T * 100) + '%)', v: [Math.round(tax)] }, { label: 'Net profit', v: [Math.round(NI)] }] },
        facts: [], layouts: ['statement'],
        parts: [
          { ask: ['Calculate the degree of operating leverage (DOL).'], answer: dol, unit: 'x', dp: 2, traps: [{ v: S / EBIT, why: 'DOL uses the contribution margin, not sales.' }], steps: [step('DOL = CM ÷ EBIT = ' + C(CM) + ' / ' + C(EBIT), dol, 'x', 'formula sheet', 2)] },
          { ask: ['Calculate the degree of financial leverage (DFL).'], answer: dfl, unit: 'x', dp: 3,
            traps: [{ v: EBIT / EBT, why: 'Include the preferred dividends.' }, { v: EBIT / (EBT - PD), why: 'Preferred dividends are after tax: divide them by (1 − T) first.' }],
            steps: [step('PD = ' + F.num(nP) + ' × ' + C(par) + ' × ' + F.num(pr * 100) + '%', PD, 'cur', 'preferred dividend'), step('PD before tax = ' + C(PD) + ' / (1 − ' + F.num(T * 100) + '%)', PD / (1 - T), 'cur', '÷ (1 − T)'), step('DFL = ' + C(EBIT) + ' / (' + C(EBT) + ' − ' + C(Math.round(PD / (1 - T))) + ')', dfl, 'x', 'formula sheet', 3)] },
          { ask: ['Calculate DTL. By how much does EPS change if sales rise by ' + chg + '%?'], answer: dtl * chg / 100, unit: 'pct', dp: 2,
            traps: [{ v: dtl / 100, why: 'Multiply DTL by the ' + chg + '% change in sales.' }, { v: dol * chg / 100, why: 'That is the change in EBIT; EPS needs DTL = DOL × DFL.' }].filter(function (t) { return Math.abs(t.v - dtl * chg / 100) > 1e-6; }),
            steps: [step('DTL = DOL × DFL = ' + F.num(dol, 2) + ' × ' + F.num(dfl, 3), dtl, 'x', 'formula sheet', 3), step('%ΔEPS = ' + F.num(dtl, 3) + ' × ' + chg + '%', dtl * chg / 100, 'pct', 'DTL × %Δsales', 2)] },
          { kind: 'choice', ask: ['Which type of leverage contributes more to total leverage?'], choices: bigger === 0 ? ['Operating leverage (fixed operating costs)', 'Financial leverage (interest and preferred dividends)'] : ['Financial leverage (interest and preferred dividends)', 'Operating leverage (fixed operating costs)'], correctChoice: 0,
            why: 'DOL ' + F.num(dol, 2) + ' vs DFL ' + F.num(dfl, 2) + '. ' + (bigger === 0 ? 'Risk comes mainly from the cost structure: management should watch sales stability and fixed costs; the low DFL means there is room to use more debt.' : 'Risk comes mainly from the financing: management should be careful with more debt.') }
        ]
      };
    }
  });

  /* ---------- 5. WACC from the balance sheet (mock 1, Q5) ---------- */
  FSM.addSkill({
    id: 'fin_w5_wacc_bs', topic: 'fin_w5', title: 'WACC from book values + project decision',
    formula: 'Weights: LT debt, preferred, common equity (+ retained earnings) · r_d = interest ÷ LT debt · WACC = w_d·r_d·(1 − T) + w_p·r_p + w_s·r_s',
    build: function (r, c) {
      var C = c.C, ltd = M(r.range(10, 60, 0.5)), cl = M(r.range(8, 30, 0.5)), pref = M(r.range(2, 10, 0.5)), cs = M(r.range(20, 50, 0.5)), re = M(r.range(5, 30, 0.5));
      var rd = r.range(5, 10, 0.25) / 100, I = M(ltd * rd * 10) / 10, T = r.pick([0.21, 0.25, 0.25, 0.3]), rp = r.range(5, 8, 0.25) / 100, rs = r.range(7, 12, 0.1) / 100;
      var rdx = I / ltd, eq = cs + re, tot = ltd + pref + eq, x = FSM.calc.wacc({ d: ltd, p: pref, s: eq, rd: rdx, rp: rp, rs: rs, T: T });
      var proj = Math.round((x.wacc + r.pick([-1, 1]) * r.range(0.002, 0.012, 0.001)) * 1000) / 1000;
      var ta = M(cl + ltd + pref + eq);
      return {
        intro: ['Balance sheet of ' + c.company + ' (€ millions). Interest expense was €' + F.num(I, 2) + 'm; assume all of it relates to long-term debt. Tax rate ' + F.num(T * 100) + '%. Cost of preferred equity ' + h.p(rp, 2) + '; cost of common equity ' + h.p(rs, 1) + '.'],
        statement: { title: 'Liabilities & equity (€m)', cols: ['2024'], rows: [{ label: 'Total current liabilities', v: [cl] }, { label: 'Long-term debt', v: [ltd] }, { label: 'Preferred equity', v: [pref] }, { label: 'Common equity', v: [cs] }, { label: 'Retained earnings', v: [re] }, { label: 'Total liabilities & equity', v: [ta] }] },
        facts: [], layouts: ['statement'],
        parts: [
          { ask: ['Calculate the WACC based on the book values of equity and liabilities.'], answer: x.wacc, unit: 'pct', dp: 2,
            traps: [{ v: FSM.calc.wacc({ d: ltd + cl, p: pref, s: eq, rd: I / (ltd + cl), rp: rp, rs: rs, T: T }).wacc, why: 'Leave current liabilities out: WACC uses long-term financing.' }, { v: FSM.calc.wacc({ d: ltd, p: pref, s: cs, rd: rdx, rp: rp, rs: rs, T: T }).wacc, why: 'Common equity includes retained earnings.' }, { v: x.wd * rdx + x.wp * rp + x.ws * rs, why: 'Multiply the cost of debt by (1 − T).' }],
            steps: [step('Common equity = ' + F.num(cs, 1) + ' + ' + F.num(re, 1), eq, 'num', 'incl. retained earnings', 1), step('Total = ' + F.num(ltd, 1) + ' + ' + F.num(pref, 1) + ' + ' + F.num(eq, 1), tot, 'num', 'LT capital', 1), step('r_d = ' + F.num(I, 2) + ' / ' + F.num(ltd, 1), rdx, 'pct', 'interest ÷ LT debt', 3), step('w_d = ' + F.num(x.wd, 4) + ', w_p = ' + F.num(x.wp, 4) + ', w_s = ' + F.num(x.ws, 4), x.wd, 'num', 'weights', 4), step('WACC = ' + F.num(x.wd, 4) + '×' + h.p(rdx, 3) + '×(1−' + F.num(T * 100) + '%) + ' + F.num(x.wp, 4) + '×' + h.p(rp, 2) + ' + ' + F.num(x.ws, 4) + '×' + h.p(rs, 1), x.wacc, 'pct', 'formula sheet', 2)] },
          { kind: 'choice', ask: ['A project with the same risk as the company yields ' + h.p(proj, 1) + '. What should the company do?'], choices: proj > x.wacc ? ['Accept: it earns more than the WACC and creates value', 'Reject: it earns less than the WACC'] : ['Reject: it earns less than the WACC and destroys value', 'Accept: it earns more than the WACC'], correctChoice: 0,
            why: 'Compare the project return (' + h.p(proj, 1) + ') with the WACC (' + h.p(x.wacc, 2) + '). The WACC is the minimum return needed to pay all providers of capital.' }
        ]
      };
    }
  });

  /* ---------- 6. Consolidation: parent after purchase + closing the excess (mocks Q6) ---------- */
  FSM.addSkill({
    id: 'fin_w6_close_excess', topic: 'fin_w6', title: 'Consolidation templates: after purchase, then close the excess',
    formula: 'Before consolidation: + investment, − cash (cash part), + debt (borrowed part) · Excess = price − sub equity → first to asset uplift, rest = goodwill',
    build: function (r, c) {
      var C = c.C, price = r.range(8, 40, 1), cashPct = r.pick([0, 0.2, 0.3, 0.4, 0.5, 1]), cash = M(r.range(price * cashPct + 1, price * cashPct + 10, 0.5));
      var subEq = M(price * r.range(0.6, 0.9, 0.05)), excess = M(price - subEq), uplift = M(Math.min(excess, Math.max(0.5, excess * r.range(0.3, 0.8, 0.1))));
      var gw = M(excess - uplift), ppe = M(r.range(30, 80, 1)), ltd = M(r.range(15, 50, 1));
      var cashAfter = M(cash - price * cashPct), debtAfter = M(ltd + price * (1 - cashPct));
      var v = r.pick(['after', 'close', 'close']);
      if (v === 'after') {
        return {
          intro: [c.company + ' buys 100% of ' + r.pick(['ThermoLink B.V.', 'Merano Components S.r.l.', 'NordPack GmbH', 'Velo Parts B.V.']) + ' for ' + C(price * 1e6) + '. It pays ' + F.num(cashPct * 100) + '% in cash and borrows the rest from the bank (long-term). Before the deal it had cash of ' + C(cash * 1e6) + ' and long-term debt of ' + C(ltd * 1e6) + '.'],
          facts: [], layouts: ['sentence'],
          parts: [
            { ask: ['What is the parent\'s cash immediately after the purchase (before consolidation)?'], answer: cashAfter * 1e6, unit: 'cur', traps: [{ v: cash * 1e6, why: 'The cash part of the price leaves the company.' }], steps: [step('Cash = ' + C(cash * 1e6) + ' − ' + F.num(cashPct * 100) + '% × ' + C(price * 1e6), cashAfter * 1e6, 'cur', 'cash paid')] },
            { ask: ['What is the parent\'s long-term debt immediately after the purchase?'], answer: debtAfter * 1e6, unit: 'cur', traps: [{ v: (ltd + price) * 1e6, why: 'Only the borrowed part (' + F.num((1 - cashPct) * 100) + '%) adds debt.' }], steps: [step('LT debt = ' + C(ltd * 1e6) + ' + ' + F.num((1 - cashPct) * 100) + '% × ' + C(price * 1e6), debtAfter * 1e6, 'cur', 'new bank loan')] },
            { kind: 'choice', ask: ['Which new line appears on the parent\'s balance sheet (the "?" row in the template)?'], choices: ['Investment in subsidiary (at the purchase price)', 'Goodwill', 'Excess of cost over book value', 'Minority interest'], correctChoice: 0, why: 'Before consolidation the parent simply shows what it bought: the investment at cost. Goodwill only appears after consolidation.' }
          ]
        };
      }
      return {
        intro: ['The consolidation of ' + c.company + ' and its new subsidiary is partly done. The consolidated balance sheet still shows <b>Excess of cost over book value</b> of ' + C(excess * 1e6) + ' and PPE (net) of ' + C(ppe * 1e6) + '. The subsidiary\'s non-current assets have a market value ' + C(uplift * 1e6) + ' above their book value.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is goodwill on the final consolidated balance sheet?'], answer: gw * 1e6, unit: 'cur', traps: [{ v: excess * 1e6, why: 'First raise the assets to market value; only the remainder is goodwill.' }], steps: [step('Goodwill = ' + C(excess * 1e6) + ' − ' + C(uplift * 1e6), gw * 1e6, 'cur', 'excess − uplift')], method: ['Find the excess of cost over book value', 'Add the market-value uplift to the non-current assets', 'Call the remainder goodwill', 'Remove the excess line'] },
          { ask: ['What is PPE (net) on the final consolidated balance sheet?'], answer: (ppe + uplift) * 1e6, unit: 'cur', traps: [{ v: ppe * 1e6, why: 'Raise PPE by the market-value uplift.' }], steps: [step('PPE = ' + C(ppe * 1e6) + ' + ' + C(uplift * 1e6), (ppe + uplift) * 1e6, 'cur', 'uplift')] },
          { kind: 'choice', ask: ['What happens to total assets when you close the excess account?'], choices: ['They stay the same (the excess is replaced by higher PPE + goodwill)', 'They rise by the uplift', 'They fall by the excess', 'They rise by the goodwill'], correctChoice: 0, why: 'You only reclassify: excess (' + C(excess * 1e6) + ') = uplift (' + C(uplift * 1e6) + ') + goodwill (' + C(gw * 1e6) + ').' },
          { kind: 'choice', ask: ['Why is the investment in the subsidiary cancelled out against the subsidiary\'s equity?'], choices: ['Otherwise the same net assets are counted twice: once as the parent\'s investment and once line by line', 'Because equity must always equal zero', 'To create goodwill', 'Because the subsidiary pays no dividends'], correctChoice: 0, why: 'The investment represents ownership of the subsidiary\'s net assets, which are already added line by line. The sub\'s equity is owned by the parent, not by outsiders.' }
        ]
      };
    }
  });

  /* ---------- 7. New supplier: effect on stock, costs and ROA (mocks Q7b/Q8) ---------- */
  FSM.addSkill({
    id: 'scm_ch9_supplier_change', topic: 'scm_ch9', title: 'New supplier: cycle stock, safety stock, costs and ROA',
    formula: 'Case rule: cycle stock days ≈ lead time; safety stock days ≈ variability (±days)',
    build: function (r, c) {
      var L = r.pick([12, 14, 18, 20, 24, 30]), v = r.pick([4, 5, 6, 8]), f = r.pick([0.5, 0.5, 0.6, 0.7, 1.5]);
      var kind = r.pick(['better', 'lessReliable', 'moreReliable']);
      if (f > 1) kind = 'moreReliable';
      var L2 = M(L * f), v2 = kind === 'better' ? r.pick([1, 2, 3].filter(function (x) { return x < v; })) : kind === 'lessReliable' ? M(v * r.pick([1.1, 1.2, 1.25])) : M(v * r.pick([0.5, 0.75]));
      var desc = kind === 'better' ? 'cut average lead time by ' + F.num((1 - f) * 100) + '% and reduce variability to ±' + v2 + ' days' : kind === 'lessReliable' ? 'cut average delivery time by ' + F.num((1 - f) * 100) + '% but be ' + F.num((v2 / v - 1) * 100) + '% less reliable (variability ±' + F.num(v2, 1) + ' days)' : (f > 1 ? 'have a ' + F.num((f - 1) * 100) + '% longer lead time but cut variability to ±' + F.num(v2, 1) + ' days' : 'cut lead time by ' + F.num((1 - f) * 100) + '% and variability to ±' + F.num(v2, 1) + ' days');
      var oldT = L + v, newT = L2 + v2;
      var up = '↑ increase', dn = '↓ decrease';
      var ordDir = f < 1 ? up : dn, trDir = f < 1 ? up : dn, roaDir = newT < oldT ? up : dn;
      return {
        intro: [c.company + '\'s supplier lead time averages ' + L + ' days with a variability of ±' + v + ' days, so it holds ' + L + ' days of cycle stock and ' + v + ' days of safety stock. A new supplier promises to ' + desc + ', at the same delivered price.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['How many days of cycle stock will the company need with the new supplier?'], answer: L2, unit: 'days', dp: 1, traps: [{ v: L, why: 'Cycle stock follows the lead time.' }], steps: [step('Cycle stock = new lead time = ' + L + ' × ' + F.num(f, 2), L2, 'days', 'lead time', 1)] },
          { ask: ['How many days of safety stock will it need?'], answer: v2, unit: 'days', dp: 1, traps: [{ v: v, why: 'Safety stock follows the variability (uncertainty).' }], steps: [step('Safety stock = new variability', v2, 'days', '± days', 1)] },
          { kind: 'choice', ask: ['What is the likely effect on order costs?'], choices: [ordDir, ordDir === up ? dn : up, 'No effect'], correctChoice: 0, why: f < 1 ? 'To keep the lower cycle stock, the company orders smaller quantities more often → more orders → higher order costs.' : 'Longer lead times mean larger, less frequent orders → fewer orders → lower order costs.' },
          { kind: 'choice', ask: ['What is the likely effect on transportation costs?'], choices: [trDir, trDir === up ? dn : up, 'No effect'], correctChoice: 0, why: f < 1 ? 'Smaller, more frequent shipments lose consolidation (full loads) → higher transport cost per unit.' : 'Larger, less frequent shipments can be consolidated → lower transport cost per unit.' },
          { kind: 'choice', ask: ['What is the likely effect on return on assets (ROA)?'], choices: [roaDir, roaDir === up ? dn : up, 'No effect'], correctChoice: 0, why: 'Total stock goes from ' + F.num(oldT, 1) + ' to ' + F.num(newT, 1) + ' days, so inventory (assets) ' + (newT < oldT ? 'falls → ROA rises' : 'rises → ROA falls') + ', as long as the change in order and transport costs does not outweigh it.' }
        ]
      };
    }
  });

  /* ---------- 8. Total landed cost, mock-1 style (duty on price + transport, VAT on everything) ---------- */
  FSM.addSkill({
    id: 'scm_ch5_tlc_single', topic: 'scm_ch5', title: 'Total landed cost: duty and VAT chain',
    formula: 'Price + transport → duty % on that → VAT % on (price + transport + duty) → TLC',
    build: function (r, c) {
      var C = c.C, q = r.range(0.5, 8, 0.5) * 1e6, p = r.range(0.4, 4, 0.05), tr = Math.round(q * p * r.range(0.05, 0.25, 0.01) / 1e4) * 1e4;
      var duty = r.pick([0.05, 0.1, 0.12, 0.2, 0.3]), vat = r.pick([0.19, 0.21, 0.21]);
      var price = q * p, base = price + tr, dut = base * duty, sub = base + dut, va = sub * vat, tot = sub + va;
      var origin = r.pick(['China', 'Vietnam', 'India', 'Turkey', 'Brazil']), dest = vat === 0.19 ? 'Germany' : 'the Netherlands';
      return {
        intro: [c.company + ' evaluates a supplier in ' + origin + '. The ex-works price is ' + C(p, 2) + ' per unit for ' + F.num(q) + ' units. Transport to ' + dest + ' costs ' + C(tr) + '. On arrival, customs duty of ' + F.num(duty * 100) + '% is charged on the purchase price plus transport. Finally, VAT of ' + F.num(vat * 100) + '% is levied on the total cost including duty.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['How much customs duty is paid?'], answer: dut, unit: 'cur', traps: [{ v: price * duty, why: 'Duty is charged on price PLUS transport here.' }], steps: [step('Purchase price = ' + F.num(q) + ' × ' + C(p, 2), price, 'cur', 'ex-works'), step('Price + transport = ' + C(price) + ' + ' + C(tr), base, 'cur', 'duty base'), step('Duty = ' + C(base) + ' × ' + F.num(duty * 100) + '%', dut, 'cur', 'duty rate')] },
          { ask: ['What is the total landed cost of this order?', 'Calculate the total landed cost.'], answer: tot, unit: 'cur',
            traps: [{ v: sub, why: 'Add the VAT as well.' }, { v: base * (1 + vat) + dut, why: 'VAT is on the total INCLUDING duty.' }],
            steps: [step('Subtotal = ' + C(base) + ' + ' + C(dut), sub, 'cur', 'incl. duty'), step('VAT = ' + C(sub) + ' × ' + F.num(vat * 100) + '%', va, 'cur', 'VAT rate'), step('TLC = ' + C(sub) + ' + ' + C(va), tot, 'cur', 'sum')],
            method: ['Calculate the purchase price (units × price)', 'Add transport', 'Add duty on price + transport', 'Add VAT on the total including duty'] },
          { ask: ['What is the landed cost per unit?'], answer: tot / q, unit: 'cur', dp: 3, traps: [{ v: p, why: 'That is only the purchase price.' }], steps: [step('Per unit = ' + C(tot) + ' / ' + F.num(q), tot / q, 'cur', 'TLC ÷ units', 3)] }
        ]
      };
    }
  });

  /* ---------- concept drills for open questions ---------- */
  FSM.addConcepts({
    id: 'scm_mock_logistics', topic: 'scm_ch1', title: 'Logistics definition, goal and the 7 Rs',
    items: [
      { term: 'Logistics (definition)', cat: 'd', defs: ['The process of planning, implementing and controlling the efficient and effective flow and storage of goods, services and related information from point of origin to point of consumption to meet customer requirements.'] },
      { term: 'Goal of logistics', cat: 'd', defs: ['To provide an acceptable level of customer service at the lowest possible total cost.'] },
      { term: 'Right product', cat: 'r', defs: ['The customer receives exactly the item (specification, version) that was ordered.'] },
      { term: 'Right customer', cat: 'r', defs: ['The goods go to the person or company that ordered them.'] },
      { term: 'Right place', cat: 'r', defs: ['The goods are delivered to the agreed location (dock, plant, store).'] },
      { term: 'Right quantity', cat: 'r', defs: ['The number of units delivered matches the order: no shortages, no excess.'] },
      { term: 'Right condition', cat: 'r', defs: ['The goods arrive undamaged and within specification (e.g. correct temperature).'] },
      { term: 'Right time', cat: 'r', defs: ['The goods arrive when they are needed — not late and not too early.'] },
      { term: 'Right price', cat: 'r', defs: ['The service is delivered at a cost the customer accepts and that keeps the total cost low.'] }
    ],
    groups: { 'The 7 Rs of logistics customer service': ['Right product', 'Right customer', 'Right place', 'Right quantity', 'Right condition', 'Right time', 'Right price'] },
    scenarios: [
      { q: ['Cold-chain packaging arrives on time and complete but thawed.'], a: 'Right condition' },
      { q: ['A full order of gaskets is delivered to the Prague plant instead of Stuttgart.'], a: 'Right place' },
      { q: ['500 seals were ordered; 450 arrived.'], a: 'Right quantity' },
      { q: ['The parts arrive two days after the production run started.'], a: 'Right time' },
      { q: ['O-rings of the wrong material were shipped.'], a: 'Right product' }
    ],
    tf: [
      { s: 'The goal of logistics is the lowest possible cost.', t: false, why: 'Acceptable customer service at the lowest TOTAL cost.' },
      { s: 'Logistics covers both the flow and the storage of goods and information.', t: true, why: 'Plan, implement and control flow AND storage.' }
    ],
    sequences: [{ title: 'Logistics pipeline', steps: ['Materials management (inbound)', 'Production', 'Physical distribution (outbound)', 'Customer'] }]
  });

  FSM.addConcepts({
    id: 'scm_mock_modes', topic: 'scm_ch11', title: 'Choosing the transport mode for a shipment',
    items: [
      { term: 'Rail', cat: 'm', defs: ['Best for heavy, low-value bulk over long land distances: high capacity, low cost per ton, slower.'] },
      { term: 'Truck', cat: 'm', defs: ['Best for door-to-door, smaller and time-sensitive loads: accessible, fast and reliable, but costly per ton.'] },
      { term: 'Air', cat: 'm', defs: ['Best for urgent, high-value, light goods: fastest and secure, most expensive.'] },
      { term: 'Water', cat: 'm', defs: ['Best for very large, low-value or containerised international volumes: cheapest, slowest.'] },
      { term: 'Pipeline', cat: 'm', defs: ['Only for liquids and gases in large, steady volumes: lowest cost, very reliable, limited network.'] },
      { term: 'Intermodal (rail + truck)', cat: 'm', defs: ['Combines the low cost of rail over distance with truck pickup and delivery to the door.'] }
    ],
    scenarios: [
      { q: ['Heavy, low-value, non-perishable alloys over 1,500 km by land; the plant has no rail siding.'], a: 'Intermodal (rail + truck)' },
      { q: ['Urgent replacement part worth €40,000 needed in Mexico tomorrow.'], a: 'Air' },
      { q: ['Crude oil from a field to a refinery, every day, in large volumes.'], a: 'Pipeline' },
      { q: ['Containers of toys from China to Rotterdam.'], a: 'Water' },
      { q: ['Pallets of food to supermarkets in the same region, daily.'], a: 'Truck' },
      { q: ['Coal from a mine to a power plant 800 km inland.'], a: 'Rail' }
    ],
    tf: [
      { s: 'For heavy, low-value goods the cost per ton matters more than speed.', t: true, why: 'Transport can otherwise be a large part of the product value.' },
      { s: 'A longer, less reliable supply route increases the stock a plant must hold.', t: true, why: 'More in-transit, cycle and safety stock.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
