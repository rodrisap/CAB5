/* Extra finance drills for seminar-slide exercises not yet drilled (week 3: comparing working-capital positions). */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;

  FSM.addSkill({
    id: 'fin_w3_wc_compare', topic: 'fin_w3', title: 'Working capital: who is better off, and is growth healthy?',
    formula: 'Rule: having other people\'s cash is good (payables); others having your cash is bad (receivables). Compare growth of A/R and inventory with sales growth.',
    build: function (r, c) {
      var C = c.C;
      if (r.chance(0.5)) {
        var s0 = r.range(40, 200, 5) * 1000, sg = r.range(0.1, 0.3, 0.01), s1 = Math.round(s0 * (1 + sg) / 1000) * 1000;
        var ar0 = Math.round(s0 * r.range(0.08, 0.15, 0.01) / 100) * 100, arg = r.chance(0.7) ? r.range(sg + 0.2, sg + 0.6, 0.01) : r.range(sg - 0.05, sg, 0.01), ar1 = Math.round(ar0 * (1 + arg) / 100) * 100;
        var in0 = Math.round(s0 * r.range(0.1, 0.18, 0.01) / 100) * 100, ing = r.chance(0.6) ? r.range(sg + 0.15, sg + 0.45, 0.01) : r.range(sg - 0.05, sg, 0.01), in1 = Math.round(in0 * (1 + ing) / 100) * 100;
        var gS = s1 / s0 - 1, gA = ar1 / ar0 - 1, gI = in1 / in0 - 1, bad = gA > gS + 0.02 || gI > gS + 0.02;
        return {
          intro: ['The CFO of ' + c.company + ' shows these figures (in € thousands).'],
          statement: { title: c.company + ' (€ thousands)', cols: ['Last year', 'This year'], rows: [{ label: 'Net sales', v: [s0 / 1000, s1 / 1000] }, { label: 'Trade receivables', v: [ar0 / 1000, ar1 / 1000] }, { label: 'Inventory', v: [in0 / 1000, in1 / 1000] }] },
          facts: [], layouts: ['statement'],
          parts: [
            { ask: ['By what percentage did sales grow?'], answer: gS, unit: 'pct', dp: 1, steps: [step('(' + F.num(s1 / 1000, 1) + ' − ' + F.num(s0 / 1000, 1) + ') ÷ ' + F.num(s0 / 1000, 1), gS, 'pct', 'growth', 1)] },
            { ask: ['By what percentage did trade receivables grow?'], answer: gA, unit: 'pct', dp: 1, traps: [{ v: (ar1 - ar0) / ar1, why: 'Divide by LAST year\'s value.' }], steps: [step('(' + F.num(ar1 / 1000, 1) + ' − ' + F.num(ar0 / 1000, 1) + ') ÷ ' + F.num(ar0 / 1000, 1), gA, 'pct', 'growth', 1)] },
            { ask: ['By what percentage did inventory grow?'], answer: gI, unit: 'pct', dp: 1, steps: [step('(' + F.num(in1 / 1000, 1) + ' − ' + F.num(in0 / 1000, 1) + ') ÷ ' + F.num(in0 / 1000, 1), gI, 'pct', 'growth', 1)] },
            { kind: 'choice', ask: ['What do you conclude about working capital?'], choices: bad ? ['Risky: more cash is tied up in receivables/inventory than the sales growth justifies', 'Healthy: receivables and inventory grow in line with sales'] : ['Healthy: receivables and inventory grow in line with (or slower than) sales', 'Risky: far more cash is tied up than sales growth justifies'], correctChoice: 0,
              why: 'Sales ' + h.p(gS, 1) + ', receivables ' + h.p(gA, 1) + ', inventory ' + h.p(gI, 1) + '. ' + (bad ? 'Customers take longer to pay and/or stock piles up → improve collection and inventory management.' : 'No extra cash is being tied up relative to sales.') }
          ]
        };
      }
      var eq = r.range(1, 5, 0.5) * 1e6, cashA = r.range(0.2, 0.6, 0.05) * eq, arA = eq - cashA, apB = r.range(0.3, 1, 0.1) * eq, invB = r.range(0.2, 0.5, 0.05) * eq, arB = r.range(0.1, 0.4, 0.05) * eq;
      var cashB = cashA + r.range(0.1, 0.5, 0.05) * eq;
      apB = cashB + invB + arB - eq;
      if (apB < 0.1 * eq) { invB += 0.1 * eq - apB; apB = cashB + invB + arB - eq; }
      var flip = r.chance(0.5), L = flip ? ['B', 'A'] : ['A', 'B'];
      var X = { cash: cashA, ar: arA, inv: 0, ap: 0 }, Y = { cash: cashB, ar: arB, inv: invB, ap: apB };
      var first = flip ? Y : X, second = flip ? X : Y;
      var better = flip ? 'Company A' : 'Company B';
      function bs(o) { return [o.cash, o.ar, o.inv, o.ap, eq]; }
      return {
        intro: ['Two companies have the same equity. Assuming everything else is equal, which one is in the better financial position?'],
        statement: { title: 'Balance sheets (€)', cols: ['Company A', 'Company B'], rows: [{ label: 'Cash', v: [first.cash, second.cash] }, { label: 'Accounts receivable', v: [first.ar, second.ar] }, { label: 'Inventory', v: [first.inv, second.inv] }, { label: 'Accounts payable', v: [first.ap, second.ap] }, { label: 'Equity', v: [eq, eq] }] },
        facts: [], layouts: ['statement'],
        parts: [
          { ask: ['How much more cash does the company with the most cash hold?'], answer: Math.abs(cashB - cashA), unit: 'cur', steps: [step('Difference in cash = ' + C(Math.max(cashA, cashB)) + ' − ' + C(Math.min(cashA, cashB)), Math.abs(cashB - cashA), 'cur', 'balance sheets')] },
          { ask: ['How much of the cash-rich company\'s assets is financed by its suppliers?'], answer: apB, unit: 'cur', steps: [step('Accounts payable = supplier financing', apB, 'cur', 'balance sheet')] },
          { kind: 'choice', ask: ['Which company is in the better financial position?'], choices: [better, better === 'Company A' ? 'Company B' : 'Company A'], correctChoice: 0,
            why: 'Cash is king: it is good to hold cash that belongs to others (payables) and bad when others hold your cash (receivables). ' + better + ' has more cash, partly financed by suppliers, while the other has its money stuck with customers.' }
        ]
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
