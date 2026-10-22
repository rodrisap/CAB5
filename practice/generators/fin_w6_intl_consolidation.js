/* Finance Week 6 — International finance & consolidation (Ch. 19.1–19.3 + lecture video) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};

  FSM.addTopic({ id: 'fin_w6', area: 'Finance', week: 6, title: 'International finance & consolidation', read: 'Zutter & Smart 19.1–19.3 + consolidation lecture video' });

  FSM.calc.dividendTax = function (div, foreignTaxPaid, rate, agreement) {
    var due = div * rate, credit = agreement ? foreignTaxPaid : 0;
    var payable = Math.max(0, due - credit);
    return { due: due, credit: credit, payable: payable, net: div - payable };
  };
  /* consolidation of a 100% subsidiary. parent/sub: {ca, ppe, bld, ip, cl, ncl, cs, re} (before acquisition, parent without investment)
     price, financing: 'debt' | 'cash', mult = market value / book value of sub's non-current assets */
  FSM.calc.consolidate = function (P, S, price, financing, mult) {
    var subEq = S.cs + S.re;
    var pa = Object.assign({}, P);
    pa.inv = price;
    if (financing === 'debt') pa.ncl = P.ncl + price; else pa.ca = P.ca - price;
    var excess = price - subEq;
    var subNCA = (S.ppe || 0) + (S.bld || 0) + (S.ip || 0);
    var uplift = Math.max(0, Math.min(excess, subNCA * (mult - 1)));
    var goodwill = excess - uplift;
    var cons = {
      ca: pa.ca + S.ca, ppe: (pa.ppe || 0) + (S.ppe || 0) * (excess > 0 ? mult : 1), bld: (pa.bld || 0) + (S.bld || 0) * (excess > 0 ? mult : 1), ip: (pa.ip || 0) + (S.ip || 0) * (excess > 0 ? mult : 1),
      goodwill: goodwill, cl: pa.cl + S.cl, ncl: pa.ncl + S.ncl, cs: pa.cs, re: pa.re
    };
    if (uplift < subNCA * (mult - 1)) { // excess too small to cover the full uplift: scale it
      var f = subNCA ? uplift / subNCA : 0;
      cons.ppe = (pa.ppe || 0) + (S.ppe || 0) * (1 + f); cons.bld = (pa.bld || 0) + (S.bld || 0) * (1 + f); cons.ip = (pa.ip || 0) + (S.ip || 0) * (1 + f);
    }
    cons.ta = cons.ca + cons.ppe + cons.bld + cons.ip + cons.goodwill;
    cons.tle = cons.cl + cons.ncl + cons.cs + cons.re;
    return { parentAfter: pa, subEq: subEq, excess: excess, uplift: uplift, goodwill: goodwill, cons: cons, combinedTA: pa.ca + (pa.ppe || 0) + (pa.bld || 0) + (pa.ip || 0) + pa.inv + S.ca + (S.ppe || 0) + (S.bld || 0) + (S.ip || 0) };
  };

  var PAIRS = [
    ['Norhaven Technologies', 'Sweden', 'PolarWave Electronics', 'Finland'], ['Atlas Green Energy', 'Canada', 'Andes AgroTech', 'Chile'],
    ['Pacifica Logistics Group', 'Australia', 'Caspian Oil & Gas Ltd.', 'Kazakhstan'], ['Iberica Foods International', 'Spain', 'Nile River Developments', 'Egypt'],
    ['Solstice Biopharma', 'Switzerland', 'Kiwi Health Sciences', 'New Zealand'], ['Horizon Data Systems', 'United States', 'Danube Infrastructure Group', 'Austria'],
    ['Aegis Marine Solutions', 'Greece', 'Sahara Renewable Ventures', 'Morocco'], ['Alpine Construction GmbH', 'Germany', 'Patagonia Outdoor Gear Co.', 'Argentina'],
    ['Vistara Textiles Pvt. Ltd.', 'India', 'Mekong Fisheries Corporation', 'Vietnam'], ['NovaSteel Industries', 'Brazil', 'Carpathia Pharma', 'Romania'],
    ['Zenith Aerospace', 'France', 'Seoul Digital Systems', 'South Korea'], ['Eastern Edge Shipping Co.', 'Singapore', 'Adriatic Shipping Lines', 'Croatia'],
    ['Baltic Renewables AS', 'Estonia', 'Cedar Valley Foods', 'Lebanon'], ['Luminar Financial Partners', 'United Kingdom', 'Serengeti Tourism Holdings', 'Tanzania']
  ];

  /* ---------------- exchange rates ---------------- */
  var CURS = [['$', 'USD', 'dollar'], ['£', 'GBP', 'pound'], ['¥', 'JPY', 'yen'], ['CHF ', 'CHF', 'Swiss franc'], ['kr ', 'SEK', 'krona']];
  FSM.addSkill({
    id: 'fin_w6_fx', topic: 'fin_w6', title: 'Exchange rates: conversion, appreciation, forwards',
    formula: 'Quote “X per €” → €1 = X units of foreign currency',
    build: function (r, c) {
      c.setCur('EUR');
      var fc = r.pick(CURS.slice(0, 2));
      var base = fc[1] === 'USD' ? r.range(1.02, 1.25, 0.01) : r.range(0.82, 0.92, 0.01);
      var r1 = base, r2 = h.r2(base + r.pick([-1, 1]) * r.range(0.02, 0.08, 0.01));
      var amt = r.range(20, 900, 5) * 1000;
      var v = r.pick(['convert', 'convert', 'forward']);
      var euroStronger = r2 > r1;
      if (v === 'convert') {
        return {
          intro: ['On 1 March the EUR/' + fc[1] + ' rate was ' + fc[0] + F.num(r1, 2) + '/€. On 15 April it was ' + fc[0] + F.num(r2, 2) + '/€.', 'The euro traded at ' + fc[0] + F.num(r1, 2) + ' per euro last month and at ' + fc[0] + F.num(r2, 2) + ' per euro today.'],
          facts: [fact('Invoice', amt, 'num', c.company + ' must pay a supplier invoice of ' + fc[0] + F.num(amt) + ' (in ' + fc[2] + 's).')],
          parts: [
            { kind: 'choice', ask: ['Which currency appreciated?', 'Which currency gained value between the two dates?'], choices: euroStronger ? ['The euro (€1 buys more ' + fc[2] + 's)', 'The ' + fc[2], 'Neither — rates are relative', 'Both'] : ['The ' + fc[2] + ' (€1 buys fewer ' + fc[2] + 's)', 'The euro', 'Neither — rates are relative', 'Both'], correctChoice: 0,
              why: 'The quote is ' + fc[2] + 's per euro. It went from ' + F.num(r1, 2) + ' to ' + F.num(r2, 2) + ': ' + (euroStronger ? 'one euro buys more, so the euro appreciated and the ' + fc[2] + ' depreciated.' : 'one euro buys less, so the euro depreciated and the ' + fc[2] + ' appreciated.') },
            { ask: ['How many euros would the invoice have cost on the first date?', 'What does the invoice cost in euros at the first rate?'], answer: amt / r1, unit: 'cur', dp: 2,
              traps: [{ v: amt * r1, why: 'The quote is ' + fc[2] + 's per euro, so divide the ' + fc[2] + ' amount by the rate.' }],
              steps: [step(fc[0] + F.num(amt) + ' / ' + F.num(r1, 2), amt / r1, 'cur', 'divide by ' + fc[2] + ' per €', 2)] },
            { ask: ['And on the second date?', 'What does it cost in euros at the second rate?'], answer: amt / r2, unit: 'cur', dp: 2,
              traps: [{ v: amt * r2, why: 'Divide, don\'t multiply.' }],
              steps: [step(fc[0] + F.num(amt) + ' / ' + F.num(r2, 2), amt / r2, 'cur', 'divide by ' + fc[2] + ' per €', 2)] }
          ], layouts: ['sentence']
        };
      }
      var spot = h.r2(r.range(1.1, 1.3, 0.01)), fwd = h.r2(spot - r.range(0.03, 0.15, 0.01));
      var euros = r.range(50, 500, 10) * 1000;
      var gbp = euros / spot;
      var months = r.pick([1, 2, 3, 6]);
      return {
        intro: [c.company + ', a Dutch company, sells goods to a UK customer for the equivalent of ' + c.C(euros) + '. The invoice is in British pounds and will be paid in ' + months + ' month' + (months > 1 ? 's' : '') + '.'],
        facts: [fact('Spot rate', spot, 'num', 'The current exchange rate is €' + F.num(spot, 2) + '/£.'), fact('Forward rate', fwd, 'num', 'The ' + months + '-month forward rate is €' + F.num(fwd, 2) + '/£.')],
        parts: [
          { ask: ['What will the invoice amount be in British pounds?', 'How many pounds does the invoice state?'], answer: gbp, unit: 'num', dp: 0,
            traps: [{ v: euros * spot, why: 'The quote is euros per pound: pounds = euros ÷ (€ per £).' }, { v: euros / fwd, why: 'The invoice is set today, at the spot rate.' }],
            steps: [step('£ = ' + c.C(euros) + ' / ' + F.num(spot, 2), gbp, 'num', 'spot rate, € per £', 0)] },
          { ask: ['If the company enters a forward contract, how many euros will it receive?', 'With a forward contract, what is the guaranteed euro amount?'], answer: gbp * fwd, unit: 'cur', dp: 0,
            traps: [{ v: euros, why: 'The forward rate differs from the spot rate, so the locked-in amount differs too.' }, { v: gbp / fwd, why: '€ per £ × pounds = euros.' }],
            steps: [step('€ = £' + F.num(gbp, 0) + ' × ' + F.num(fwd, 2), gbp * fwd, 'cur', 'forward rate, € per £', 0)] },
          { kind: 'choice', ask: ['Why could the company still choose the forward contract, even though it gives fewer euros than today\'s value?'], choices: ['It removes the exchange-rate risk: the euro amount is certain, whatever the pound does.', 'Forward contracts always give more money than the spot rate.', 'It avoids double taxation.', 'It turns the pound invoice into a euro invoice for the customer.'], correctChoice: 0, why: 'A forward locks in the rate for a future date. You give up potential gains in exchange for certainty.' }
        ], layouts: ['sentence', 'table']
      };
    }
  });

  /* ---------------- double taxation ---------------- */
  FSM.addSkill({
    id: 'fin_w6_double_tax', topic: 'fin_w6', title: 'Double taxation and tax agreements',
    formula: 'Dividend tax due = max(0, home rate × dividend − foreign tax credit)',
    build: function (r, c) {
      var pr = r.pick(PAIRS);
      var mode = r.pick(['pretax', 'dividend']);
      var fr = r.range(0.1, 0.3, 0.01), hr = r.range(0.1, 0.35, 0.05);
      var agreement = r.chance(0.5);
      var pretax = r.range(1, 20, 0.5) * 1e6;
      var foreignTax = mode === 'pretax' ? pretax * fr : h.r0(r.range(0.1, 0.6, 0.05) * pretax / 1000) * 1000;
      var div = mode === 'pretax' ? pretax - foreignTax : pretax;
      var x = FSM.calc.dividendTax(div, foreignTax, hr, agreement);
      var C = c.C;
      var intro = mode === 'pretax'
        ? [pr[0] + ' (' + pr[1] + ') owns a subsidiary, ' + pr[2] + ', in ' + pr[3] + ' with pretax income of ' + C(pretax) + '. All after-tax income is paid to the parent as a dividend.']
        : ['After an acquisition, ' + pr[2] + ' (' + pr[3] + ') pays all its free cash flow of ' + C(pretax) + ' as a dividend to its parent ' + pr[0] + ' (' + pr[1] + '). It has already paid ' + C(foreignTax) + ' in taxes in ' + pr[3] + '.'];
      var facts = [];
      if (mode === 'pretax') facts.push(fact('Local tax rate', fr, 'pct', 'The tax rate in ' + pr[3] + ' is ' + F.num(fr * 100) + '%.', { dp: 0 }));
      facts.push(fact('Home dividend tax', hr, 'pct', 'The dividend tax rate in ' + pr[1] + ' is ' + F.num(hr * 100) + '%.', { dp: 0 }));
      facts.push(fact('Tax agreement', agreement ? 1 : 0, 'num', agreement ? 'There is a tax agreement: taxes paid in ' + pr[3] + ' may be subtracted from taxes due in ' + pr[1] + '.' : 'There is no tax agreement between ' + pr[1] + ' and ' + pr[3] + '.'));
      var steps = [];
      if (mode === 'pretax') steps.push(step('Tax in ' + pr[3] + ' = ' + C(pretax) + ' × ' + F.num(fr * 100) + '%', foreignTax, 'cur', 'local rate'), step('Dividend = ' + C(pretax) + ' − ' + C(foreignTax), div, 'cur', 'after-tax income'));
      steps.push(step('Tax due in ' + pr[1] + ' = ' + C(div) + ' × ' + F.num(hr * 100) + '%', x.due, 'cur', 'home dividend tax'));
      if (agreement) steps.push(step('Less credit for tax paid in ' + pr[3], x.credit, 'cur', 'tax agreement'), step('Dividend tax payable = max(0, ' + C(x.due) + ' − ' + C(x.credit) + ')', x.payable, 'cur', x.credit > x.due ? 'cannot go below 0' : 'difference'));
      steps.push(step('Net funds = ' + C(div) + ' − ' + C(x.payable), x.net, 'cur', 'dividend − home tax'));
      var traps = [{ v: agreement ? div - x.due : div - Math.max(0, x.due - foreignTax), why: agreement ? 'With a tax agreement you may subtract the foreign tax paid.' : 'Without an agreement the foreign tax cannot be credited.' }];
      if (agreement && foreignTax > x.due) traps.push({ v: div - (x.due - foreignTax), why: 'The credit can at most reduce the home tax to 0 — it cannot become negative.' });
      if (mode === 'pretax') traps.push({ v: pretax * (1 - hr), why: 'First pay foreign tax, then home tax on the dividend.' });
      return {
        intro: intro, facts: facts, layouts: ['sentence', 'table'],
        parts: [{ ask: ['What are the net funds available to ' + pr[0] + ' from the dividend?', 'Calculate the net funds the parent keeps after all taxes.'], answer: x.net, unit: 'cur', traps: traps, steps: steps,
          method: mode === 'pretax' ? ['Pay local tax on pretax income', 'The remainder is paid as a dividend', 'Calculate home dividend tax', 'Subtract the foreign tax credit (only with an agreement, not below 0)', 'Net funds = dividend − home tax'] : ['Calculate home dividend tax', 'Subtract the foreign tax credit (only with an agreement, not below 0)', 'Net funds = dividend − home tax'] }]
      };
    }
  });

  /* ---------------- cost / equity method ---------------- */
  FSM.addSkill({
    id: 'fin_w6_equity_method', topic: 'fin_w6', title: 'Cost method vs equity method',
    formula: '<20% cost method · 20–50% equity method · >50% consolidate',
    build: function (r, c) {
      var own = r.pick([5, 10, 15, 25, 30, 35, 40, 45]) / 100;
      var cost = r.range(50, 900, 5) * 1000;
      var ni = r.range(50, 800, 5) * 1000, dv = h.r0(ni * r.range(0.2, 0.7, 0.05) / 1000) * 1000;
      var inv = c.other(), C = c.C;
      var equity = own >= 0.2;
      var income = equity ? own * ni : own * dv;
      var balance = equity ? cost + own * ni - own * dv : cost;
      return {
        intro: ['On 1 January, ' + c.company + ' buys ' + F.num(own * 100) + '% of the ordinary shares of ' + inv + ' for ' + C(cost) + '.'],
        facts: [fact('Net income investee', ni, 'cur', 'During the year ' + inv + ' reports net income of ' + C(ni)), fact('Dividends paid', dv, 'cur', 'and pays total dividends of ' + C(dv) + '.')],
        layouts: ['sentence'],
        parts: [
          { kind: 'choice', ask: ['Which method does ' + c.company + ' use for this investment?'], choices: equity ? ['Equity method', 'Cost method', 'Full consolidation', 'Fair value through profit only'] : ['Cost method', 'Equity method', 'Full consolidation', 'Fair value through profit only'], correctChoice: 0, why: 'Below 20%: cost method (no significant influence). 20–50%: equity method. Above 50%: control → consolidate.' },
          { ask: ['How much investment income does ' + c.company + ' record this year?', 'What income from this investment appears in ' + c.company + '\'s income statement?'], answer: income, unit: 'cur',
            traps: equity ? [{ v: own * dv, why: 'Under the equity method you record your share of the investee\'s NET INCOME, not dividends.' }] : [{ v: own * ni, why: 'Under the cost method only dividends received count as income.' }],
            steps: [equity ? step('Share of net income = ' + F.num(own * 100) + '% × ' + C(ni), income, 'cur', 'equity method') : step('Dividends received = ' + F.num(own * 100) + '% × ' + C(dv), income, 'cur', 'cost method')] },
          { ask: ['What is the balance of the investment account at year end?', 'At what amount is the investment shown on the balance sheet at year end?'], answer: balance, unit: 'cur',
            traps: equity ? [{ v: cost + own * ni, why: 'Dividends received reduce the investment account under the equity method.' }, { v: cost, why: 'Under the equity method the investment is adjusted for your share of income and dividends.' }] : [{ v: cost + own * dv, why: 'Under the cost method the investment stays at cost.' }],
            steps: equity ? [step('Cost', cost, 'cur', 'purchase price'), step('+ share of net income ' + F.num(own * 100) + '% × ' + C(ni), own * ni, 'cur', 'debit Share Investments'), step('− dividends received ' + F.num(own * 100) + '% × ' + C(dv), own * dv, 'cur', 'credit Share Investments'), step('Year-end balance', balance, 'cur', 'cost + income − dividends')] : [step('Investment stays at cost', cost, 'cur', 'cost method')] }
        ]
      };
    }
  });

  /* ---------------- consolidation (mirrors FSM_InternationalFinance.xlsx) ---------------- */
  function bsRows(B, withInv, invLabel) {
    var rows = [{ head: 'Assets' }, { label: 'Current assets', v: [B.ca] }];
    if (B.ppe) rows.push({ label: 'PPE, net', v: [B.ppe] });
    if (B.bld) rows.push({ label: 'Buildings, net', v: [B.bld] });
    if (B.ip) rows.push({ label: 'Intellectual property', v: [B.ip] });
    if (withInv) rows.push({ label: invLabel, v: [B.inv] });
    rows.push({ label: 'Total assets', v: [B.ca + (B.ppe || 0) + (B.bld || 0) + (B.ip || 0) + (withInv ? B.inv : 0)], total: true });
    rows.push({ head: 'Liabilities & equity' }, { label: 'Current liabilities', v: [B.cl] }, { label: 'Non-current liabilities', v: [B.ncl] }, { label: 'Common stock', v: [B.cs] }, { label: 'Retained earnings', v: [B.re] });
    rows.push({ label: 'Total liabilities and equity', v: [B.cl + B.ncl + B.cs + B.re], total: true });
    return rows;
  }
  function randomBS(r, total, kind) {
    var B = {};
    var lines = r.pick([['ppe', 'bld'], ['ppe', 'ip'], ['bld', 'ip'], ['ppe', 'bld', 'ip']]);
    var nca = 0;
    lines.forEach(function (l) { B[l] = total * r.range(0.05, 0.25, 0.05); nca += B[l]; });
    B.ca = total - nca;
    B.cl = total * r.range(kind === 'sub' ? 0.15 : 0.05, 0.25, 0.05);
    B.ncl = total * r.range(0.1, 0.3, 0.05);
    B.cs = total * r.range(kind === 'sub' ? 0.05 : 0.15, 0.3, 0.05);
    B.re = total - B.cl - B.ncl - B.cs;
    Object.keys(B).forEach(function (k) { B[k] = Math.round(B[k]); });
    return B;
  }
  FSM.addSkill({
    id: 'fin_w6_consolidation', topic: 'fin_w6', title: 'Consolidated balance sheet (100% subsidiary)',
    formula: 'Eliminate investment vs subsidiary equity; excess → asset uplift, remainder = goodwill',
    build: function (r, c) {
      var pr = r.pick(PAIRS);
      var size = Math.pow(10, 3 + r.int(1, 3));
      var Pb = randomBS(r, size * r.int(5, 10) * 100, 'parent');
      var Sb = randomBS(r, size * r.int(1, 4) * 100, 'sub');
      var subEq = Sb.cs + Sb.re;
      var premium = r.pick([1, 1, 1.1, 1.2, 1.3, 1.4, 1.5]);
      var price = Math.round(subEq * premium);
      var mult = premium > 1 && r.chance(0.5) ? h.r2(1 + r.range(0.1, 0.5, 0.1)) : 1;
      var financing = r.chance(0.7) ? 'debt' : 'cash';
      var X = FSM.calc.consolidate(Pb, Sb, price, financing, mult);
      var C = c.C;
      var subNCAlines = [Sb.ppe ? 'PPE' : null, Sb.bld ? 'buildings' : null, Sb.ip ? 'intellectual property' : null].filter(Boolean).join(', ');
      var stmt = { title: '', cols: [pr[0], pr[2]], rows: [] };
      var pr1 = bsRows(Pb, false), sr1 = bsRows(Sb, false);
      // align rows by label
      var labels = [];
      pr1.concat(sr1).forEach(function (row) { var k = row.head || row.label; if (labels.indexOf(k) < 0) labels.push(k); });
      var order = ['Assets', 'Current assets', 'PPE, net', 'Buildings, net', 'Intellectual property', 'Total assets', 'Liabilities & equity', 'Current liabilities', 'Non-current liabilities', 'Common stock', 'Retained earnings', 'Total liabilities and equity'];
      order.forEach(function (k) {
        if (labels.indexOf(k) < 0) return;
        if (k === 'Assets' || k === 'Liabilities & equity') { stmt.rows.push({ head: k }); return; }
        function val(rows) { var m = rows.filter(function (x) { return x.label === k; })[0]; return m ? m.v[0] : ''; }
        stmt.rows.push({ label: k, v: [val(pr1), val(sr1)], total: /^Total/.test(k) });
      });
      var mvText = mult > 1 ? 'The market value of ' + pr[2] + '\'s non-current assets (' + subNCAlines + ') is ' + F.num(mult, 1) + '× their book value.' : 'The book value of ' + pr[2] + '\'s assets equals their market value.';
      var cons = X.cons;
      var parts = [];
      var stepsElim = [step('Subsidiary equity = ' + C(Sb.cs) + ' + ' + C(Sb.re), subEq, 'cur', 'common stock + retained earnings'), step('Excess of cost over book value = ' + C(price) + ' − ' + C(subEq), X.excess, 'cur', 'price − equity')];
      if (X.excess > 0) {
        parts.push({ ask: ['What is the excess of cost over book value?', 'By how much does the price exceed the book value of the subsidiary\'s equity?'], answer: X.excess, unit: 'cur',
          traps: [{ v: price - (Sb.ca + (Sb.ppe || 0) + (Sb.bld || 0) + (Sb.ip || 0)), why: 'Compare the price with the subsidiary\'s EQUITY, not its total assets.' }, { v: price - Sb.cs, why: 'Equity = common stock + retained earnings.' }],
          steps: stepsElim });
        parts.push({ ask: ['How much goodwill appears on the consolidated balance sheet?', 'What is consolidated goodwill?'], answer: X.goodwill, unit: 'cur',
          traps: mult > 1 ? [{ v: X.excess, why: 'First allocate the excess to assets whose market value exceeds book value; only the rest is goodwill.' }] : [{ v: 0, why: 'The excess that cannot be assigned to specific assets is goodwill.' }],
          steps: stepsElim.concat(mult > 1 ? [step('Uplift of non-current assets = (' + subNCAlines + ') × (' + F.num(mult, 1) + ' − 1)', X.uplift, 'cur', 'market value − book value'), step('Goodwill = excess − uplift', X.goodwill, 'cur', 'remainder')] : ['Book value = market value, so the whole excess is goodwill.', step('Goodwill', X.goodwill, 'cur', 'excess')]),
          method: ['Calculate the subsidiary\'s equity', 'Excess = price − subsidiary equity', 'Allocate the excess to assets with market value above book value', 'The remainder is goodwill'] });
      }
      parts.push({ ask: ['What are total consolidated assets?', 'Calculate total assets on the consolidated balance sheet.'], answer: cons.ta, unit: 'cur',
        traps: [{ v: X.combinedTA, why: 'Remove the investment in the subsidiary — otherwise the subsidiary is counted twice.' }, { v: X.combinedTA - price, why: X.excess > 0 ? 'Add the excess of cost (uplift + goodwill) back as assets.' : 'Check the financing effect on the parent.' }].filter(function (t) { return Math.abs(t.v - cons.ta) > 1; }),
        steps: [financing === 'debt' ? step('Parent after acquisition: NCL + ' + C(price) + ', investment + ' + C(price), X.parentAfter.ca + (X.parentAfter.ppe || 0) + (X.parentAfter.bld || 0) + (X.parentAfter.ip || 0) + price, 'cur', 'parent total assets incl. investment') : step('Parent after acquisition: cash − ' + C(price) + ', investment + ' + C(price), X.parentAfter.ca + (X.parentAfter.ppe || 0) + (X.parentAfter.bld || 0) + (X.parentAfter.ip || 0) + price, 'cur', 'parent total assets unchanged'),
          step('Combined total assets (parent + subsidiary)', X.combinedTA, 'cur', 'add up'), step('− investment in subsidiary', price, 'cur', 'eliminated'), step('+ excess of cost over book value (uplift + goodwill)', Math.max(0, X.excess), 'cur', 'step 2'), step('Consolidated total assets', cons.ta, 'cur', 'result')],
        method: ['Update the parent\'s balance sheet for the investment and its financing', 'Add both balance sheets together', 'Eliminate the investment against the subsidiary\'s equity', 'Add the excess of cost (asset uplift + goodwill)'] });
      parts.push({ ask: ['What is consolidated total equity (common stock + retained earnings)?', 'How much equity does the consolidated balance sheet show?'], answer: Pb.cs + Pb.re, unit: 'cur',
        traps: [{ v: Pb.cs + Pb.re + subEq, why: 'The subsidiary\'s equity is eliminated against the investment — only the parent\'s equity remains.' }],
        steps: [step('Parent equity = ' + C(Pb.cs) + ' + ' + C(Pb.re), Pb.cs + Pb.re, 'cur', 'subsidiary equity is eliminated')] });
      parts.push({ ask: ['What are consolidated non-current liabilities?', 'Consolidated non-current liabilities?'], answer: cons.ncl, unit: 'cur',
        traps: financing === 'debt' ? [{ v: Pb.ncl + Sb.ncl, why: 'The acquisition was financed with new long-term debt — add it.' }] : [{ v: Pb.ncl + Sb.ncl + price, why: 'This acquisition was paid in cash, not with debt.' }],
        steps: [step('Parent NCL ' + (financing === 'debt' ? '+ new loan ' + C(price) : '(unchanged, paid in cash)'), X.parentAfter.ncl, 'cur', 'financing'), step('+ subsidiary NCL', Sb.ncl, 'cur', 'subsidiary balance sheet'), step('Consolidated NCL', cons.ncl, 'cur', 'sum')] });
      return {
        intro: [pr[0] + ', a company from ' + pr[1] + ', is going to acquire 100% of ' + pr[2] + ', a company from ' + pr[3] + ', for ' + C(price) + ', financed entirely with ' + (financing === 'debt' ? 'long-term debt' : 'cash') + '. ' + mvText + ' The balance sheets before the acquisition (converted to one currency):'],
        statement: stmt, facts: [], layouts: ['statement'],
        parts: r.chance(0.5) ? parts : r.sample(parts, Math.min(3, parts.length))
      };
    }
  });

  /* ---------------- concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w6_concepts', topic: 'fin_w6', title: 'International finance & consolidation concepts',
    items: [
      { term: 'Exchange rate', cat: 'fx', defs: ['The price of one currency expressed in another.'] },
      { term: 'Appreciation', cat: 'fx', defs: ['A currency gains value: it buys more units of the other currency than before.'] },
      { term: 'Depreciation (currency)', cat: 'fx', defs: ['A currency loses value: it buys fewer units of the other currency than before.'] },
      { term: 'Forward contract', cat: 'fx', defs: ['An agreement today to exchange currencies at a fixed rate on a future date, removing exchange-rate risk.'] },
      { term: 'Double taxation', cat: 'tax', defs: ['Profit is taxed in the subsidiary\'s country and again when the dividend reaches the parent\'s country.'] },
      { term: 'Tax agreement (treaty)', cat: 'tax', defs: ['A deal between countries allowing taxes paid abroad to be subtracted from taxes due at home.'] },
      { term: 'Cost method', cat: 'acc', defs: ['Used for holdings below 20%: the investment stays at cost and only dividends received are income.'] },
      { term: 'Equity method', cat: 'acc', defs: ['Used for 20–50% holdings: the investor records its share of the investee\'s net income; dividends reduce the investment.'] },
      { term: 'Consolidation', cat: 'acc', defs: ['Combining parent and subsidiary statements and eliminating the investment against the subsidiary\'s equity (control, >50%).'] },
      { term: 'Subsidiary', cat: 'acc', defs: ['A company that is controlled (more than 50% owned) by another company.'] },
      { term: 'Excess of cost over book value', cat: 'acc', defs: ['The amount by which the price paid for a subsidiary exceeds the book value of its equity.'] },
      { term: 'Goodwill', cat: 'acc', defs: ['The part of the excess of cost that cannot be assigned to specific assets.'] },
      { term: 'Intercompany transactions', cat: 'acc', defs: ['Transactions between companies in the same group; they are eliminated in consolidation.'] }
    ],
    groups: {
      'Challenges of multinationals': ['Exchange-rate risk', 'Double taxation', 'Translation and consolidation of foreign statements'],
      'Ownership 20–50%': ['Equity method', 'Significant influence', 'Share of investee net income is revenue'],
      'Ownership below 20%': ['Cost method', 'No significant influence', 'Only dividends received are income']
    },
    sequences: [
      { title: 'Preparing a consolidated balance sheet', steps: ['Add the investment (and its financing) to the parent\'s balance sheet', 'Add the parent and subsidiary balance sheets together', 'Eliminate the investment against the subsidiary\'s equity', 'Record any excess of cost over book value', 'Assign the excess to assets with market value above book value; the rest is goodwill'] }
    ],
    scenarios: [
      { q: ['A company owns 10% of another firm. How is the investee\'s net income reflected?', 'Case A: 10% holding. Which accounting method?'], a: 'Cost method' },
      { q: ['A parent owns 30% of an associate. Which method?'], a: 'Equity method' },
      { q: ['A parent owns 100% of another company. What must it prepare?'], a: 'Consolidation' },
      { q: ['The rate moves from $1.11/€ to $1.09/€. What happened to the euro?'], a: 'Depreciation (currency)', opts: ['Appreciation', 'Forward contract', 'Exchange rate'] },
      { q: ['A firm wants certainty about the euros it will receive for a pound invoice in 2 months. What should it use?'], a: 'Forward contract' }
    ],
    tf: [
      { s: 'In consolidation, the subsidiary\'s equity is added to the parent\'s equity.', t: false, why: 'It is eliminated against the parent\'s investment.' },
      { s: 'Simply adding up both balance sheets counts the subsidiary twice.', t: true, why: 'Once via its assets and liabilities, once via the investment.' },
      { s: 'Under a tax agreement, the foreign tax credit can make the home tax negative (a refund).', t: false, why: 'The credit can at most reduce the home tax to zero.' },
      { s: 'Goodwill arises only after the excess of cost has been assigned to undervalued assets.', t: true, why: 'Step 2 allocates the excess; the remainder is goodwill.' },
      { s: 'Consolidation is covered in depth in the textbook; the lecture only repeats it.', t: false, why: 'It is barely in the book — the lecture/video is the main source.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
