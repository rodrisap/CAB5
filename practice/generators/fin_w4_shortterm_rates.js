/* Finance Week 4 — Short-term funding, payables, effective interest rates (Ch. 16) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};

  FSM.addTopic({ id: 'fin_w4', area: 'Finance', week: 4, title: 'Short-term funding & effective rates', read: 'Zutter & Smart Ch. 16' });

  /* pure calcs */
  FSM.calc.discountCost = function (cd, y, z) { // cd in %, y discount days, z full days
    var N = z - y, rp = cd / (100 - cd);
    return { N: N, rp: rp, approx: rp * 365 / N, exact: Math.pow(1 + rp, 365 / N) - 1 };
  };
  FSM.calc.ear = function (rp, days) { return Math.pow(1 + rp, 365 / days) - 1; };
  FSM.calc.discountLoan = function (pct) { return pct / (100 - pct); };
  FSM.calc.simpleLoan = function (pctPA, days) { return pctPA / 100 * days / 365; };
  FSM.calc.resourcesCCC = function (aai, acp, app, cogs, creditSales, creditPurch) {
    var inv = aai / 365 * cogs, ar = acp / 365 * creditSales, ap = app / 365 * creditPurch;
    return { inv: inv, ar: ar, ap: ap, total: inv + ar - ap, oc: aai + acp, ccc: aai + acp - app };
  };

  var SUPPLIERS = ['FuelMaster Suppliers', 'RoutePro Technologies', 'SteelStructures Ltd.', 'Textile Traders Co.', 'Precision Parts Inc.', 'SeedSource Ltd.', 'CargoPro Services', 'DataHub Solutions', 'BrickMaster Supplies', 'AgroTech Machinery', 'FitGear Wholesale', 'AdVision Media'];
  var BANKS = ['Summit National Bank', 'Pinnacle Financial Group', 'Harborview Trust Bank', 'Crestline Capital', 'Evergreen Community Bank', 'Silvergate Financial Services', 'Nordbank Nederland', 'Delta Savings Bank'];

  function terms(r) {
    var cd = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 3.4, 4]);
    var y = r.pick([5, 10, 10, 15, 20, 25]);
    var z = y + r.pick([10, 20, 20, 30, 45, 50, 80, 100]);
    return { cd: cd, y: y, z: z, s: F.num(cd, cd % 1 ? 1 : 0) + '/' + y + ', n/' + z };
  }

  /* ---------------- cost of giving up a discount ---------------- */
  FSM.addSkill({
    id: 'fin_w4_discount_cost', topic: 'fin_w4', title: 'Cost of giving up a cash discount',
    formula: 'Approx = CD/(100%−CD) × 365/N · Exact = (1 + CD/(100%−CD))^(365/N) − 1 · N = full period − discount period',
    build: function (r, c) {
      var t = terms(r), x = FSM.calc.discountCost(t.cd, t.y, t.z);
      var inv = r.range(5, 900, 0.5) * 1000;
      var payEarly = inv * (1 - t.cd / 100);
      var sup = r.pick(SUPPLIERS);
      var C = c.C;
      var intro = [c.company + ' receives an invoice of ' + C(inv) + ' from ' + sup + ' with terms ' + t.s + '.',
        sup + ' bills ' + c.company + ' ' + C(inv) + '. The credit terms are ' + t.s + '.',
        'A supplier invoice for ' + C(inv) + ' arrives at ' + c.company + '. Terms: ' + t.s + '.'];
      var stepsBase = [
        step('Discount CD = ' + t.cd + '%; N = ' + t.z + ' − ' + t.y, x.N, 'num', 'full period − discount period', 0),
        step('Rate for N days = ' + t.cd + ' / (100 − ' + t.cd + ')', x.rp, 'pct', 'you pay ' + t.cd + ' extra on ' + (100 - t.cd) + ' you keep', 4)
      ];
      var parts = [];
      var v = r.pick(['all', 'approx', 'exact', 'pay']);
      if (v === 'all' || v === 'pay') parts.push({ ask: ['How much does the company pay if it takes the discount?', 'What is the payment if the invoice is paid within the discount period?'], answer: payEarly, unit: 'cur', dp: 2,
        traps: [{ v: inv, why: 'With the discount you pay less than the invoice amount.' }, { v: inv * t.cd / 100, why: 'That is the discount itself, not the payment.' }],
        steps: [step(C(inv) + ' × (1 − ' + t.cd + '%)', payEarly, 'cur', 'invoice minus discount', 2)] });
      if (v !== 'exact') parts.push({ ask: ['What is the approximate (annual) cost of giving up the discount?', 'Calculate the approximate cost of forgoing the discount.', 'Using the approximation, how expensive is it to skip the discount (per year)?'], answer: x.approx, unit: 'pct', dp: 2,
        traps: [{ v: t.cd / 100 * 365 / x.N, why: 'Divide CD by (100% − CD), not by 100%.' }, { v: x.rp * 365 / t.z, why: 'N is the EXTRA days you get (full period − discount period), not the full period.' }, { v: x.exact, why: 'That is the exact (compounded) cost; the question asks for the approximation.' }, { v: x.rp * 360 / x.N, why: 'Use a 365-day year.' }],
        steps: stepsBase.concat([step('Approximate cost = ' + h.p(x.rp, 4) + ' × 365 / ' + x.N, x.approx, 'pct', 'formula sheet', 2)]),
        method: ['Find CD and N (full period − discount period)', 'Calculate CD / (100% − CD)', 'Annualise by multiplying by 365/N'] });
      if (v === 'all' || v === 'exact') parts.push({ ask: ['What is the exact cost of giving up the discount?', 'Calculate the exact (compounded) annual cost of forgoing the discount.'], answer: x.exact, unit: 'pct', dp: 2,
        traps: [{ v: x.approx, why: 'That is the approximate (simple) cost; the exact version compounds.' }, { v: Math.pow(1 + x.rp, 365 / t.z) - 1, why: 'N = full period − discount period.' }, { v: Math.pow(1 + t.cd / 100, 365 / x.N) - 1, why: 'Use CD/(100% − CD) inside the brackets.' }],
        steps: stepsBase.concat([step('Exact cost = (1 + ' + h.p(x.rp, 4) + ')^(365/' + x.N + ') − 1', x.exact, 'pct', 'formula sheet', 2)]),
        method: ['Find CD and N (full period − discount period)', 'Calculate CD / (100% − CD)', 'Raise (1 + that rate) to the power 365/N', 'Subtract 1'] });
      if (v === 'pay') parts.push({ kind: 'choice', ask: ['The company can borrow from its bank at ' + (x.approx > 0.12 ? r.int(6, 10) : r.int(Math.max(1, Math.ceil(x.approx * 100) + 3), Math.ceil(x.approx * 100) + 10)) + '% per year. Should it take the discount?'],
        choices: null, correctChoice: 0, why: '' });
      // fix the last choice text now that we know the bank rate
      var last = parts[parts.length - 1];
      if (last.kind === 'choice') {
        var bank = parseInt(last.ask[0].match(/at (\d+)%/)[1], 10) / 100;
        var take = x.approx > bank;
        last.choices = take ? ['Yes — borrow from the bank and pay early; skipping the discount costs more than the loan.', 'No — keep the money and pay on the last day.']
          : ['No — skipping the discount is cheaper than the bank loan, so pay on day ' + t.z + '.', 'Yes — always take a discount when it is offered.'];
        last.why = 'Cost of skipping the discount ≈ ' + h.p(x.approx) + ' vs bank ' + h.p(bank, 0) + '. Take the cheaper source of money.';
      }
      return { intro: intro, facts: [fact('Invoice', inv, 'cur', '')], noise: [fact('x', 0, 'cur', 'The company has ' + C(r.range(50, 500, 10) * 1000) + ' in cash.')], parts: parts, layouts: ['sentence', 'case'] };
    }
  });

  /* ---------------- rank supplier bills ---------------- */
  FSM.addSkill({
    id: 'fin_w4_rank_bills', topic: 'fin_w4', title: 'Which supplier to pay first?',
    formula: 'Compare the cost of giving up each discount',
    build: function (r, c) {
      var bills = [terms(r), terms(r), terms(r)];
      bills.forEach(function (b) { b.x = FSM.calc.discountCost(b.cd, b.y, b.z); b.name = r.pick(SUPPLIERS); b.amt = r.range(100, 2000, 50) * 1000; });
      // ensure different costs and names
      var names = r.sample(SUPPLIERS, 3); bills.forEach(function (b, i) { b.name = names[i]; });
      var tries = 0;
      while ((Math.abs(bills[0].x.approx - bills[1].x.approx) < 0.01 || Math.abs(bills[1].x.approx - bills[2].x.approx) < 0.01 || Math.abs(bills[0].x.approx - bills[2].x.approx) < 0.01) && tries++ < 20) { bills[2] = Object.assign(terms(r), { name: names[2], amt: bills[2].amt }); bills[2].x = FSM.calc.discountCost(bills[2].cd, bills[2].y, bills[2].z); }
      var sorted = bills.slice().sort(function (a, b) { return b.x.approx - a.x.approx; });
      var C = c.C;
      var target = r.pick(bills);
      return {
        intro: [c.company + ' has three open supplier invoices and limited cash:', 'Cash is tight at ' + c.company + '. These bills are outstanding:'],
        facts: bills.map(function (b) { return fact(b.name, b.amt, 'cur', b.name + ': ' + C(b.amt) + ' on terms ' + b.s + '.'); }),
        parts: [
          { ask: ['What is the approximate annual cost of giving up the discount on the ' + target.name + ' bill?', 'Approximate cost of skipping ' + target.name + '\'s discount?'], answer: target.x.approx, unit: 'pct', dp: 2,
            traps: [{ v: target.cd / 100 * 365 / target.x.N, why: 'Divide by (100% − CD).' }, { v: target.x.rp * 365 / target.z, why: 'N = full period − discount period.' }],
            steps: [step(target.s + ': N = ' + target.z + ' − ' + target.y, target.x.N, 'num', 'terms', 0), step('Approx = ' + target.cd + '/(100 − ' + target.cd + ') × 365/' + target.x.N, target.x.approx, 'pct', 'formula sheet', 2)] },
          { kind: 'choice', ask: ['Which supplier should be paid first (on its discount date), because giving up its discount is most expensive?', 'Which “loan” from a supplier is the most expensive?'],
            choices: [sorted[0].name, sorted[1].name, sorted[2].name], correctChoice: 0,
            why: bills.map(function (b) { return b.name + ' (' + b.s + '): ' + h.p(b.x.rp, 2) + ' × 365/' + b.x.N + ' = ' + h.p(b.x.approx); }).join('<br>') + '<br>The invoice amount does not matter for the ranking — only the rate.' }
        ],
        layouts: ['sentence', 'table']
      };
    }
  });

  /* ---------------- loan types → period rate → EAR ---------------- */
  FSM.addSkill({
    id: 'fin_w4_loans', topic: 'fin_w4', title: 'Period rate and EAR of different loans',
    formula: 'EAR = (1 + r_p)^(365/days) − 1',
    build: function (r, c) {
      var altsL = [];
      var type = r.pick(['simple', 'discount', 'period', 'compound']);
      var amt = r.range(50, 2000, 50) * 1000;
      var bank = r.pick(BANKS);
      var C = c.C;
      var days, rp, ear, desc, steps, traps = [], rate;
      if (type === 'simple') {
        rate = r.range(4, 14, 0.5); days = r.pick([30, 45, 60, 65, 90, 120, 150, 180]);
        rp = FSM.calc.simpleLoan(rate, days); ear = FSM.calc.ear(rp, days);
        desc = bank + ' offers a regular loan of ' + C(amt) + ' at ' + rate + '% p.a. simple interest for ' + days + ' days (interest paid at maturity).';
        steps = [step('r_p = ' + rate + '% × ' + days + '/365', rp, 'pct', 'p.a. rate scaled to the period', 4), step('EAR = (1 + ' + h.p(rp, 4) + ')^(365/' + days + ') − 1', ear, 'pct', 'formula sheet', 2)];
        traps.push({ v: rate / 100 * days / 360, why: 'Use 365 days.' }); altsL = [rate / 100];
        steps.push(step('(The official NoordzeeOutdoor solution simply uses the stated ' + rate + '% p.a. as the EAR of a simple-interest loan; that answer is accepted too.)', rate / 100, 'pct', 'alternative', 2));
      } else if (type === 'discount') {
        rate = r.range(3, 12, 0.5); days = r.pick([60, 90, 120, 150, 180, 365]);
        rp = FSM.calc.discountLoan(rate); ear = FSM.calc.ear(rp, days);
        desc = bank + ' offers a discount loan of ' + C(amt) + ' at ' + rate + '% for ' + days + ' days: the interest is deducted up front.';
        steps = [step('You receive ' + C(amt) + ' × (1 − ' + rate + '%) and repay ' + C(amt), amt * (1 - rate / 100), 'cur', 'interest deducted up front'), step('r_p = ' + rate + ' / (100 − ' + rate + ')', rp, 'pct', 'interest ÷ money you actually get', 4), step('EAR = (1 + ' + h.p(rp, 4) + ')^(365/' + days + ') − 1', ear, 'pct', 'formula sheet', 2)];
        traps.push({ v: rate / 100, why: 'With a discount loan you only receive (100 − rate)%, so the true rate is rate/(100 − rate).' }, { v: FSM.calc.ear(rate / 100, days), why: 'First convert to rate/(100 − rate), then annualise.' });
      } else if (type === 'period') {
        rate = r.range(1, 6, 0.5); days = r.pick([60, 90, 182.5, 120]);
        var label = days === 182.5 ? '6 months' : days === 90 ? '3 months' : days + ' days';
        rp = rate / 100; ear = FSM.calc.ear(rp, days);
        desc = bank + ' lends ' + C(amt) + ' at ' + rate + '% for ' + label + ' (the rate is for the whole period, not per year).';
        steps = [step('r_p = ' + rate + '% for ' + label, rp, 'pct', 'given for the period', 4), step('EAR = (1 + ' + h.p(rp, 4) + ')^(365/' + days + ') − 1', ear, 'pct', 'periods per year = 365/' + days, 2)];
        traps.push({ v: rp * 365 / days, why: 'That is the simple annual rate; the EAR compounds.' }, { v: rp, why: 'That is the rate for the period, not per year.' });
      } else {
        rate = r.range(4, 14, 0.1); var m = r.pick([12, 4, 2]); days = 365 / m;
        rp = rate / 100 / m; ear = Math.pow(1 + rp, m) - 1;
        desc = bank + ' offers ' + C(amt) + ' for one year at a nominal rate of ' + F.num(rate, 1) + '% p.a., compounded ' + (m === 12 ? 'monthly' : m === 4 ? 'quarterly' : 'semi-annually') + '.';
        steps = [step('Rate per ' + (m === 12 ? 'month' : m === 4 ? 'quarter' : 'half year') + ' = ' + F.num(rate, 1) + '% / ' + m, rp, 'pct', 'nominal ÷ periods', 4), step('EAR = (1 + ' + h.p(rp, 4) + ')^' + m + ' − 1', ear, 'pct', 'formula sheet', 2)];
        traps.push({ v: rate / 100, why: 'The nominal rate ignores compounding; the EAR is higher.' });
      }
      var parts = [];
      if (type !== 'compound' && r.chance(0.6)) parts.push({ ask: ['What is the interest cost for the loan period (as a %)?', 'What is the rate you effectively pay for the period (r_p)?', 'Total interest expense of this option, as a % for the period?'], answer: rp, unit: 'pct', dp: 2, traps: traps.slice(0, 1), steps: steps.slice(0, steps.length - 1) });
      parts.push({ ask: ['What is the effective annual rate (EAR)?', 'Calculate the exact effective annual rate.', 'Convert this loan to an effective annual rate.'], answer: ear, alts: altsL, unit: 'pct', dp: 2, traps: traps, steps: steps,
        method: ['Find the interest rate for the actual loan period', 'Count how many such periods fit in a year', 'Compound: (1 + r_p)^n − 1'] });
      return { intro: [c.company + ' needs short-term funding.', 'For a seasonal cash shortage, ' + c.company + ' looks at a loan.'], facts: [fact('Offer', amt, 'cur', desc)], noise: [fact('x', 0, 'cur', 'The CFO notes that the company\'s tax rate is ' + r.int(15, 30) + '%.')], parts: parts, layouts: ['sentence', 'case'] };
    }
  });

  /* ---------------- 4-option comparison (mirrors FSM_InterestRates.xlsx) ---------------- */
  FSM.addSkill({
    id: 'fin_w4_four_options', topic: 'fin_w4', title: 'Compare 4 funding options (loan vs supplier credit)',
    formula: 'One-off need → lowest cost for the period; recurring need → lowest EAR',
    build: function (r, c) {
      var C = c.C;
      var o1 = { rate: r.range(2, 9, 0.5), days: r.pick([60, 90, 120, 150, 180]) };
      var o2 = { rate: r.int(6, 20), days: r.pick([30, 45, 60, 65, 90]) };
      var t3 = terms(r), t4 = terms(r);
      var banks = r.sample(BANKS, 2), sups = r.sample(SUPPLIERS, 2);
      var opts = [
        { name: '1) Discount loan from ' + banks[0] + ' at ' + o1.rate + '% for ' + o1.days + ' days', rp: FSM.calc.discountLoan(o1.rate), days: o1.days, how: o1.rate + '/(100 − ' + o1.rate + ')' },
        { name: '2) Regular loan from ' + banks[1] + ' at ' + o2.rate + '% p.a. simple interest for ' + o2.days + ' days', rp: FSM.calc.simpleLoan(o2.rate, o2.days), days: o2.days, how: o2.rate + '% × ' + o2.days + '/365' },
        { name: '3) Bill from ' + sups[0] + ' with terms ' + t3.s, rp: t3.cd / (100 - t3.cd), days: t3.z - t3.y, how: t3.cd + '/(100 − ' + t3.cd + '), N = ' + (t3.z - t3.y) },
        { name: '4) Bill from ' + sups[1] + ' with terms ' + t4.s, rp: t4.cd / (100 - t4.cd), days: t4.z - t4.y, how: t4.cd + '/(100 − ' + t4.cd + '), N = ' + (t4.z - t4.y) }
      ];
      opts.forEach(function (o) { o.ear = FSM.calc.ear(o.rp, o.days); });
      var short = opts.map(function (o) { return o.name.split(' with ')[0].split(' at ')[0].replace(/^\d\) /, ''); });
      var minRp = opts.reduce(function (b, o, i) { return o.rp < opts[b].rp ? i : b; }, 0);
      var minEar = opts.reduce(function (b, o, i) { return o.ear < opts[b].ear ? i : b; }, 0);
      var parts = [];
      var which = r.sample([0, 1, 2, 3], 2);
      which.forEach(function (i) {
        var o = opts[i];
        parts.push({ ask: ['a) Total interest expense (as a %) of option ' + (i + 1) + '?', 'a) What does option ' + (i + 1) + ' cost for its own period (in %)?'], answer: o.rp, unit: 'pct', dp: 2,
          traps: i === 0 ? [{ v: o1.rate / 100, why: 'Discount loan: rate/(100 − rate).' }] : i === 1 ? [{ v: o2.rate / 100, why: 'Scale the p.a. rate to the loan period.' }] : [{ v: (i === 2 ? t3 : t4).cd / 100, why: 'Use CD/(100 − CD).' }],
          steps: [step('Option ' + (i + 1) + ': r_p = ' + o.how, o.rp, 'pct', 'see terms', 4)] });
        parts.push({ ask: ['b) Effective annual rate of option ' + (i + 1) + '?', 'b) Annualise option ' + (i + 1) + ' (exact EAR).'], answer: o.ear, alts: i === 1 ? [o2.rate / 100] : [], unit: 'pct', dp: 2,
          traps: [{ v: o.rp * 365 / o.days, why: 'That is the approximate annual rate without compounding (fine for ranking, but the question asks for the exact EAR).' }],
          steps: [step('r_p', o.rp, 'pct', 'part a', 4), step('EAR = (1 + r_p)^(365/' + o.days + ') − 1', o.ear, 'pct', 'formula sheet', 2)] });
      });
      parts.push({ kind: 'choice', ask: ['c) If this is a one-time cash problem, which option should the company choose?'],
        choices: [short[minRp]].concat(short.filter(function (_, i) { return i !== minRp; })), correctChoice: 0,
        why: 'One-off → choose the lowest total cost for the period: ' + opts.map(function (o, i) { return (i + 1) + ') ' + h.p(o.rp); }).join(', ') + '.' });
      parts.push({ kind: 'choice', ask: ['d) If the company expects this to happen regularly, which option should it choose?'],
        choices: [short[minEar]].concat(short.filter(function (_, i) { return i !== minEar; })), correctChoice: 0,
        why: 'Recurring → compare annualised costs (EAR): ' + opts.map(function (o, i) { return (i + 1) + ') ' + h.p(o.ear); }).join(', ') + '.' });
      return {
        intro: [c.company + ' faces a temporary cash shortage and needs short-term funding. It can borrow from a bank, or forfeit a supplier discount (effectively borrowing from that supplier). Assume a 365-day year. Options:', 'A late customer payment leaves ' + c.company + ' short of cash. Four ways to fund the gap (365-day year):'],
        facts: opts.map(function (o) { return fact(o.name, 0, 'cur', o.name + '.'); }),
        parts: parts, layouts: ['sentence']
      };
    }
  });

  /* ---------------- resources needed to support the CCC ---------------- */
  FSM.addSkill({
    id: 'fin_w4_ccc_resources', topic: 'fin_w4', title: 'Resources needed to support the CCC',
    formula: 'Resources = (AAI/365)×COGS + (ACP/365)×credit sales − (APP/365)×credit purchases',
    build: function (r, c) {
      var retail = r.chance(0.3);
      var aai = r.int(10, 120), acp = retail ? 0 : r.int(15, 90), app = r.int(20, 90);
      var sales = r.range(2, 80, 0.5) * 1e6, cogs = h.r0(sales * r.range(0.5, 0.8, 0.01) / 1e4) * 1e4;
      var purch = retail ? cogs : h.r0(cogs * r.range(0.4, 0.9, 0.01) / 1e4) * 1e4;
      var x = FSM.calc.resourcesCCC(aai, acp, app, cogs, sales, purch);
      var C = c.C;
      return {
        intro: [c.company + ' (' + c.industry + ') reviews its cash management. All sales and purchases are on credit; use a 365-day year.', retail ? c.company + ' runs a cash-only retail business (no receivables).' : 'Data for ' + c.company + ' (365-day year, all sales and purchases on credit):'],
        facts: [
          fact('Average age of inventory', aai, 'days', 'Inventory is held ' + aai + ' days on average.', { dp: 0 }),
          fact('Average collection period', acp, 'days', acp ? 'Receivables are collected after ' + acp + ' days.' : 'Customers pay immediately.', { dp: 0 }),
          fact('Average payment period', app, 'days', 'Suppliers are paid after ' + app + ' days.', { dp: 0 }),
          fact('Annual sales', sales, 'cur', 'Annual sales are ' + C(sales) + ';'),
          fact('Cost of goods sold', cogs, 'cur', 'cost of goods sold is ' + C(cogs) + ';'),
          fact('Purchases', purch, 'cur', 'purchases are ' + C(purch) + '.')
        ],
        parts: [
          { ask: ['What is the cash conversion cycle?', 'Calculate the CCC.'], answer: x.ccc, unit: 'days', dp: 0, traps: [{ v: x.oc, why: 'That is the operating cycle.' }],
            steps: [step('CCC = ' + aai + ' + ' + acp + ' − ' + app, x.ccc, 'days', 'given', 0)] },
          { ask: ['How much is needed to finance the CCC (resources needed)?', 'Calculate the resources needed to support the cash conversion cycle.'], answer: x.total, unit: 'cur',
            traps: [{ v: aai / 365 * sales + acp / 365 * sales - app / 365 * purch, why: 'Inventory is valued at COGS, not sales.' }, { v: x.inv + x.ar + x.ap, why: 'Payables FINANCE you — subtract them.' }, { v: x.ccc / 365 * sales, why: 'Value each component on its own base (COGS, sales, purchases).' }],
            steps: [step('Inventory = ' + aai + '/365 × ' + C(cogs), x.inv, 'cur', 'AAI × COGS'), step('Receivables = ' + acp + '/365 × ' + C(sales), x.ar, 'cur', 'ACP × credit sales'), step('Payables = ' + app + '/365 × ' + C(purch), x.ap, 'cur', 'APP × credit purchases'), step('Resources = inventory + receivables − payables', x.total, 'cur', 'formula sheet')],
            method: ['Value inventory: AAI/365 × COGS', 'Value receivables: ACP/365 × credit sales', 'Value payables: APP/365 × credit purchases', 'Inventory + receivables − payables'] },
          x.total < 0 ? { kind: 'choice', ask: ['What does the negative result mean?'], choices: ['Operations generate funding: suppliers finance more than inventory and receivables require.', 'The company must borrow this amount.', 'The company is making a loss.', 'Inventory is too low.'], correctChoice: 0, why: 'A negative CCC/resource need means cash comes in before suppliers are paid.' }
            : { kind: 'choice', ask: ['Which action reduces the resources needed?'], choices: ['Paying suppliers later (within the agreed terms)', 'Holding more safety stock', 'Giving customers longer credit terms', 'Paying suppliers early without a discount'], correctChoice: 0, why: 'Lower inventory days, faster collection or slower (on-time) payment all shrink the CCC.' }
        ]
      };
    }
  });

  /* ---------------- concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w4_concepts', topic: 'fin_w4', title: 'Short-term funding concepts',
    items: [
      { term: 'Spontaneous liabilities', cat: 'src', defs: ['Funding that arises automatically from normal business, such as accounts payable and accruals.', 'Short-term financing that grows with sales without a formal loan.'] },
      { term: 'Accruals', cat: 'src', defs: ['Liabilities for services received but not yet paid, such as wages owed at the end of the month.', 'E.g. employees who work two weeks before payday effectively lend the firm money.'] },
      { term: 'Accounts payable', cat: 'src', defs: ['Money owed to suppliers for purchases on account — effectively a short-term loan from the supplier.'] },
      { term: 'Stretching accounts payable', cat: 'src', defs: ['Paying suppliers after the agreed due date to keep cash longer.', 'An emergency funding source that harms supplier relationships.'] },
      { term: 'Unsecured loan', cat: 'loan', defs: ['A loan without specific collateral; if unpaid, the firm can be forced into bankruptcy.'] },
      { term: 'Secured loan', cat: 'loan', defs: ['A loan backed by a specific asset the lender can claim if the firm does not pay.', 'Cheaper/easier funding because collateral lowers the lender\'s risk.'] },
      { term: 'Pledging accounts receivable', cat: 'loan', defs: ['Using receivables as collateral for a loan (often 30–100% of their book value).'] },
      { term: 'Factoring', cat: 'loan', defs: ['Selling receivables to a third party at a discount; that party collects and bears the credit risk.'] },
      { term: 'Discount loan', cat: 'rate', defs: ['A loan where interest is deducted up front, so you receive less than the face value.'] },
      { term: 'Simple interest', cat: 'rate', defs: ['Interest quoted per year (p.a.) that does not compound within the period.'] },
      { term: 'Effective annual rate (EAR)', cat: 'rate', defs: ['The annual rate including compounding, used to compare loans with different terms.'] },
      { term: 'Cost of giving up a discount', cat: 'rate', defs: ['The implied interest rate of paying a supplier on the last day instead of on the discount date.'] }
    ],
    groups: {
      'Spontaneous liabilities': ['Accounts payable', 'Accruals'],
      'Secured short-term financing': ['Pledging accounts receivable', 'Inventory as collateral', 'Factoring'],
      'Bank loans': ['Unsecured loan', 'Discount loan', 'Simple-interest loan']
    },
    scenarios: [
      { q: ['A firm sells €1,000,000 of receivables to a company that pays €970,000 now and collects from the customers itself. What is this?'], a: 'Factoring' },
      { q: ['A firm uses its receivables as collateral; if it doesn\'t repay, the customers will pay the bank instead. What is this?'], a: 'Pledging accounts receivable' },
      { q: ['Terms are net 60, but the company pays on day 80 without penalty so far. What is it doing?'], a: 'Stretching accounts payable' },
      { q: ['A bank lends €100,000 at 6% but pays out only €94,000. Which loan type is this?'], a: 'Discount loan' },
      { q: ['Employees work all month and are paid on the last day. For the firm this creates…'], a: 'Accruals' }
    ],
    tf: [
      { s: 'For a one-time funding need you choose the option with the lowest total cost for the period; for a recurring need you compare EARs.', t: true, why: 'Matches the instructor\'s solution of the interest-rate exercise.' },
      { s: 'With terms 1/10 n/30 it can make sense to pay on day 20.', t: false, why: 'You pay either on day 10 (take the discount) or day 30 (use the full period). Day 20 has no benefit.' },
      { s: 'A discount loan at 6% costs exactly 6% for its period.', t: false, why: 'You only receive 94, so the rate is 6/94 = 6.38%.' },
      { s: 'Lenders prefer collateral whose life matches the loan term, e.g. receivables or inventory for short-term loans.', t: true, why: 'Short-term assets for short-term loans.' },
      { s: 'The exact and approximate cost of giving up a discount can rank options differently.', t: false, why: 'The Excel solution notes the method doesn\'t change which option is cheapest.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
