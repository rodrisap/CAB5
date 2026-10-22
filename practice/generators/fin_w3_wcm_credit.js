/* Finance Week 3 — Working capital, cash conversion cycle, receivables & credit policy (Ch. 15 excl. 15.3) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;

  FSM.calc = FSM.calc || {};
  /* pure calculations (also used by tests) */
  FSM.calc.credit = function (o) {
    var x = {};
    x.s0 = o.u0 * o.P; x.s1 = o.u1 * o.P;
    x.cm0 = o.u0 * (o.P - o.VC); x.cm1 = o.u1 * (o.P - o.VC); x.dCM = x.cm1 - x.cm0;
    x.bad0 = (o.b0 || 0) * x.s0; x.bad1 = (o.b1 || 0) * x.s1;
    x.disc0 = (o.d0 || 0) * (o.p0 || 0) * x.s0; x.disc1 = (o.d1 || 0) * (o.p1 || 0) * x.s1;
    x.dOther = (x.bad1 + x.disc1) - (x.bad0 + x.disc0);
    x.ar0 = (x.s0 - x.disc0) * o.acp0 / 365; x.ar1 = (x.s1 - x.disc1) * o.acp1 / 365; x.dAR = x.ar1 - x.ar0;
    x.costAR = x.dAR * o.rrr;
    x.net = x.dCM - x.dOther - x.costAR;
    return x;
  };
  FSM.calc.minACP = function (o) {
    var x = {};
    x.s0 = o.u0 * o.P; x.s1 = o.u1 * o.P; x.disc = o.d * o.p * x.s1;
    x.dCM = (o.u1 - o.u0) * (o.P - o.VC);
    x.gap = x.disc - x.dCM; x.need = x.gap / o.rrr;
    x.ar0 = o.acp0 / 365 * x.s0; x.target = x.ar0 - x.need;
    x.acp = x.target * 365 / (x.s1 - x.disc);
    return x;
  };

  FSM.addTopic({ id: 'fin_w3', area: 'Finance', week: 3, title: 'Working capital & receivables', read: 'Zutter & Smart Ch. 15 (except 15.3)' });

  /* ---------------- Operating cycle / CCC (timeline) ---------------- */
  FSM.addSkill({
    id: 'fin_w3_cycle', topic: 'fin_w3', title: 'Operating cycle & cash conversion cycle',
    formula: 'CCC = AAI + ACP − APP',
    build: function (r, c) {
      var aai = r.int(15, 120), acp = r.int(0, 90), app = r.int(10, 90);
      var oc = aai + acp, ccc = oc - app;
      var variant = r.pick(['forward', 'forward', 'reverseACP', 'reverseAPP']);
      var co = c.company;
      if (variant === 'forward') {
        return {
          intro: [co + ' (' + c.industry + ') wants to understand how long its cash is tied up.', 'You are analysing the working capital of ' + co + '.', 'The CFO of ' + co + ' gives you these averages:'],
          facts: [
            fact('Average age of inventory', aai, 'days', 'Goods stay in inventory for ' + aai + ' days on average.', { dp: 0 }),
            fact('Average collection period', acp, 'days', acp === 0 ? 'All sales are paid in cash immediately.' : 'Customers pay after ' + acp + ' days on average.', { dp: 0 }),
            fact('Average payment period', app, 'days', 'Suppliers are paid after ' + app + ' days on average.', { dp: 0 })
          ],
          noise: [fact('Revenue', r.range(2, 40, 1) * 1e6, 'cur', 'Annual revenue is ' + c.C(r.range(2, 40, 1) * 1e6) + '.')],
          parts: [
            { ask: ['What is the operating cycle?', 'How long is the operating cycle (OC)?', 'Calculate the operating cycle in days.'],
              answer: oc, unit: 'days', dp: 0,
              traps: [{ v: oc - app, why: 'That is the cash conversion cycle (OC − APP), not the operating cycle.' }, { v: aai + app, why: 'The OC is inventory days + collection days; payables are not part of it.' }],
              steps: [step('OC = AAI + ACP = ' + aai + ' + ' + acp, oc, 'days', 'both given', 0)] },
            { ask: ['What is the cash conversion cycle?', 'Calculate the CCC.', 'For how many days is cash tied up in operations (CCC)?'],
              answer: ccc, unit: 'days', dp: 0,
              traps: [{ v: oc + app, why: 'You added the payment period — it must be subtracted (paying later helps you).' }, { v: oc, why: 'That is the operating cycle; subtract the payment period to get the CCC.' }],
              steps: [step('CCC = OC − APP = ' + oc + ' − ' + app, ccc, 'days', 'OC from previous part, APP given', 0)],
              hint: 'CCC = AAI + ACP − APP' },
            { kind: 'choice', ask: ['What does ' + (ccc < 0 ? 'this negative' : 'this') + ' CCC mean?'],
              choices: ccc < 0 ? ['The company receives cash from customers before it pays its suppliers, so operations generate funding.', 'The company must borrow to finance its operations for the full operating cycle.', 'The company has negative working capital and is insolvent.', 'A negative CCC is a calculation error; it cannot happen.']
                : ['Cash leaves the company to pay suppliers ' + ccc + ' days before it comes back from customers, so this period must be financed.', 'Customers pay ' + ccc + ' days before the supplier is paid.', 'Inventory is held for ' + ccc + ' days.', 'The company needs funding for the full operating cycle of ' + oc + ' days.'],
              correctChoice: 0, why: 'The CCC measures the days between paying suppliers and receiving cash from customers. It can be negative.' }
          ]
        };
      }
      if (variant === 'reverseACP') {
        return {
          intro: [co + ' has an operating cycle of ' + oc + ' days.', 'The operating cycle of ' + co + ' is ' + oc + ' days.'],
          facts: [
            fact('Operating cycle', oc, 'days', '', { dp: 0, first: true, s: '' }),
            fact('Average age of inventory', aai, 'days', 'Its average age of inventory is ' + aai + ' days.', { dp: 0 }),
            fact('Average payment period', app, 'days', 'It pays its suppliers after ' + app + ' days.', { dp: 0 })
          ],
          parts: [
            { ask: ['What is its average collection period?', 'How long does it take customers to pay (ACP)?'], answer: acp, unit: 'days', dp: 0,
              traps: [{ v: oc - app, why: 'You subtracted the payment period; ACP = OC − AAI.' }, { v: oc + aai, why: 'ACP = OC − AAI, not OC + AAI.' }],
              steps: [step('OC = AAI + ACP → ACP = OC − AAI = ' + oc + ' − ' + aai, acp, 'days', 'OC and AAI given', 0)] },
            { ask: ['What is its cash conversion cycle?', 'Calculate the CCC.'], answer: ccc, unit: 'days', dp: 0,
              traps: [{ v: oc + app, why: 'The payment period is subtracted.' }],
              steps: [step('CCC = OC − APP = ' + oc + ' − ' + app, ccc, 'days', 'given', 0)] }
          ]
        };
      }
      return {
        intro: [co + ' reports a cash conversion cycle of ' + ccc + ' days.', 'The CCC of ' + co + ' is ' + ccc + ' days.'],
        facts: [
          fact('Cash conversion cycle', ccc, 'days', '', { dp: 0, s: '' }),
          fact('Average age of inventory', aai, 'days', 'Inventory is held ' + aai + ' days on average.', { dp: 0 }),
          fact('Average collection period', acp, 'days', 'Customers pay after ' + acp + ' days.', { dp: 0 })
        ],
        parts: [
          { ask: ['How many days does it take to pay its suppliers?', 'What is the average payment period?'], answer: app, unit: 'days', dp: 0,
            traps: [{ v: ccc - oc, why: 'Sign error: APP = AAI + ACP − CCC.' }, { v: oc + ccc, why: 'APP = OC − CCC.' }],
            steps: [step('OC = AAI + ACP = ' + aai + ' + ' + acp, oc, 'days', 'given', 0), step('APP = OC − CCC = ' + oc + ' − ' + ccc, app, 'days', 'rearranging CCC = OC − APP', 0)] }
        ]
      };
    }
  });

  /* ---------------- CCC from financial statements ---------------- */
  FSM.addSkill({
    id: 'fin_w3_ccc_statements', topic: 'fin_w3', title: 'CCC from financial statements',
    formula: 'AAI = 365 / Inventory turnover · ACP = Avg A/R ÷ (credit sales/365) · APP = Avg A/P ÷ (credit purchases/365)',
    build: function (r, c) {
      var sales = r.range(4, 60, 0.5) * 1e6;
      var cogs = h.r0(sales * r.range(0.45, 0.8, 0.01));
      var inv0 = h.r0(cogs * r.range(0.1, 0.3, 0.01) / 1000) * 1000, inv1 = h.r0(inv0 * r.range(0.85, 1.35, 0.01) / 1000) * 1000;
      var cashSalesPct = r.pick([0, 0, 0.1, 0.2, 0.3]);
      var cashPurchPct = r.pick([0, 0, 0.1, 0.2]);
      var ar0 = h.r0(sales * r.range(0.08, 0.2, 0.01) / 1000) * 1000, ar1 = h.r0(ar0 * r.range(0.85, 1.3, 0.01) / 1000) * 1000;
      var ap0 = h.r0(cogs * r.range(0.06, 0.15, 0.01) / 1000) * 1000, ap1 = h.r0(ap0 * r.range(0.85, 1.3, 0.01) / 1000) * 1000;
      var avgInv = (inv0 + inv1) / 2, avgAR = (ar0 + ar1) / 2, avgAP = (ap0 + ap1) / 2;
      var turnover = cogs / avgInv, aai = 365 / turnover;
      var creditSales = sales * (1 - cashSalesPct);
      var acp = avgAR / (creditSales / 365);
      var purchases = cogs + (inv1 - inv0);
      var creditPurch = purchases * (1 - cashPurchPct);
      var app = avgAP / (creditPurch / 365);
      var ccc = aai + acp - app;
      var C = c.C;
      return {
        layouts: ['statement', 'statement', 'case'],
        intro: ['Use the data of ' + c.company + ' below. Use averages of opening and closing balances and a 365-day year.', 'Below are figures for ' + c.company + ' (' + c.industry + '). Assume 365 days and use average balances.'],
        statement: { title: c.company, cols: ['Opening', 'Closing'], rows: [
          { label: 'Inventory', v: [inv0, inv1] }, { label: 'Accounts receivable', v: [ar0, ar1] }, { label: 'Accounts payable', v: [ap0, ap1] }
        ] },
        facts: [
          fact('Sales', sales, 'cur', 'Annual sales are ' + C(sales) + (cashSalesPct ? ', of which ' + (cashSalesPct * 100) + '% are cash sales' : ', all on credit') + '.', { alsoInText: true }),
          fact('Cost of goods sold', cogs, 'cur', 'Cost of goods sold is ' + C(cogs) + (cashPurchPct ? '; ' + (cashPurchPct * 100) + '% of purchases are paid in cash' : '; all purchases are on credit') + '.', { alsoInText: true }),
          fact('Inventory (opening / closing)', inv0, 'cur', 'Inventory went from ' + C(inv0) + ' to ' + C(inv1) + '.'),
          fact('A/R (opening / closing)', ar0, 'cur', 'Receivables went from ' + C(ar0) + ' to ' + C(ar1) + '.'),
          fact('A/P (opening / closing)', ap0, 'cur', 'Payables went from ' + C(ap0) + ' to ' + C(ap1) + '.')
        ],
        parts: [
          { ask: ['Calculate the average age of inventory (AAI).', 'How many days does inventory sit on average?'], answer: aai, unit: 'days', dp: 1,
            traps: [{ v: 365 / (cogs / inv1), why: 'Use AVERAGE inventory, not closing inventory.' }, { v: 365 / (sales / avgInv), why: 'Inventory turnover uses COGS, not sales.' }],
            steps: [step('Average inventory = (' + C(inv0) + ' + ' + C(inv1) + ') / 2', avgInv, 'cur', 'opening + closing'), step('Inventory turnover = COGS / avg inventory = ' + C(cogs) + ' / ' + C(avgInv), turnover, 'x', 'formula sheet', 2), step('AAI = 365 / ' + turnover.toFixed(2), aai, 'days', 'formula sheet', 1)] },
          { ask: ['Calculate the average collection period (ACP).', 'How long do customers take to pay on average?'], answer: acp, unit: 'days', dp: 1,
            traps: cashSalesPct ? [{ v: avgAR / (sales / 365), why: 'Only credit sales create receivables — exclude cash sales.' }] : [{ v: ar1 / (sales / 365), why: 'Use average receivables.' }],
            steps: [step('Credit sales = ' + C(sales) + ' × ' + ((1 - cashSalesPct) * 100) + '%', creditSales, 'cur', 'cash sales excluded'), step('Average A/R = (' + C(ar0) + ' + ' + C(ar1) + ') / 2', avgAR, 'cur', 'balances'), step('ACP = avg A/R / (credit sales / 365)', acp, 'days', 'formula sheet', 1)] },
          { ask: ['Calculate the average payment period (APP).', 'How long does the company take to pay suppliers?'], answer: app, unit: 'days', dp: 1,
            traps: [{ v: avgAP / (cogs * (1 - cashPurchPct) / 365), why: 'Purchases = COGS + increase in inventory (not just COGS).' }],
            steps: [step('Purchases = COGS + Δinventory = ' + C(cogs) + ' + (' + C(inv1) + ' − ' + C(inv0) + ')', purchases, 'cur', 'inventory roll-forward'), step('Credit purchases = purchases × ' + ((1 - cashPurchPct) * 100) + '%', creditPurch, 'cur', 'cash purchases excluded'), step('Average A/P = (' + C(ap0) + ' + ' + C(ap1) + ') / 2', avgAP, 'cur', 'balances'), step('APP = avg A/P / (credit purchases / 365)', app, 'days', 'formula sheet', 1)] },
          { ask: ['What is the cash conversion cycle?', 'Combine your answers into the CCC.'], answer: ccc, unit: 'days', dp: 1,
            traps: [{ v: aai + acp + app, why: 'APP must be subtracted.' }, { v: aai + acp, why: 'That is the operating cycle.' }],
            steps: [step('CCC = AAI + ACP − APP = ' + aai.toFixed(1) + ' + ' + acp.toFixed(1) + ' − ' + app.toFixed(1), ccc, 'days', 'previous parts', 1)] }
        ]
      };
    }
  });

  /* ---------------- Change in working capital → cash flow ---------------- */
  FSM.addSkill({
    id: 'fin_w3_wc_cashflow', topic: 'fin_w3', title: 'Working capital changes and cash flow',
    formula: 'Working capital = CA − CL · ↑CA = cash outflow · ↑CL = cash inflow',
    build: function (r, c) {
      var items = [
        ['Accounts receivable', 'CA'], ['Inventory', 'CA'], ['Prepaid expenses', 'CA'],
        ['Accounts payable', 'CL'], ['Accrued wages', 'CL'], ['Short-term borrowings', 'CL']
      ];
      var vals = items.map(function (it) {
        var a = r.range(100, 2000, 10) * 1000;
        var b = h.r0(a * r.range(0.7, 1.5, 0.05) / 1000) * 1000;
        if (a === b) b += 50000;
        return { name: it[0], side: it[1], a: a, b: b };
      });
      var cash0 = r.range(200, 1500, 10) * 1000, cash1 = r.range(200, 1500, 10) * 1000;
      var ca0 = cash0, ca1 = cash1, cl0 = 0, cl1 = 0;
      vals.forEach(function (x) { if (x.side === 'CA') { ca0 += x.a; ca1 += x.b; } else { cl0 += x.a; cl1 += x.b; } });
      var wc0 = ca0 - cl0, wc1 = ca1 - cl1;
      var target = r.pick(vals);
      var inc = target.b > target.a;
      var isInflow = (target.side === 'CA') ? !inc : inc;
      var rows = [{ label: 'Cash', v: [cash0, cash1] }].concat(vals.filter(function (x) { return x.side === 'CA'; }).map(function (x) { return { label: x.name, v: [x.a, x.b] }; }))
        .concat([{ label: 'Total current assets', v: [ca0, ca1], total: true }])
        .concat(vals.filter(function (x) { return x.side === 'CL'; }).map(function (x) { return { label: x.name, v: [x.a, x.b] }; }))
        .concat([{ label: 'Total current liabilities', v: [cl0, cl1], total: true }]);
      var C = c.C;
      return {
        layouts: ['statement', 'statement', 'case'],
        intro: ['Extract from the balance sheet of ' + c.company + ':', c.company + ' reports the following current items:'],
        statement: { title: c.company, cols: ['2025', '2026'], rows: rows },
        facts: rows.map(function (x) { return fact(x.label + ' (2025 / 2026)', x.v[0], 'cur', x.label + ' moved from ' + C(x.v[0]) + ' to ' + C(x.v[1]) + '.'); }),
        parts: [
          { ask: ['Calculate working capital in 2026.', 'What is net working capital at the end of 2026?'], answer: wc1, unit: 'cur',
            traps: [{ v: ca1, why: 'Working capital = current assets − current liabilities.' }, { v: wc1 - wc0, why: 'That is the change, not the level.' }],
            steps: [step('WC 2026 = CA − CL = ' + C(ca1) + ' − ' + C(cl1), wc1, 'cur', 'totals in the table')] },
          { ask: ['By how much did working capital change from 2025 to 2026?', 'What is the change in working capital?'], answer: wc1 - wc0, unit: 'cur',
            traps: [{ v: wc0 - wc1, why: 'Sign: change = new − old.' }],
            steps: [step('WC 2025 = ' + C(ca0) + ' − ' + C(cl0), wc0, 'cur', 'totals'), step('Change = ' + C(wc1) + ' − ' + C(wc0), wc1 - wc0, 'cur', 'new − old')] },
          { kind: 'choice', ask: ['The change in “' + target.name + '” (' + C(target.a) + ' → ' + C(target.b) + ') is a…', 'How does the movement in ' + target.name.toLowerCase() + ' affect cash?'],
            choices: [isInflow ? 'cash inflow' : 'cash outflow', isInflow ? 'cash outflow' : 'cash inflow', 'no effect on cash', 'only an accounting effect, not a cash effect'],
            correctChoice: 0,
            why: target.name + ' is a current ' + (target.side === 'CA' ? 'asset' : 'liability') + ' that ' + (inc ? 'increased' : 'decreased') + '. ' + (target.side === 'CA' ? 'More current assets tie up cash (outflow); fewer release cash (inflow).' : 'More current liabilities mean you keep cash longer (inflow); fewer mean you paid (outflow).') }
        ]
      };
    }
  });

  /* ---------------- Credit policy (instructor's method, mirrors FSM_CreditTerms.xlsx) ---------------- */
  function creditScenario(r) {
    return r.pick(['relax', 'tighten', 'introduce', 'remove']);
  }
  FSM.addSkill({
    id: 'fin_w3_credit_policy', topic: 'fin_w3', title: 'Credit policy change: net effect',
    formula: 'Net effect = ΔCM − Δ(bad debts + discounts) − ΔA/R × required return; A/R = (sales − discounts) × ACP/365',
    build: function (r, c) {
      var sc = creditScenario(r);
      var P = r.range(20, 600, 1);
      var VC = h.r0(P * r.range(0.5, 0.85, 0.01));
      var u0 = r.range(5, 60, 1) * 1000;
      var acp0 = r.int(25, 90);
      var rrr = r.int(6, 18) / 100;
      var u1, acp1, b0 = 0, b1 = 0, d0 = 0, p0 = 0, d1 = 0, p1 = 0;
      if (sc === 'relax') { u1 = h.r0(u0 * r.range(1.05, 1.35, 0.01)); acp1 = acp0 + r.int(5, 30); b0 = r.int(1, 5) / 100; b1 = b0 + r.int(1, 5) / 100; }
      else if (sc === 'tighten') { u1 = h.r0(u0 * r.range(0.7, 0.95, 0.01)); acp1 = acp0 - r.int(5, Math.min(25, acp0 - 10)); b0 = r.int(3, 8) / 100; b1 = Math.max(0.01, b0 - r.int(1, 4) / 100); }
      else if (sc === 'introduce') { u1 = h.r0(u0 * r.range(1, 1.12, 0.01)); acp1 = acp0 - r.int(10, Math.min(35, acp0 - 10)); d1 = r.pick([1, 1.5, 2, 2.5, 3]) / 100; p1 = r.range(40, 85, 5) / 100; b0 = r.chance(0.4) ? r.int(1, 3) / 100 : 0; b1 = b0; }
      else { u1 = h.r0(u0 * r.range(0.9, 1, 0.01)); acp1 = acp0 + r.int(10, 30); d0 = r.pick([1, 1.5, 2, 2.5, 3]) / 100; p0 = r.range(40, 85, 5) / 100; b0 = r.chance(0.4) ? r.int(1, 3) / 100 : 0; b1 = b0; }
      var X = FSM.calc.credit({ P: P, VC: VC, u0: u0, u1: u1, acp0: acp0, acp1: acp1, rrr: rrr, b0: b0, b1: b1, d0: d0, p0: p0, d1: d1, p1: p1 });
      var s0 = X.s0, s1 = X.s1, cm0 = X.cm0, cm1 = X.cm1, dCM = X.dCM, bad0 = X.bad0, bad1 = X.bad1, disc0 = X.disc0, disc1 = X.disc1;
      var dOther = X.dOther, ar0 = X.ar0, ar1 = X.ar1, dAR = X.dAR, costAR = X.costAR, net = X.net;
      var C = c.C, co = c.company;
      var desc = {
        relax: [co + ' considers relaxing its credit standards to boost sales.', 'To grow, ' + co + ' wants to loosen its credit terms.'],
        tighten: [co + ' considers tightening its credit terms to reduce the collection period.', 'Management of ' + co + ' wants stricter credit standards to cut bad debts.'],
        introduce: [co + ' considers introducing a ' + (d1 * 100) + '% discount for early payment.', 'To speed up collections, ' + co + ' wants to offer a ' + (d1 * 100) + '% cash discount.'],
        remove: [co + ' considers scrapping its ' + (d0 * 100) + '% early-payment discount to cut costs.', 'To save money, ' + co + ' wants to stop offering its ' + (d0 * 100) + '% cash discount.']
      }[sc];
      var facts = [
        fact('Price per unit', P, 'cur', co + ' sells its product for ' + C(P) + ' per unit;'),
        fact('Variable cost per unit', VC, 'cur', 'the variable cost is ' + C(VC) + ' per unit.'),
        fact('Credit sales now (units)', u0, 'units', 'Currently it sells ' + F.num(u0) + ' units a year on credit,'),
        fact('Credit sales expected (units)', u1, 'units', 'which is expected to become ' + F.num(u1) + ' units.'),
        fact('Average collection period now', acp0, 'days', 'The average collection period is ' + acp0 + ' days now', { dp: 0 }),
        fact('Average collection period expected', acp1, 'days', 'and is expected to become ' + acp1 + ' days.', { dp: 0 }),
        fact('Required rate of return', rrr, 'pct', 'The company requires a ' + (rrr * 100) + '% return on its investments.', { dp: 0 })
      ];
      if (b0 || b1) {
        if (b0 === b1) facts.push(fact('Bad debts (% of sales)', b0, 'pct', 'Bad debts are ' + (b0 * 100) + '% of sales and are not expected to change.', { dp: 0 }));
        else { facts.push(fact('Bad debts now (% of sales)', b0, 'pct', 'Bad debts are currently ' + (b0 * 100) + '% of sales', { dp: 0 })); facts.push(fact('Bad debts expected (% of sales)', b1, 'pct', 'and would become ' + (b1 * 100) + '% of sales.', { dp: 0 })); }
      }
      if (sc === 'introduce') facts.push(fact('Customers expected to take the discount', p1, 'pct', F.num(p1 * 100) + '% of customers are expected to take the discount.', { dp: 0 }));
      if (sc === 'remove') facts.push(fact('Customers currently taking the discount', p0, 'pct', 'Currently ' + F.num(p0 * 100) + '% of customers take the discount.', { dp: 0 }));
      var noise = [fact('Fixed costs', r.range(100, 900, 10) * 1000, 'cur', 'Fixed costs of ' + C(r.range(100, 900, 10) * 1000) + ' are unaffected.')];

      var stepsCM = [
        step('Old CM = ' + F.num(u0) + ' × (' + C(P) + ' − ' + C(VC) + ')', cm0, 'cur', 'units × unit CM'),
        step('New CM = ' + F.num(u1) + ' × (' + C(P) + ' − ' + C(VC) + ')', cm1, 'cur', 'units × unit CM'),
        step('ΔCM = new − old', dCM, 'cur', 'difference')
      ];
      var hasBad = b0 || b1, hasDisc = d0 || d1;
      var costName = hasBad && hasDisc ? 'bad debts + discounts' : hasDisc ? 'discount cost' : 'bad debts';
      function costExpr(b, d, p, base) {
        var t = [];
        if (hasBad) t.push(F.num(b * 100) + '% × ' + base);
        if (hasDisc) t.push(F.num(d * 100) + '% × ' + F.num(p * 100) + '% × ' + base);
        return t.join(' + ');
      }
      var stepsOther = [
        step('Old sales = ' + F.num(u0) + ' × ' + C(P), s0, 'cur', 'units × price'),
        step('New sales = ' + F.num(u1) + ' × ' + C(P), s1, 'cur', 'units × price'),
        step('Old ' + costName + ' = ' + costExpr(b0, d0, p0, 'old sales'), bad0 + disc0, 'cur', 'rates given'),
        step('New ' + costName + ' = ' + costExpr(b1, d1, p1, 'new sales'), bad1 + disc1, 'cur', 'rates given'),
        step('Δ costs = new − old', dOther, 'cur', 'difference')
      ];
      var stepsAR = [
        step('Old A/R = (' + C(s0) + ' − ' + C(disc0) + ') × ' + acp0 + '/365', ar0, 'cur', '(sales − discount) × ACP/365'),
        step('New A/R = (' + C(s1) + ' − ' + C(disc1) + ') × ' + acp1 + '/365', ar1, 'cur', '(sales − discount) × ACP/365'),
        step('ΔA/R = new − old', dAR, 'cur', 'difference'),
        step('Cost of ΔA/R = ΔA/R × ' + (rrr * 100) + '%', costAR, 'cur', 'required return given')
      ];
      var arVC = ((u1 * VC) * acp1 / 365 - (u0 * VC) * acp0 / 365) * rrr;
      var ar360 = (((s1 - disc1) * acp1 / 360) - ((s0 - disc0) * acp0 / 360)) * rrr;
      var arGross = ((s1 * acp1 / 365) - (s0 * acp0 / 365)) * rrr;
      var netTraps = [
        { v: dCM - dOther, why: 'You forgot the financing cost of the change in accounts receivable.' },
        { v: dCM - dOther - arVC, why: 'The instructor\'s method values A/R at sales (net of discounts), not at variable cost.' },
        { v: dCM - dOther - ar360, why: 'Use a 365-day year.' },
        { v: dCM - dOther - ar1 * rrr, why: 'Apply the required return to the CHANGE in A/R, not the total.' },
        { v: dCM + dOther - costAR, why: 'Higher bad debts/discounts are a cost — subtract them.' }
      ];
      if (disc0 || disc1) netTraps.push({ v: dCM - dOther - arGross, why: 'A/R is based on sales net of the discount.' });
      var decision = net > 0;
      var full = r.chance(0.65);
      var parts = full ? [
        { ask: ['What is the change in contribution margin?', '(1) Effect on sales: calculate the change in contribution margin.', 'By how much does the contribution margin change?'],
          answer: dCM, unit: 'cur', traps: [{ v: (u1 - u0) * P, why: 'Use contribution margin per unit (price − variable cost), not the price.' }],
          steps: stepsCM, method: ['Find unit contribution margin (price − variable cost)', 'Multiply by old and new units', 'Take the difference'] },
        { ask: ['What is the change in ' + costName + '?', '(2) Calculate the change in other costs (' + costName + ').'],
          answer: dOther, unit: 'cur', traps: [{ v: -dOther, why: 'Sign: new costs − old costs.' }], steps: stepsOther },
        { ask: ['What is the cost of the change in accounts receivable?', '(3) Calculate the (opportunity) cost of the change in A/R.', 'What does the change in receivables cost the company per year?'],
          answer: costAR, unit: 'cur',
          traps: [{ v: arVC, why: 'Value A/R at sales (net of discounts), not at variable cost.' }, { v: ar360, why: 'Use 365 days.' }, { v: ar1 * rrr, why: 'Only the CHANGE in A/R creates an extra cost.' }, { v: dAR, why: 'Multiply the change in A/R by the required return.' }],
          steps: stepsAR, method: ['Calculate old and new sales (net of discounts)', 'Calculate old and new average A/R with ACP/365', 'Take the change in A/R', 'Multiply by the required rate of return'] },
        { ask: ['What is the net effect on profit?', 'Net effect of the plan (1) − (2) − (3)?', 'Calculate the overall effect of the proposal.'],
          answer: net, unit: 'cur', traps: netTraps,
          steps: [step('Net = ΔCM − Δcosts − cost of ΔA/R = ' + C(dCM) + ' − ' + C(dOther) + ' − ' + C(costAR), net, 'cur', 'parts 1–3')] },
        { kind: 'choice', ask: ['Should the company implement the plan?'], choices: decision ? ['Yes — the net effect is positive.', 'No — the net effect is negative.'] : ['No — the net effect is negative.', 'Yes — the net effect is positive.'], correctChoice: 0, why: 'Accept when the net effect on profit is positive.' }
      ] : [
        { ask: ['Should the plan be implemented? Calculate the net effect on profit (positive = implement).', 'What is the net profit effect of the proposed change?', 'Calculate the net financial impact of this credit-policy change.'],
          answer: net, unit: 'cur', traps: netTraps,
          steps: stepsCM.concat(stepsOther).concat(stepsAR).concat([step('Net effect = ΔCM − Δcosts − cost of ΔA/R', net, 'cur', 'combine'), (net > 0 ? 'Positive → implement.' : 'Negative → do not implement.')]),
          method: ['Change in contribution margin', 'Change in bad debts / discount costs', 'Cost of the change in accounts receivable', 'Net effect and decision'] }
      ];
      return { intro: desc, facts: facts, noise: noise, parts: parts };
    }
  });

  /* ---------------- Minimum ACP to accept a discount (Klein's Tools reverse) ---------------- */
  FSM.addSkill({
    id: 'fin_w3_min_acp', topic: 'fin_w3', title: 'Reverse: minimum collection period for a discount plan',
    formula: 'A/R = (ACP/365) × net sales; cost saving = ΔA/R × required return',
    build: function (r, c) {
      var P, VC, u0, u1, d, p, acp0, rrr, s0, s1, disc, dCM, gap, need, ar0, target, x, tries = 0;
      do {
        P = r.range(15, 200, 1); VC = h.r0(P * r.range(0.55, 0.85, 0.01));
        u0 = r.range(10, 80, 1) * 1000; u1 = h.r0(u0 * r.range(1.01, 1.08, 0.01));
        d = r.pick([1, 1.5, 2, 2.5, 3]) / 100; p = r.range(50, 90, 5) / 100;
        acp0 = r.int(40, 90); rrr = r.int(8, 20) / 100;
        var M = FSM.calc.minACP({ P: P, VC: VC, u0: u0, u1: u1, d: d, p: p, acp0: acp0, rrr: rrr });
        s0 = M.s0; s1 = M.s1; disc = M.disc; dCM = M.dCM; gap = M.gap; need = M.need; ar0 = M.ar0; target = M.target; x = M.acp;
        tries++;
      } while ((gap <= 0 || x <= 5 || x >= acp0) && tries < 40);
      var C = c.C;
      return {
        intro: [c.company + ' is considering a ' + (d * 100) + '% discount for early payment to speed up collections.', 'To collect faster, ' + c.company + ' plans to offer customers a ' + (d * 100) + '% cash discount.'],
        facts: [
          fact('Current ACP', acp0, 'days', 'The current average collection period is ' + acp0 + ' days.', { dp: 0 }),
          fact('Units sold now', u0, 'units', 'Annual sales are ' + F.num(u0) + ' units'),
          fact('Units sold with discount', u1, 'units', 'and would rise to ' + F.num(u1) + ' units.'),
          fact('Price per unit', P, 'cur', 'The price is ' + C(P) + ' per unit'),
          fact('Variable cost per unit', VC, 'cur', 'and the variable cost ' + C(VC) + ' per unit.'),
          fact('Customers taking the discount', p, 'pct', F.num(p * 100) + '% of customers are expected to take the discount.', { dp: 0 }),
          fact('Required rate of return', rrr, 'pct', 'The required rate of return is ' + (rrr * 100) + '%.', { dp: 0 })
        ],
        parts: [
          { ask: ['What is the minimum reduction in the average collection period needed? Give the NEW average collection period that makes the plan break even.', 'Below which average collection period (in days) does the discount plan become worthwhile?', 'What is the highest new ACP at which the plan still breaks even?'],
            answer: x, unit: 'days', dp: 1,
            traps: [{ v: target * 365 / s1, why: 'Use net sales (after the discount) for the new A/R.' }, { v: (ar0 - gap) * 365 / (s1 - disc), why: 'Divide the required saving by the required return to find the needed fall in A/R.' }],
            steps: [
              step('Sales now = ' + F.num(u0) + ' × ' + C(P), s0, 'cur', 'given'),
              step('Sales new = ' + F.num(u1) + ' × ' + C(P), s1, 'cur', 'given'),
              step('ΔCM = (' + F.num(u1) + ' − ' + F.num(u0) + ') × (' + C(P) + ' − ' + C(VC) + ')', dCM, 'cur', 'extra units × unit CM'),
              step('Discount cost = ' + (d * 100) + '% × ' + F.num(p * 100) + '% × ' + C(s1), disc, 'cur', 'rate × take-up × new sales'),
              step('Net loss before A/R effect = discount − ΔCM', gap, 'cur', 'must be covered by A/R savings'),
              step('Required fall in A/R = ' + C(h.r2(gap)) + ' / ' + (rrr * 100) + '%', need, 'cur', 'saving = ΔA/R × required return'),
              step('Current A/R = ' + acp0 + '/365 × ' + C(s0), ar0, 'cur', 'ACP/365 × sales'),
              step('Target A/R = current A/R − required fall', target, 'cur', 'difference'),
              step('New ACP = target A/R × 365 / (new sales − discount)', x, 'days', 'A/R = ACP/365 × net sales', 1)
            ],
            method: ['Calculate the change in contribution margin', 'Calculate the cost of the discount', 'Divide the net loss by the required return to find the needed fall in A/R', 'Calculate current A/R and the target A/R', 'Solve the A/R formula for the new ACP'] }
        ]
      };
    }
  });

  /* ---------------- Bad debts only (GreenLeaf) ---------------- */
  FSM.addSkill({
    id: 'fin_w3_bad_debts', topic: 'fin_w3', title: 'Credit standards: profit after bad debts',
    formula: 'Profit after bad debts = CM − bad-debt % × sales',
    build: function (r, c) {
      var P = r.range(50, 900, 10), VC = h.r0(P * r.range(0.55, 0.8, 0.01));
      var u0 = r.range(5, 40, 1) * 1000, u1 = h.r0(u0 * r.range(1.08, 1.35, 0.01));
      var b0 = r.int(1, 4) / 100, b1 = b0 + r.int(1, 4) / 100;
      var cm0 = u0 * (P - VC), cm1 = u1 * (P - VC), bd0 = b0 * u0 * P, bd1 = b1 * u1 * P;
      var C = c.C;
      return {
        intro: [c.company + ' sells on credit and considers relaxing its credit standards.', c.company + ' wants to relax its credit standards.'],
        facts: [
          fact('Price per unit', P, 'cur', 'Each unit sells for ' + C(P) + '.'),
          fact('Variable cost per unit', VC, 'cur', 'The variable cost is ' + C(VC) + ' per unit.'),
          fact('Units sold now', u0, 'units', 'Sales are currently ' + F.num(u0) + ' units.'),
          fact('Units sold with relaxed standards', u1, 'units', 'Relaxing credit standards would raise sales to ' + F.num(u1) + ' units.'),
          fact('Bad debts now (% of sales)', b0, 'pct', 'Bad debts are now ' + (b0 * 100) + '% of sales', { dp: 0 }),
          fact('Bad debts expected (% of sales)', b1, 'pct', 'and would rise to ' + (b1 * 100) + '%. Ignore any effect on receivables.', { dp: 0 })
        ],
        parts: [
          { ask: ['What is current profit from credit sales after bad debts?', 'Calculate today\'s contribution margin minus bad debts.'], answer: cm0 - bd0, unit: 'cur',
            traps: [{ v: cm0, why: 'Deduct bad debts.' }, { v: cm0 - b0 * u0 * VC, why: 'Bad debts are a % of SALES, not of variable cost.' }],
            steps: [step('CM = ' + F.num(u0) + ' × (' + C(P) + ' − ' + C(VC) + ')', cm0, 'cur', 'units × unit CM'), step('Bad debts = ' + (b0 * 100) + '% × ' + C(u0 * P), bd0, 'cur', '% of sales'), step('Profit after bad debts', cm0 - bd0, 'cur', 'CM − bad debts')] },
          { ask: ['What would profit after bad debts be under the new policy?', 'Calculate the new contribution margin minus bad debts.'], answer: cm1 - bd1, unit: 'cur',
            traps: [{ v: cm1, why: 'Deduct bad debts.' }],
            steps: [step('CM = ' + F.num(u1) + ' × (' + C(P) + ' − ' + C(VC) + ')', cm1, 'cur', 'units × unit CM'), step('Bad debts = ' + (b1 * 100) + '% × ' + C(u1 * P), bd1, 'cur', '% of sales'), step('Profit after bad debts', cm1 - bd1, 'cur', 'CM − bad debts')] },
          { kind: 'choice', ask: ['Should the company relax its credit standards (ignoring the effect on receivables)?'], choices: (cm1 - bd1 > cm0 - bd0) ? ['Yes, profit after bad debts increases.', 'No, profit after bad debts falls.'] : ['No, profit after bad debts falls.', 'Yes, profit after bad debts increases.'], correctChoice: 0, why: 'Compare profit after bad debts under both policies.' }
        ]
      };
    }
  });

  /* ---------------- Concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w3_concepts', topic: 'fin_w3', title: 'Receivables management concepts (5 Cs, monitoring, terms)',
    items: [
      { term: 'Character', cat: '5C', defs: ['The applicant\'s record of meeting past obligations — will they honour the debt?', 'Trustworthiness and payment history of the customer.'] },
      { term: 'Capacity', cat: '5C', defs: ['The customer\'s ability to repay out of its operating cash flows (or a consumer\'s income).', 'Can the customer generate enough cash to pay us?'] },
      { term: 'Capital', cat: '5C', defs: ['The financial strength of the applicant, e.g. its equity relative to debt.', 'Does the customer have a strong balance sheet / financial cushion?'] },
      { term: 'Collateral', cat: '5C', defs: ['Assets the applicant pledges that can be claimed if it doesn\'t pay.', 'What can we recover if the customer defaults?'] },
      { term: 'Conditions', cat: '5C', defs: ['The general economic and industry situation affecting the applicant.', 'External factors (economy, industry) that influence repayment risk.'] },
      { term: 'Credit selection', cat: 'element', defs: ['Deciding which customers are allowed to buy on credit and how much.', 'The element of receivables management that answers “who receives credit?”.'] },
      { term: 'Credit monitoring', cat: 'element', defs: ['Ongoing review of customers\' payments to spot problems early.', 'Tracking receivables, e.g. with an aging schedule, to prevent defaults.'] },
      { term: 'Credit terms', cat: 'element', defs: ['The conditions of payment: credit period, cash discount and penalties.', 'How and when customers must pay, e.g. 2/10 net 30.'] },
      { term: 'Aging schedule', cat: 'tool', defs: ['A report that splits receivables by how long they have been outstanding.', 'A tool that shows which part of A/R is current and which is overdue.'] },
      { term: 'Bad debts', cat: 'tool', defs: ['Receivables that will never be collected.', 'Sales on credit to customers who end up not paying.'] },
      { term: 'Cash conversion cycle', cat: 'cycle', defs: ['The days between paying suppliers and receiving cash from customers.', 'Operating cycle minus the average payment period.'] },
      { term: 'Operating cycle', cat: 'cycle', defs: ['The time from buying raw materials/inventory until the customer pays.', 'Average age of inventory plus average collection period.'] },
      { term: 'Working capital', cat: 'cycle', defs: ['Current assets minus current liabilities.', 'A snapshot of the short-term financial health of a business.'] }
    ],
    groups: {
      '5 Cs of credit': ['Character', 'Capacity', 'Capital', 'Collateral', 'Conditions'],
      'Elements of receivables management': ['Credit selection', 'Credit monitoring', 'Credit terms'],
      'Monitoring tools / metrics': ['Aging schedule', 'Days sales outstanding', '% of receivables past due', 'Bad debt ratio']
    },
    scenarios: [
      { q: ['Before granting credit, you check whether the customer always paid previous suppliers on time. Which C is this?', 'A credit analyst looks at a client\'s history of honouring obligations. Which of the 5 Cs?'], a: 'Character' },
      { q: ['You look at whether the customer\'s operating cash flow is large enough to pay your invoice. Which C?', 'A bank asks whether a consumer\'s salary covers the monthly payments. Which C?'], a: 'Capacity' },
      { q: ['You check the customer\'s debt-to-equity ratio and its equity buffer. Which C?'], a: 'Capital' },
      { q: ['The customer offers a lien on its warehouse if it fails to pay. Which C?'], a: 'Collateral' },
      { q: ['The customer operates in an industry that is in a deep recession. Which C does this affect?'], a: 'Conditions' },
      { q: ['You produce a report showing that 30% of receivables are more than 60 days overdue. Which tool is this?'], a: 'Aging schedule' }
    ],
    tf: [
      { s: 'Relaxing credit standards usually increases sales, bad debts and accounts receivable.', t: true, why: 'All three effects go up when credit is loosened.' },
      { s: 'A larger accounts receivable balance is free for the company because no interest is charged to customers.', t: false, why: 'A/R must be financed with own cash (opportunity cost) or borrowing — valued at the cost of capital / required return.' },
      { s: 'An increase in inventory is a cash outflow.', t: true, why: 'Higher current assets tie up cash.' },
      { s: 'An increase in accounts payable is a cash outflow.', t: false, why: 'Higher current liabilities mean you keep the cash longer — a cash inflow.' },
      { s: 'The cash conversion cycle can never be negative.', t: false, why: 'If you collect from customers before you pay suppliers (e.g. supermarkets), the CCC is negative.' },
      { s: 'In this course, credit-policy questions are solved by looking only at the effects within the period, not with the book\'s capital-budgeting approach.', t: true, why: 'The instructor simplifies the book\'s method.' },
      { s: 'Working capital management aims to collect from customers as late as possible and pay suppliers as early as possible.', t: false, why: 'The opposite: collect early, pay late — without damaging relationships.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
