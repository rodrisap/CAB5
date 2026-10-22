/* Finance Week 6 — extra material from Zutter & Smart Ch. 19.1–19.3 */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.ppp = function (S, iH, iF) { return S * (1 + iH) / (1 + iF); };
  FSM.calc.irp = function (S, rH, rF) { return S * (1 + rH) / (1 + rF); };
  var PAIRS = [['$', 'USD', '£', 'GBP', 1.1, 1.45], ['$', 'USD', '€', 'EUR', 1.0, 1.25], ['€', 'EUR', '£', 'GBP', 1.05, 1.25], ['$', 'USD', 'A$', 'AUD', 0.6, 0.8], ['€', 'EUR', 'CHF ', 'CHF', 0.9, 1.1]];
  var CTRY = { USD: 'the US', GBP: 'the UK', EUR: 'the euro area', AUD: 'Australia', CHF: 'Switzerland' };
  function cm(sym, v, dp) { return sym + F.num(v, dp == null ? 0 : dp); }



  FSM.addConcepts({
    id: 'fin_w6_book', topic: 'fin_w6', title: 'The international environment & risk',
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
