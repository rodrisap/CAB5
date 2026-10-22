/* Finance Week 4 — extra material from Zutter & Smart Ch. 16 */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.compBalance = function (loan, rate, compPct, normalBal) {
    var tied = Math.max(0, compPct * loan - (normalBal || 0));
    return { interest: loan * rate, usable: loan - tied, rate: loan * rate / (loan - tied) };
  };
  FSM.calc.revolver = function (line, avgUsed, fee, interest) { var f = fee * (line - avgUsed); return { fee: f, rate: (interest + f) / avgUsed }; };
  FSM.calc.cp = function (face, price, days) { var rp = (face - price) / price; return { rp: rp, ear: Math.pow(1 + rp, 365 / days) - 1 }; };

  /* ---------------- bank-loan costs ---------------- */
  FSM.addSkill({
    id: 'fin_w4_bank_loans', topic: 'fin_w4', title: 'Commercial paper & single-payment notes (EAR)',
    formula: 'r_p = interest ÷ money received · EAR = (1 + r_p)^(365/days) − 1',
    build: function (r, c) {
      var C = c.C, v = r.pick(['cp', 'note']);
      if (v === 'comp') {
        var loan = r.range(0.2, 5, 0.1) * 1e6, rate = r.range(4, 12, 0.5) / 100, cp = r.pick([0.1, 0.15, 0.2]), normal = r.chance(0.5) ? 0 : h.r0(loan * cp * r.range(0.2, 0.8, 0.1) / 1000) * 1000;
        var x = FSM.calc.compBalance(loan, rate, cp, normal);
        return {
          intro: [c.company + ' borrows ' + C(loan) + ' under a line of credit at a stated rate of ' + F.num(rate * 100, 1) + '%.'],
          facts: [fact('Compensating balance', cp, 'pct', 'The bank requires a compensating balance of ' + F.num(cp * 100) + '% of the amount borrowed in its checking account.', { dp: 0 }), fact('Normal checking balance', normal, 'cur', normal ? 'The firm normally keeps ' + C(normal) + ' in that account anyway.' : 'The firm normally keeps no balance there.')],
          layouts: ['sentence'],
          parts: [{ ask: ['What is the effective annual rate of this loan?', 'What does the loan really cost per year, taking the compensating balance into account?'], answer: x.rate, unit: 'pct', dp: 2,
            traps: [{ v: rate, why: 'The compensating balance reduces the money you can use, so the effective rate is higher than the stated rate.' }, { v: rate / (1 - cp), why: normal ? 'Only the part of the compensating balance ABOVE the normal balance ties up extra money.' : 'Check the arithmetic.' }].filter(function (t) { return Math.abs(t.v - x.rate) > 1e-6; }),
            steps: [step('Interest = ' + C(loan) + ' × ' + F.num(rate * 100, 1) + '%', x.interest, 'cur', 'stated rate on the full loan'), step('Extra money tied up = ' + F.num(cp * 100) + '% × ' + C(loan) + (normal ? ' − ' + C(normal) + ' already held' : ''), loan - x.usable, 'cur', 'compensating balance'), step('Usable funds', x.usable, 'cur', 'loan − tied up'), step('Effective rate = interest / usable funds', x.rate, 'pct', 'definition', 2)] }]
        };
      }
      if (v === 'rev') {
        var line = r.range(1, 10, 0.5) * 1e6, used = h.r0(line * r.range(0.4, 0.9, 0.05) / 1000) * 1000, fee = r.pick([0.0025, 0.005, 0.0075]), ir = r.range(4, 10, 0.25) / 100, intr = used * ir;
        var y = FSM.calc.revolver(line, used, fee, intr);
        return {
          intro: [c.company + ' has a ' + C(line) + ' revolving credit agreement.'],
          facts: [fact('Average borrowing', used, 'cur', 'Average borrowing last year was ' + C(used) + ', on which it paid ' + C(intr) + ' interest.'), fact('Commitment fee', fee, 'pct', 'The bank charges a commitment fee of ' + F.num(fee * 100, 2) + '% on the average UNUSED part of the line.', { dp: 2 })],
          layouts: ['sentence'],
          parts: [
            { ask: ['What is the commitment fee for the year?'], answer: y.fee, unit: 'cur', traps: [{ v: fee * line, why: 'The fee applies to the UNUSED portion only.' }, { v: fee * used, why: 'The fee is on the unused portion, not on what was borrowed.' }], steps: [step('Unused = ' + C(line) + ' − ' + C(used), line - used, 'cur', 'average unused'), step('Fee = ' + F.num(fee * 100, 2) + '% × unused', y.fee, 'cur', 'commitment fee')] },
            { ask: ['What is the effective annual cost of the agreement?'], answer: y.rate, unit: 'pct', dp: 2, traps: [{ v: intr / used, why: 'Add the commitment fee to the cost.' }, { v: (intr + y.fee) / line, why: 'Divide by the money actually borrowed.' }], steps: [step('(Interest + fee) / average borrowing = (' + C(intr) + ' + ' + C(y.fee) + ') / ' + C(used), y.rate, 'pct', 'definition', 2)] },
            { kind: 'choice', ask: ['How does a revolving credit agreement differ from a line of credit?'], choices: ['The bank GUARANTEES the funds will be available, so it charges a commitment fee.', 'It is always secured by inventory.', 'It never has an interest rate linked to prime.', 'It must be repaid within 30 days.'], correctChoice: 0, why: 'A revolver is a guaranteed line of credit; a normal line of credit is not guaranteed.' }
          ]
        };
      }
      if (v === 'cp') {
        var face = r.range(1, 20, 0.5) * 1e6, days = r.pick([30, 60, 90, 120, 180, 270]), disc = r.range(0.2, 2.5, 0.05) / 100, price = h.r0(face * (1 - disc) / 1000) * 1000;
        var z = FSM.calc.cp(face, price, days);
        return {
          intro: [c.company + ' issues commercial paper with a face value of ' + C(face) + ' and a maturity of ' + days + ' days. It sells for ' + C(price) + '.'],
          facts: [], layouts: ['sentence'],
          parts: [
            { ask: ['What is the interest rate for the ' + days + '-day period?'], answer: z.rp, unit: 'pct', dp: 3, traps: [{ v: (face - price) / face, why: 'Divide the interest by the amount you RECEIVE (the price), not the face value.' }], steps: [step('Interest = ' + C(face) + ' − ' + C(price), face - price, 'cur', 'discount'), step('Period rate = interest / ' + C(price), z.rp, 'pct', 'interest ÷ money received', 3)] },
            { ask: ['What is the effective annual rate if the paper is rolled over all year?'], answer: z.ear, unit: 'pct', dp: 2, traps: [{ v: z.rp * 365 / days, why: 'Compound: (1 + r_p)^(365/days) − 1.' }], steps: [step('EAR = (1 + ' + h.p(z.rp, 3) + ')^(365/' + days + ') − 1', z.ear, 'pct', 'formula sheet', 2)] },
            { kind: 'choice', ask: ['Who can issue commercial paper?'], choices: ['Only large firms with a high credit standing', 'Any firm with a bank account', 'Only governments', 'Only banks'], correctChoice: 0, why: 'Commercial paper is unsecured, so only financially strong firms can sell it. Its rate is usually below prime.' }
          ]
        };
      }
      var prime = r.range(3, 8, 0.25) / 100, sp = r.range(0.5, 3, 0.25) / 100, d = r.pick([60, 90, 120, 180]), amt = r.range(50, 500, 10) * 1000;
      var rp = (prime + sp) * d / 365, ear = Math.pow(1 + rp, 365 / d) - 1;
      return {
        intro: [c.company + ' signs a ' + d + '-day single-payment note for ' + C(amt) + ' at ' + F.num(sp * 100, 2) + '% above the prime rate, fixed for the whole period. The prime rate is ' + F.num(prime * 100, 2) + '%. Interest is paid at maturity.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is the total interest cost?'], answer: amt * rp, unit: 'cur', dp: 2, traps: [{ v: amt * (prime + sp), why: 'Scale the annual rate to ' + d + ' days.' }, { v: amt * prime * d / 365, why: 'Add the spread above prime.' }], steps: [step('Rate = ' + F.num(prime * 100, 2) + '% + ' + F.num(sp * 100, 2) + '%', prime + sp, 'pct', 'prime + spread', 2), step('Interest = ' + C(amt) + ' × rate × ' + d + '/365', amt * rp, 'cur', 'simple interest', 2)] },
          { ask: ['What is the effective annual rate if the note is rolled over all year on the same terms?'], answer: ear, unit: 'pct', dp: 2, traps: [{ v: prime + sp, why: 'Rolling over every ' + d + ' days compounds the interest.' }], steps: [step('Period rate = rate × ' + d + '/365', rp, 'pct', 'per ' + d + ' days', 3), step('EAR = (1 + r_p)^(365/' + d + ') − 1', ear, 'pct', 'formula sheet', 2)] }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'fin_w4_book', topic: 'fin_w4', title: 'Bank loans, commercial paper, secured financing',
    items: [
      { term: 'Unsecured short-term financing', cat: 'u', defs: ['Short-term funding obtained without pledging specific assets as collateral, e.g. payables, accruals, bank lines, commercial paper.'] },
      { term: 'Self-liquidating loan', cat: 'u', defs: ['A short-term loan repaid by the very assets it finances, e.g. seasonal inventory that is sold and collected.'] },
      { term: 'Prime rate', cat: 'u', defs: ['The rate leading US banks charge creditworthy business borrowers; loans are priced as prime + a spread.'] },
      { term: 'Floating-rate loan', cat: 'u', defs: ['A loan whose rate = benchmark + a fixed spread, so it moves when the benchmark moves; spreads are lower than on fixed-rate loans.'] },
      { term: 'Single-payment note', cat: 'u', defs: ['A one-time bank loan for a specific short-term purpose, typically 30 days to 9 months.'] },
      { term: 'Line of credit', cat: 'u', defs: ['A (non-guaranteed) agreement on the maximum unsecured amount a bank will lend over a period, usually one year.'] },
      { term: 'Revolving credit agreement', cat: 'u', defs: ['A GUARANTEED line of credit, for which the bank charges a commitment fee on the unused part.'] },
      { term: 'Commitment fee', cat: 'u', defs: ['A fee (around 0.5%) on the average unused portion of a revolving credit line.'] },
      { term: 'Compensating balance', cat: 'u', defs: ['A required checking balance of 10–20% of the loan; it raises the effective rate if it exceeds what the firm would hold anyway.'] },
      { term: 'Annual cleanup', cat: 'u', defs: ['A rule that the borrower owes the bank nothing for some days each year, so a short-term line doesn\'t become long-term debt.'] },
      { term: 'Operating-change restrictions', cat: 'u', defs: ['Conditions in a credit line letting the bank revoke it if the firm\'s finances or operations change materially.'] },
      { term: 'Commercial paper', cat: 'u', defs: ['Short-term (3–270 days) unsecured promissory notes sold at a discount by large, financially strong firms, usually below prime.'] },
      { term: 'Letter of credit', cat: 'u', defs: ['A bank\'s guarantee to a foreign supplier that it will pay the invoice if all conditions are met — key in financing international trade.'] },
      { term: 'Netting', cat: 'u', defs: ['Subsidiaries of one group only pay the net amount they owe each other, saving FX fees and transaction costs.'] },
      { term: 'Percentage advance', cat: 's', defs: ['The part of the collateral\'s book value (30–100%) that a lender lends against.'] },
      { term: 'Lien', cat: 's', defs: ['A publicly filed legal claim on loan collateral.'] },
      { term: 'Commercial finance company', cat: 's', defs: ['A lender that makes only secured loans and takes no deposits; usually charges more than banks.'] },
      { term: 'Non-notification basis', cat: 's', defs: ['The customer whose receivable is pledged is not told and keeps paying the borrower.'] },
      { term: 'Nonrecourse factoring', cat: 's', defs: ['The factor accepts all credit risk: if a purchased account isn\'t paid, the factor absorbs the loss.'] },
      { term: 'Floating inventory lien', cat: 's', defs: ['A claim on inventory in general (e.g. tyres, bolts); the lender advances less than 50% of book value.'] },
      { term: 'Trust receipt inventory loan', cat: 's', defs: ['A loan against expensive, serial-numbered goods (e.g. cars at a dealer); repay each item as soon as it is sold; 80–100% advance.'] },
      { term: 'Warehouse receipt loan', cat: 's', defs: ['Inventory is held by a warehousing company on the lender\'s behalf (terminal or field warehouse); the most expensive secured option.'] },
      { term: 'Captive finance company', cat: 's', defs: ['A manufacturer\'s own finance subsidiary (e.g. Ford Credit) that lends to its dealers/customers.'] }
    ],
    groups: {
      'Unsecured bank loans': ['Single-payment note', 'Line of credit', 'Revolving credit agreement'],
      'Inventory as collateral': ['Floating inventory lien', 'Trust receipt inventory loan', 'Warehouse receipt loan'],
      'Typical line-of-credit conditions': ['Operating-change restrictions', 'Compensating balance', 'Annual cleanup']
    },
    scenarios: [
      { q: ['A car dealer\'s stock of cars is financed; each car must be paid off as soon as it is sold. Which loan?'], a: 'Trust receipt inventory loan' },
      { q: ['A tyre wholesaler gets a loan secured by its inventory in general. Which loan?'], a: 'Floating inventory lien' },
      { q: ['The bank promises the money will be there no matter what and charges 0.5% on the unused part. What is this agreement?'], a: 'Revolving credit agreement' },
      { q: ['A Dutch importer\'s bank guarantees to a Chinese supplier that the invoice will be paid. What document?'], a: 'Letter of credit' },
      { q: ['A big, highly rated firm raises 90-day money by selling unsecured notes at a discount to investors. What is it issuing?'], a: 'Commercial paper' },
      { q: ['A loan has to be repaid in full and stay at zero for 30 days each year. What is this requirement?'], a: 'Annual cleanup' }
    ],
    tf: [
      { s: 'Stretching accounts payable lowers the cost of giving up a discount, but may breach the agreement with the supplier.', t: true, why: 'It increases N, but raises an ethical and relationship issue.' },
      { s: 'Collateral reduces the risk that a borrower will default.', t: false, why: 'Collateral reduces the LOSS if default happens, not the probability of default.' },
      { s: 'Secured short-term loans usually carry lower rates than unsecured loans for the same borrower, but secured borrowers are often riskier and pay more overall.', t: true, why: 'Riskier firms must offer collateral and also pay higher rates and fees.' },
      { s: 'A compensating balance always raises the effective interest rate.', t: false, why: 'Only if it is larger than the cash the firm would hold anyway.' },
      { s: 'Paying interest in advance (a discount loan) makes the effective rate higher than the stated rate.', t: true, why: 'You pay the same interest on less usable money.' },
      { s: 'Factoring is usually done on a notification basis: customers pay the factor directly.', t: true, why: 'Pledging is usually non-notification.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
