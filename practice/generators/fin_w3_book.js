/* Finance Week 3 — extra material from Zutter & Smart Ch. 15 (15.1, 15.2, 15.4, 15.5) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};

  FSM.calc.fundingStrategy = function (o) { // perm, avgSeasonal, peakSeasonal, rS, rL, rInvest
    var aggr = o.rS * o.avgSeasonal + o.rL * o.perm;
    var peak = o.perm + o.peakSeasonal;
    var surplus = o.peakSeasonal - o.avgSeasonal;
    var cons = o.rL * peak - o.rInvest * surplus;
    return { aggr: aggr, cons: cons, peak: peak, surplus: surplus };
  };

  /* ---------------- aggressive vs conservative funding (Semper Pump) ---------------- */
  FSM.addSkill({
    id: 'fin_w3_funding_strategy', topic: 'fin_w3', title: 'Permanent vs seasonal needs: aggressive vs conservative funding',
    formula: 'Aggressive: short-term debt for seasonal need, long-term for permanent need · Conservative: long-term for the peak, invest the surplus',
    build: function (r, c) {
      var cash = r.range(10, 80, 5) * 1000, invMin = r.range(50, 400, 10) * 1000, arMin = r.range(30, 300, 10) * 1000, ap = r.range(20, 150, 5) * 1000;
      var invPeak = invMin + r.range(200, 900, 10) * 1000, arPeak = arMin + r.range(100, 500, 10) * 1000;
      var perm = cash + invMin + arMin - ap;
      var peakSeasonal = (cash + invPeak + arPeak - ap) - perm;
      var avgSeasonal = h.r0(peakSeasonal * r.range(0.08, 0.35, 0.01) / 50) * 50;
      var rS = r.range(3, 7, 0.25) / 100, rL = rS + r.range(1, 3, 0.25) / 100, rI = Math.max(0.01, rS - r.range(0.5, 2, 0.25) / 100);
      var x = FSM.calc.fundingStrategy({ perm: perm, avgSeasonal: avgSeasonal, peakSeasonal: peakSeasonal, rS: rS, rL: rL, rInvest: rI });
      var C = c.C, P = function (v) { return F.num(v * 100, 2) + '%'; };
      var parts = [
        { ask: ['What is the permanent funding requirement?', 'How much funding does the firm need all year round (minimum need)?'], answer: perm, unit: 'cur',
          traps: [{ v: cash + invMin + arMin, why: 'Accounts payable finance part of the operating assets — subtract them.' }],
          steps: [step('Minimum operating assets − payables = ' + C(cash) + ' + ' + C(invMin) + ' + ' + C(arMin) + ' − ' + C(ap), perm, 'cur', 'lowest levels of the year')] },
        { ask: ['What is the peak seasonal funding requirement (on top of the permanent need)?'], answer: peakSeasonal, unit: 'cur',
          traps: [{ v: peakSeasonal + perm, why: 'That is the TOTAL peak need; the seasonal part excludes the permanent need.' }],
          steps: [step('Peak need = ' + C(cash) + ' + ' + C(invPeak) + ' + ' + C(arPeak) + ' − ' + C(ap), peakSeasonal + perm, 'cur', 'peak levels'), step('Seasonal peak = total peak − permanent', peakSeasonal, 'cur', 'difference')] },
        { ask: ['What is the annual cost of an aggressive funding strategy?', 'Cost of funding seasonal needs short-term and permanent needs long-term?'], answer: x.aggr, unit: 'cur', dp: 2,
          traps: [{ v: rL * avgSeasonal + rS * perm, why: 'Aggressive = SHORT-term for the seasonal need, LONG-term for the permanent need.' }, { v: rS * peakSeasonal + rL * perm, why: 'Use the AVERAGE seasonal need for the short-term cost.' }],
          steps: [step('Short-term: ' + P(rS) + ' × average seasonal need ' + C(avgSeasonal), rS * avgSeasonal, 'cur', 'short-term rate', 2), step('Long-term: ' + P(rL) + ' × permanent need ' + C(perm), rL * perm, 'cur', 'long-term rate', 2), step('Total aggressive cost', x.aggr, 'cur', 'sum', 2)],
          method: ['Find the permanent need', 'Find the average seasonal need', 'Short-term rate × average seasonal need', 'Long-term rate × permanent need, then add'] },
        { ask: ['What is the annual cost of a conservative funding strategy?', 'Cost of borrowing the full peak need long-term and investing the surplus?'], answer: x.cons, unit: 'cur', dp: 2,
          traps: [{ v: rL * x.peak, why: 'Subtract what the surplus cash earns when the need is below peak.' }, { v: rL * x.peak - rI * peakSeasonal, why: 'The AVERAGE surplus = peak seasonal need − average seasonal need.' }],
          steps: [step('Long-term loan = total peak need ' + C(x.peak) + ' × ' + P(rL), rL * x.peak, 'cur', 'covers the peak all year', 2), step('Average surplus = ' + C(peakSeasonal) + ' − ' + C(avgSeasonal), x.surplus, 'cur', 'peak seasonal − average seasonal'), step('Earnings on surplus = ' + P(rI) + ' × average surplus', rI * x.surplus, 'cur', 'invested', 2), step('Total conservative cost', x.cons, 'cur', 'loan cost − earnings', 2)] },
        { kind: 'choice', ask: ['Why might a firm still choose the (more expensive) conservative strategy?'], choices: ['It removes the risk that short-term rates rise or that lenders refuse short-term funding at the peak (refinancing risk).', 'Long-term funding is always cheaper.', 'It increases the cash conversion cycle.', 'It lowers the permanent funding requirement.'], correctChoice: 0, why: 'Short-term funds are usually cheaper, but their cost and availability are uncertain. The conservative strategy pays extra for certainty.' }
      ];
      return {
        intro: [c.company + ' has a seasonal business.', c.company + ' (' + c.industry + ') sees strong seasonal swings in its operating assets.'],
        facts: [
          fact('Cash & marketable securities (constant)', cash, 'cur', 'It always holds ' + C(cash) + ' in cash and marketable securities.'),
          fact('Inventory (minimum / peak)', invMin, 'cur', 'Inventory ranges from ' + C(invMin) + ' to ' + C(invPeak) + ','),
          fact('Accounts receivable (minimum / peak)', arMin, 'cur', 'receivables from ' + C(arMin) + ' to ' + C(arPeak) + '.'),
          fact('Accounts payable (constant)', ap, 'cur', 'Accounts payable are a steady ' + C(ap) + '.'),
          fact('Average seasonal need', avgSeasonal, 'cur', 'Over the year, the seasonal need averages ' + C(avgSeasonal) + '.'),
          fact('Rates', rS, 'pct', 'Short-term funds cost ' + P(rS) + ', long-term funds ' + P(rL) + ', and surplus cash can earn ' + P(rI) + '.', { dp: 2 })
        ],
        layouts: ['sentence', 'case'],
        parts: r.chance(0.5) ? parts : [parts[0], parts[2], parts[3]]
      };
    }
  });

  /* ---------------- float ---------------- */
  FSM.addSkill({
    id: 'fin_w3_float', topic: 'fin_w3', title: 'Reducing collection float: value of faster collections',
    formula: 'Funds freed = daily credit sales × days of float saved; benefit = funds freed × return earned',
    build: function (r, c) {
      var sales = r.range(2, 80, 0.5) * 1e6, days = r.int(1, 5), rate = r.range(1, 12, 0.5) / 100, cost = h.r0(sales / 365 * days * rate * r.range(0.5, 1.5, 0.05) / 10) * 10;
      var freed = sales / 365 * days, benefit = freed * rate;
      var C = c.C;
      return {
        intro: [c.company + ' has annual credit sales of ' + C(sales) + '.', 'A bank offers ' + c.company + ' a lockbox system to cut collection float.'],
        facts: [fact('Annual credit sales', sales, 'cur', 'Annual credit sales are ' + C(sales) + '.'), fact('Float reduction (days)', days, 'num', 'A lockbox system would cut total collection float by ' + days + ' day' + (days > 1 ? 's' : '') + '.'), fact('Return on freed funds', rate, 'pct', 'Freed-up funds can earn ' + F.num(rate * 100, 1) + '% per year.', { dp: 1 }), fact('Annual cost of the lockbox', cost, 'cur', 'The lockbox costs ' + C(cost) + ' per year.')],
        layouts: ['sentence', 'table'],
        parts: [
          { ask: ['How much money is freed up?', 'By how much do receivables fall?'], answer: freed, unit: 'cur', traps: [{ v: sales / 360 * days, why: 'Use 365 days.' }, { v: sales * days / 12, why: 'Daily sales = annual sales / 365.' }],
            steps: [step('Daily sales = ' + C(sales) + ' / 365', sales / 365, 'cur', 'annual ÷ 365'), step('Freed funds = daily sales × ' + days, freed, 'cur', 'days of float saved')] },
          { ask: ['What is the annual benefit of the freed funds?'], answer: benefit, unit: 'cur', traps: [{ v: freed, why: 'The benefit is what the freed money EARNS per year, not the amount itself.' }],
            steps: [step('Benefit = ' + C(h.r0(freed)) + ' × ' + F.num(rate * 100, 1) + '%', benefit, 'cur', 'return on freed funds')] },
          { kind: 'choice', ask: ['Should the company adopt the lockbox?'], choices: benefit > cost ? ['Yes — the annual benefit exceeds the cost.', 'No — the cost exceeds the benefit.'] : ['No — the cost exceeds the benefit.', 'Yes — the annual benefit exceeds the cost.'], correctChoice: 0, why: 'Compare the yearly earnings on the freed funds with the yearly cost of the system.' }
        ]
      };
    }
  });

  /* ---------------- aging schedule ---------------- */
  FSM.addSkill({
    id: 'fin_w3_aging', topic: 'fin_w3', title: 'Aging schedule of accounts receivable',
    formula: '% of balance per age bucket; terms net 30 → everything older than 30 days is overdue',
    build: function (r, c) {
      var buckets = ['0–30 days', '31–60 days', '61–90 days', '91–120 days', 'Over 120 days'];
      var w = [r.range(30, 60, 1), r.range(10, 25, 1), r.range(5, 30, 1), r.range(2, 15, 1), r.range(1, 8, 1)];
      var tot = r.range(100, 900, 10) * 1000;
      var sumw = w.reduce(function (a, b) { return a + b; }, 0);
      var amt = w.map(function (x) { return Math.round(tot * x / sumw / 1000) * 1000; });
      tot = amt.reduce(function (a, b) { return a + b; }, 0);
      var overdue = tot - amt[0];
      var spike = amt.slice(1).reduce(function (b, x, i) { return x > amt[b + 1] ? i : b; }, 0) + 1;
      var C = c.C;
      return {
        intro: [c.company + ' sells on net 30 terms. Its aging schedule at year end:'],
        statement: { title: 'Age of account', cols: ['Balance'], rows: buckets.map(function (b, i) { return { label: b, v: [amt[i]] }; }).concat([{ label: 'Total', v: [tot], total: true }]) },
        facts: [], layouts: ['statement'],
        parts: [
          { ask: ['What percentage of receivables is overdue?', 'Which share of the balance is past due?'], answer: overdue / tot, unit: 'pct', dp: 1, traps: [{ v: amt[0] / tot, why: 'That is the CURRENT part (0–30 days).' }],
            steps: [step('Overdue = total − current = ' + C(tot) + ' − ' + C(amt[0]), overdue, 'cur', 'older than 30 days'), step('% overdue = ' + C(overdue) + ' / ' + C(tot), overdue / tot, 'pct', 'share of total', 1)] },
          { ask: ['What % of the balance is in the “' + buckets[spike] + '” bucket?'], answer: amt[spike] / tot, unit: 'pct', dp: 1, traps: [], steps: [step(C(amt[spike]) + ' / ' + C(tot), amt[spike] / tot, 'pct', 'bucket ÷ total', 1)] },
          { kind: 'choice', ask: ['What is the main purpose of an aging schedule?'], choices: ['To pinpoint where (and since when) collection problems arise', 'To calculate the cash conversion cycle', 'To decide on the credit period for new customers', 'To value inventory'], correctChoice: 0, why: 'A bump in one bucket points to a problem that started then (e.g. a new credit manager or one big slow customer).' }
        ]
      };
    }
  });

  /* ---------------- concepts from the book ---------------- */
  FSM.addConcepts({
    id: 'fin_w3_book', topic: 'fin_w3', title: 'Book: profitability vs risk, funding strategies, float, cash management',
    items: [
      { term: 'Net working capital', cat: 'wc', defs: ['Current assets minus current liabilities; positive when current assets exceed current liabilities.'] },
      { term: 'Insolvent', cat: 'wc', defs: ['Unable to pay bills as they come due — the “risk” in working capital management.'] },
      { term: 'Profitability–risk tradeoff', cat: 'wc', defs: ['More current assets lowers both profit and risk; more current liabilities raises both profit and risk.'] },
      { term: 'Permanent funding requirement', cat: 'fund', defs: ['The investment in operating assets that grows with the firm but does not vary with the seasons.'] },
      { term: 'Seasonal funding requirement', cat: 'fund', defs: ['The extra investment in operating assets that rises and falls with seasonal sales.'] },
      { term: 'Aggressive funding strategy', cat: 'fund', defs: ['Seasonal needs funded with short-term debt, permanent needs with long-term debt or equity — cheaper but riskier.'] },
      { term: 'Conservative funding strategy', cat: 'fund', defs: ['Both seasonal and permanent needs funded long-term — costlier, but no refinancing or rate risk.'] },
      { term: 'Credit standards', cat: 'cr', defs: ['The firm\'s minimum requirements for extending credit to a customer.'] },
      { term: 'Credit scoring', cat: 'cr', defs: ['Statistically weighted scores on key characteristics to make fast, cheap accept/reject decisions for many small credit requests.'] },
      { term: 'Credit period', cat: 'cr', defs: ['The number of days until full payment is due (e.g. the 30 in net 30).'] },
      { term: 'Early payment discount period', cat: 'cr', defs: ['The number of days during which the cash discount can be taken (e.g. the 10 in 2/10 net 30).'] },
      { term: 'Float', cat: 'fl', defs: ['Funds sent by the payer that are not yet usable by the payee.'] },
      { term: 'Mail float', cat: 'fl', defs: ['Time between mailing a payment and receiving it.'] },
      { term: 'Processing float', cat: 'fl', defs: ['Time between receiving a payment and depositing it.'] },
      { term: 'Clearing float', cat: 'fl', defs: ['Time between depositing a payment and having spendable funds.'] },
      { term: 'Lockbox system', cat: 'cm', defs: ['Customers pay to a post office box emptied by the bank, which deposits immediately — cuts mail, processing and clearing float.'] },
      { term: 'Controlled disbursing', cat: 'cm', defs: ['Strategic choice of mailing points and bank accounts to lengthen mail and clearing float on payments.'] },
      { term: 'Cash concentration', cat: 'cm', defs: ['Bringing lockbox and other deposits together in one concentration bank: bigger investment pool, better control, less idle cash.'] },
      { term: 'Zero-balance account (ZBA)', cat: 'cm', defs: ['A disbursement account funded each day exactly for the checks presented, so it ends the day at zero and idle cash stays invested.'] },
      { term: 'Depository transfer check (DTC)', cat: 'cm', defs: ['An unsigned check drawn on one of the firm\'s accounts and deposited in another to move cash.'] },
      { term: 'ACH transfer', cat: 'cm', defs: ['Pre-authorised electronic transfer through the automated clearinghouse; clears in one day.'] },
      { term: 'Wire transfer', cat: 'cm', defs: ['Electronic bookkeeping transfer between banks that removes mail and clearing float — fast but the most expensive.'] },
      { term: 'Marketable securities', cat: 'cm', defs: ['Short-term, low-risk, easily traded investments for idle cash, e.g. T-bills, commercial paper, negotiable CDs, money market funds.'] }
    ],
    groups: {
      'Components of float': ['Mail float', 'Processing float', 'Clearing float'],
      'Cash concentration mechanisms': ['Depository transfer check (DTC)', 'ACH transfer', 'Wire transfer'],
      'Effects of relaxing credit standards': ['Sales volume up (+ profit)', 'Investment in receivables up (− profit)', 'Bad-debt expenses up (− profit)'],
      'Government marketable securities': ['Treasury bills', 'Treasury notes', 'Treasury bonds', 'Federal agency issues']
    },
    sequences: [
      { title: 'Collection techniques (from mild to severe)', steps: ['Letters', 'Telephone calls', 'Personal visits', 'Collection agencies', 'Legal action'] }
    ],
    scenarios: [
      { q: ['A firm funds its summer inventory peak with a 3-month bank loan and its base level with a 10-year loan. Which strategy?'], a: 'Aggressive funding strategy' },
      { q: ['A firm borrows its full peak need for 5 years and invests the cash it doesn\'t need in quiet months. Which strategy?'], a: 'Conservative funding strategy' },
      { q: ['A credit-card company accepts or rejects thousands of small applications a day with a statistical model. Which method?'], a: 'Credit scoring' },
      { q: ['Checks sit on a clerk\'s desk for two days before going to the bank. Which float?'], a: 'Processing float', opts: ['Mail float', 'Clearing float', 'Float'] },
      { q: ['Funds are deposited but the bank needs 2 days before the money can be used. Which float?'], a: 'Clearing float', opts: ['Mail float', 'Processing float', 'Float'] },
      { q: ['The company\'s disbursement account is topped up each day for exactly the checks presented. What is it?'], a: 'Zero-balance account (ZBA)' },
      { q: ['A firm changes its terms from 2/10 net 30 to 2/20 net 30. What did it change?'], a: 'Early payment discount period' }
    ],
    tf: [
      { s: 'Increasing the ratio of current assets to total assets decreases both profitability and risk.', t: true, why: 'Current assets earn less than fixed assets, but they make the firm more liquid.' },
      { s: 'Increasing the ratio of current liabilities to total assets decreases both profitability and risk.', t: false, why: 'It INCREASES both: current liabilities are cheap financing but reduce net working capital.' },
      { s: 'The more predictable a firm\'s cash inflows, the less net working capital it needs.', t: true, why: 'Less buffer is needed.' },
      { s: 'Short-term funds are usually cheaper than long-term funds because the yield curve is usually upward sloping.', t: true, why: 'That is why the aggressive strategy is cheaper.' },
      { s: 'The book evaluates credit-standard changes with NPV (capital budgeting); the course uses a simplified one-period method.', t: true, why: 'Use the course method on the exam.' },
      { s: 'Firms\' regular credit terms usually differ a lot from industry standards.', t: false, why: 'They tend to match industry standards: stricter terms lose sales, looser ones attract weak customers.' },
      { s: 'Collection agencies typically return the full amount collected to the firm.', t: false, why: 'Fees are high — the firm may get less than 50 cents on the dollar.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
