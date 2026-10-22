/* Finance Week 6 — extra material from Zutter & Smart Ch. 19.1–19.3 */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.ppp = function (S, iH, iF) { return S * (1 + iH) / (1 + iF); };
  FSM.calc.irp = function (S, rH, rF) { return S * (1 + rH) / (1 + rF); };
  var PAIRS = [['$', 'USD', '£', 'GBP', 1.1, 1.45], ['$', 'USD', '€', 'EUR', 1.0, 1.25], ['€', 'EUR', '£', 'GBP', 1.05, 1.25], ['$', 'USD', 'A$', 'AUD', 0.6, 0.8], ['€', 'EUR', 'CHF ', 'CHF', 0.9, 1.1]];
  var CTRY = { USD: 'the US', GBP: 'the UK', EUR: 'the euro area', AUD: 'Australia', CHF: 'Switzerland' };
  function cm(sym, v, dp) { return sym + F.num(v, dp == null ? 0 : dp); }

  FSM.addSkill({
    id: 'fin_w6_parity', topic: 'fin_w6', title: 'Purchasing power parity & interest rate parity',
    formula: 'E(S)/S = (1 + i_home)/(1 + i_foreign);  F/S = (1 + R_home)/(1 + R_foreign)  [S, F in home per foreign]',
    build: function (r, c) {
      var p = r.pick(PAIRS), H = p[0], Fo = p[2], S = r.range(p[4], p[5], 0.0005), q = H.trim() + '/' + Fo.trim();
      if (r.chance(0.5)) {
        var iH = r.range(0, 6, 0.5) / 100, iF = r.range(0, 12, 0.5) / 100; if (Math.abs(iH - iF) < 0.01) iF += 0.03;
        var ES = FSM.calc.ppp(S, iH, iF), weak = iF > iH ? Fo.trim() : H.trim();
        return {
          intro: ['The spot rate is ' + F.num(S, 4) + ' (' + q + '), i.e. 1 ' + Fo.trim() + ' = ' + H + F.num(S, 4) + '. Expected inflation next year is ' + F.num(iH * 100, 1) + '% in ' + CTRY[p[1]] + ' and ' + F.num(iF * 100, 1) + '% in ' + CTRY[p[3]] + '.'],
          facts: [], layouts: ['sentence'],
          parts: [
            { ask: ['According to purchasing power parity, what is the expected spot rate in one year (' + q + ')?', 'Using PPP, what exchange rate (' + q + ') do you expect a year from now?'], answer: ES, unit: 'num', dp: 4,
              traps: [{ v: S * (1 + iF) / (1 + iH), why: 'The currency with HIGHER inflation must depreciate. Rate in home per foreign: multiply by (1 + i_home)/(1 + i_foreign).' }, { v: S, why: 'PPP predicts a change when inflation differs.' }],
              steps: [step('E(S) = ' + F.num(S, 4) + ' × (1 + ' + F.num(iH * 100, 1) + '%) / (1 + ' + F.num(iF * 100, 1) + '%)', ES, 'num', 'PPP', 4)] },
            { kind: 'choice', ask: ['Which currency is expected to depreciate?'], choices: [p[3] + ' (' + Fo.trim() + ')', p[1] + ' (' + H.trim() + ')', 'Neither — PPP says rates stay fixed'], correctChoice: weak === Fo.trim() ? 0 : 1, why: 'Under PPP the currency of the country with higher inflation loses value.' }
          ]
        };
      }
      var rH = r.range(0.5, 6, 0.25) / 100, rF = r.range(0.5, 8, 0.25) / 100, Fw = FSM.calc.irp(S, rH, rF), amt = r.range(10, 500, 5) * 1000;
      var quoted = r.chance(0.5) ? Fw : h.r4(Fw * (1 + r.pick([-1, 1]) * r.range(0.005, 0.02, 0.0025)));
      var home = amt * (1 + rH), abroad = amt / S * (1 + rF) * quoted, better = abroad > home + 0.5 ? 1 : home > abroad + 0.5 ? 0 : 2;
      return {
        intro: ['An investor has ' + cm(H, amt) + ' for one year. The one-year risk-free rate is ' + F.num(rH * 100, 2) + '% at home (' + CTRY[p[1]] + ') and ' + F.num(rF * 100, 2) + '% abroad (' + CTRY[p[3]] + '). Spot rate: ' + F.num(S, 4) + ' ' + q + '. One-year forward rate: ' + F.num(quoted, 4) + ' ' + q + '.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What forward rate (' + q + ') would interest rate parity predict?'], answer: Fw, unit: 'num', dp: 4, traps: [{ v: S * (1 + rF) / (1 + rH), why: 'Home rate on top: F = S × (1 + R_home)/(1 + R_foreign) when quoted home per foreign.' }], steps: [step('F = ' + F.num(S, 4) + ' × (1 + ' + F.num(rH * 100, 2) + '%) / (1 + ' + F.num(rF * 100, 2) + '%)', Fw, 'num', 'IRP', 4)] },
          { ask: ['If the investor converts at spot, invests abroad and sells the proceeds forward at the quoted forward rate, how much (' + p[1] + ') does she get back?'], answer: abroad, unit: 'num', dp: 2, traps: [{ v: amt * S * (1 + rF) / quoted, why: 'Home per foreign: DIVIDE by spot to get foreign currency, MULTIPLY by forward to come back.' }],
            steps: [step('Convert: ' + cm(H, amt) + ' / ' + F.num(S, 4), amt / S, 'num', 'foreign currency', 2), step('Invest at ' + F.num(rF * 100, 2) + '%', amt / S * (1 + rF), 'num', 'foreign payoff', 2), step('Convert back × ' + F.num(quoted, 4), abroad, 'num', 'forward', 2)] },
          { kind: 'choice', ask: ['Compare with investing at home (' + cm(H, home, 2) + '). What should she do?'], choices: ['Invest at home', 'Invest abroad, covered with the forward', 'Indifferent — interest rate parity holds'], correctChoice: better, why: 'Home: ' + cm(H, home, 2) + '; covered abroad: ' + cm(H, abroad, 2) + '. If IRP holds, both give the same risk-free result.' }
        ]
      };
    }
  });

  FSM.addSkill({
    id: 'fin_w6_translation', topic: 'fin_w6', title: 'Translating a foreign subsidiary (all-current-rate method)',
    formula: 'Balance sheet at the closing rate; income statement at the average rate; translation adjustment → equity',
    build: function (r, c) {
      var p = r.pick([['£', '$'], ['$', '€'], ['CHF ', '€'], ['¥', '€']]), L = p[0], Hm = p[1];
      var rate0 = p[0] === '¥' ? r.range(120, 170, 1) : r.range(0.6, 1.4, 0.01), chg = r.pick([-1, 1]) * r.range(0.05, 0.2, 0.01), rate1 = p[0] === '¥' ? h.r0(rate0 * (1 + chg)) : h.r2(rate0 * (1 + chg));
      var cash = r.range(5, 40, 1) * 1000, inv = r.range(20, 120, 5) * 1000, ppe = r.range(30, 200, 5) * 1000, tot = cash + inv + ppe;
      var item = r.pick([['total assets', tot], ['inventory', inv], ['plant & equipment', ppe]]);
      var v0 = item[1] / rate0, v1 = item[1] / rate1;
      return {
        intro: [c.company + '\'s subsidiary keeps its books in ' + L.trim() + '. Its balance sheet shows cash ' + cm(L, cash) + ', inventory ' + cm(L, inv) + ' and plant & equipment ' + cm(L, ppe) + ', unchanged over the year. The exchange rate was ' + F.num(rate0, rate0 > 50 ? 0 : 2) + ' (' + L.trim() + '/' + Hm + ') at the start of the year and ' + F.num(rate1, rate1 > 50 ? 0 : 2) + ' (' + L.trim() + '/' + Hm + ') at year-end. The parent uses the all-current-rate method.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is ' + item[0] + ' in ' + Hm + ' on the year-end balance sheet?'], answer: v1, unit: 'num', dp: 2, traps: [{ v: v0, why: 'Balance sheet items are translated at the CLOSING (year-end) rate.' }, { v: item[1] * rate1, why: 'The rate is ' + L.trim() + ' per ' + Hm + ', so divide.' }], steps: [step(cm(L, item[1]) + ' / ' + F.num(rate1, rate1 > 50 ? 0 : 2), v1, 'num', 'closing rate', 2)] },
          { kind: 'choice', ask: ['The ' + Hm + ' value of ' + item[0] + ' changed although nothing changed in ' + L.trim() + '. What kind of exposure is this?'], choices: ['Accounting (translation) exposure', 'Economic exposure', 'Political risk', 'Transaction exposure in cash'], correctChoice: 0, why: 'Only the translated value of the accounts changed. Under the all-current-rate method the translation adjustment goes to a separate part of equity, not to income.' },
          { kind: 'choice', ask: ['Did the ' + L.trim() + ' appreciate or depreciate against the ' + Hm + '?'], choices: ['Appreciated', 'Depreciated'], correctChoice: rate1 < rate0 ? 0 : 1, why: 'Fewer ' + L.trim() + ' per ' + Hm + ' means each ' + L.trim() + ' is worth more (and vice versa).' }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'fin_w6_book', topic: 'fin_w6', title: 'Book: the international environment, translation & risk',
    items: [
      { term: 'Multinational company (MNC)', cat: 'e', defs: ['A firm with assets and operations abroad that earns part of its revenue and profit in foreign markets.'] },
      { term: 'European Union (EU)', cat: 'e', defs: ['A bloc of 27 countries with free trade inside it; most members share the euro.'] },
      { term: 'Monetary union', cat: 'e', defs: ['Replacing national currencies with one shared currency (the euro, notes and coins from 2002).'] },
      { term: 'GATT', cat: 'e', defs: ['The post-war treaty extending free-trade rules (since 1994 also to agriculture, financial services and intellectual property).'] },
      { term: 'World Trade Organization (WTO)', cat: 'e', defs: ['The body (since 1995) that polices world trading rules and settles trade disputes between members.'] },
      { term: 'Joint venture', cat: 'e', defs: ['A partnership where each party contributes agreed money and expertise for an agreed share of ownership and profit; often required or wise in emerging markets.'] },
      { term: 'Euromarket', cat: 'e', defs: ['The market for borrowing and lending currencies outside their country of origin; less regulated.'] },
      { term: 'Territorial tax system', cat: 'e', defs: ['Profits earned abroad are taxed only abroad, not again when brought home (US since 2017).'] },
      { term: 'Functional currency', cat: 't', defs: ['The currency in which a subsidiary mainly earns and spends cash and keeps its books.'] },
      { term: 'All-current-rate method', cat: 't', defs: ['Translate all balance sheet items at the closing rate and income statement items at the average rate; the adjustment goes to equity, not income.'] },
      { term: 'Temporal method', cat: 't', defs: ['Some assets and liabilities at historical rates; translation gains or losses go through current income. Used for integrated subsidiaries and in hyperinflation.'] },
      { term: 'Hyperinflation country', cat: 't', defs: ['A country with more than 100% cumulative inflation over three years.'] },
      { term: 'Spot exchange rate', cat: 'r', defs: ['The exchange rate for delivery today.'] },
      { term: 'Forward exchange rate', cat: 'r', defs: ['The rate agreed today for exchanging currencies on a future date.'] },
      { term: 'Direct quote', cat: 'r', defs: ['Units of foreign currency per one unit of domestic currency (book definition).'] },
      { term: 'Indirect quote', cat: 'r', defs: ['Units of domestic currency per one unit of foreign currency (book definition).'] },
      { term: 'Pegged (fixed) currency', cat: 'r', defs: ['A currency held at a fixed value against another currency or a basket; its changes are called revaluation/devaluation.'] },
      { term: 'Purchasing power parity', cat: 'r', defs: ['The law of one price: the same good costs the same everywhere in one currency, so higher-inflation currencies depreciate in the long run.'] },
      { term: 'Interest rate parity', cat: 'r', defs: ['The risk-free return is the same in every country once expressed in one currency (covered with a forward).'] },
      { term: 'Accounting exposure', cat: 'r', defs: ['The effect of exchange rate changes on the translated values in the financial statements.'] },
      { term: 'Economic exposure', cat: 'r', defs: ['The effect of exchange rate changes on the firm\'s value (the PV of its future foreign cash flows).'] },
      { term: 'Political risk', cat: 'r', defs: ['The risk that a host government\'s rules or actions (up to expropriation) hurt a foreign firm\'s cash flows.'] },
      { term: 'Macro political risk', cat: 'r', defs: ['Political change that hits ALL foreign firms in a country, e.g. a revolution.'] },
      { term: 'Micro political risk', cat: 'r', defs: ['Rules aimed at one firm, one industry or firms from one country.'] },
      { term: 'Foreign direct investment (FDI)', cat: 'e', defs: ['Transferring capital, management and technology to a foreign operation with equity and control, unlike portfolio investment.'] }
    ],
    groups: {
      'Ways to hedge currency risk': ['Forward contract', 'Money market hedge', 'Currency options'],
      'Translation methods': ['All-current-rate method', 'Temporal method'],
      'Paths of political risk': ['Macro political risk', 'Micro political risk', 'Global (terrorism, anti-globalisation, cyber)']
    },
    scenarios: [
      { q: ['After a revolution, the new government takes over the assets of ALL foreign companies in the country. Which type of political risk?'], a: 'Macro political risk', why: 'Macro = every foreign firm is hit. Micro = one firm, one industry, or firms from one particular country.' },
      { q: ['A government targets only firms from one particular country with special restrictions.'], a: 'Micro political risk' },
      { q: ['A government nationalises only the foreign-owned oil companies; other foreign firms are left alone.'], a: 'Micro political risk', why: 'One specific industry is targeted, so it is micro.' },
      { q: ['A Dutch firm\'s expected future dollar cash flows are worth less in euros after the dollar falls.'], a: 'Economic exposure' },
      { q: ['A subsidiary\'s balance sheet in euros changes only because the closing exchange rate moved.'], a: 'Accounting exposure' },
      { q: ['A subsidiary operates as an extension of the parent, buying and selling mostly in the parent\'s currency. Which translation method?'], a: 'Temporal method' },
      { q: ['A subsidiary runs independently and earns and spends its local currency. Which translation method?'], a: 'All-current-rate method' }
    ],
    tf: [
      { s: 'Under purchasing power parity, the currency of the country with the higher inflation rate is expected to depreciate.', t: true, why: 'Otherwise the same good would be cheaper in one country and arbitrage would follow.' },
      { s: 'Interest rate parity tends to hold more closely than purchasing power parity.', t: true, why: 'Money moves fast and cheaply; goods are slow and costly to ship.' },
      { s: 'Under the all-current-rate method, translation adjustments are charged directly to current income.', t: false, why: 'They go to a separate part of equity. Under the temporal method they go through income.' },
      { s: 'Collecting a higher interest rate abroad is risk-free for a home investor without a forward contract.', t: false, why: 'Without covering, the exchange rate can move before maturity.' },
      { s: 'A joint venture can reduce political risk in a developing country.', t: true, why: 'Local partners give the host government less reason to act against the firm.' },
      { s: 'Revaluation of a pegged currency means the same as appreciation of a floating one.', t: true, why: 'Devaluation ↔ depreciation.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
