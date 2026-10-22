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

  /* ---------------- float ---------------- */

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
    id: 'fin_w3_book', topic: 'fin_w3', title: 'Profitability vs risk, funding strategies, cash management',
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
      { s: 'Firms\' regular credit terms usually differ a lot from industry standards.', t: false, why: 'They tend to match industry standards: stricter terms lose sales, looser ones attract weak customers.' },
      { s: 'Collection agencies typically return the full amount collected to the firm.', t: false, why: 'Fees are high — the firm may get less than 50 cents on the dollar.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
