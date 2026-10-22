/* SCM — Langley Ch. 5: Sourcing materials and services */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.addTopic({ id: 'scm_ch5', area: 'Supply Chain', label: 'Ch. 5', title: 'Sourcing: strategic sourcing, quadrant, total landed cost', read: 'Langley et al. Ch. 5' });

  FSM.calc.tlc = function (price, transport, customs, vat) { var v = (price + transport + customs) * vat; return { vat: v, total: price + transport + customs + v }; };

  var ORIGINS = ['China', 'Vietnam', 'India', 'Turkey', 'Poland', 'Germany', 'Mexico', 'Morocco', 'Bangladesh', 'Italy'];
  var EU = ['Poland', 'Germany', 'Italy'];
  FSM.addSkill({
    id: 'scm_ch5_tlc', topic: 'scm_ch5', title: 'Total landed cost comparison',
    formula: 'TLC = purchase price + transport + customs/duties + VAT on (price + transport + customs)',
    build: function (r, c) {
      c.setCur('EUR');
      var dest = r.pick([['Switzerland', 0.076], ['the Netherlands', 0.21], ['Norway', 0.25], ['the UK', 0.2]]);
      var origins = r.sample(ORIGINS, 3);
      var vat = dest[1];
      var rows = origins.map(function (o) {
        var near = EU.indexOf(o) >= 0;
        var price = r.range(near ? 10 : 6, near ? 15 : 11, 0.5) * 1000;
        var tr = near ? r.range(0.8, 2, 0.1) * 1000 : r.range(3, 7, 0.5) * 1000;
        var cu = (near && dest[0] !== 'Switzerland' && dest[0] !== 'Norway' && dest[0] !== 'the UK') ? 0 : r.range(0.5, 2, 0.1) * 1000;
        if (near && dest[0] === 'the Netherlands') cu = 0;
        var x = FSM.calc.tlc(price, tr, cu, vat);
        return { o: o, price: price, tr: tr, cu: cu, vat: x.vat, total: x.total };
      });
      var best = rows.reduce(function (b, x, i) { return x.total < rows[b].total ? i : b; }, 0);
      var cheapPrice = rows.reduce(function (b, x, i) { return x.price < rows[b].price ? i : b; }, 0);
      var t = r.pick(rows);
      var C = c.C;
      var stmt = { title: 'Offers (in €)', cols: rows.map(function (x) { return x.o; }), rows: [
        { label: 'Net purchase price', v: rows.map(function (x) { return x.price; }) },
        { label: 'Transport to ' + dest[0], v: rows.map(function (x) { return x.tr; }) },
        { label: 'Customs / duties', v: rows.map(function (x) { return x.cu || 'n.a.'; }) }
      ] };
      return {
        intro: [c.company + ' in ' + dest[0] + ' compares three suppliers for the same volume of a product. VAT in ' + dest[0] + ' is ' + F.num(vat * 100, 1) + '%, charged on the value of the goods including transport and customs.'],
        statement: stmt, facts: [], layouts: ['statement'],
        parts: [
          { ask: ['What is the total landed cost of the offer from ' + t.o + '?', 'Calculate the total landed cost for ' + t.o + '.'], answer: t.total, unit: 'cur', dp: 0,
            traps: [{ v: t.price + t.tr + t.cu, why: 'Add VAT.' }, { v: t.price * (1 + vat) + t.tr + t.cu, why: 'VAT is charged on price + transport + customs, not only on the price.' }].filter(function (x) { return Math.abs(x.v - t.total) > 1; }),
            steps: [step('Price + transport + customs = ' + C(t.price) + ' + ' + C(t.tr) + ' + ' + C(t.cu), t.price + t.tr + t.cu, 'cur', 'offer table'), step('VAT = ' + F.num(vat * 100, 1) + '% × that', t.vat, 'cur', 'VAT rate'), step('Total landed cost', t.total, 'cur', 'sum')],
            method: ['Take the net purchase price', 'Add transport costs', 'Add customs/duties (if no trade agreement)', 'Add VAT on the total so far'] },
          { kind: 'choice', ask: ['Which supplier has the lowest total landed cost?'], choices: [rows[best].o].concat(rows.filter(function (_, i) { return i !== best; }).map(function (x) { return x.o; })), correctChoice: 0,
            why: rows.map(function (x) { return x.o + ': ' + C(x.total); }).join(' · ') + (best !== cheapPrice ? '. Note: the lowest purchase price (' + rows[cheapPrice].o + ') is NOT the cheapest once landed.' : '') }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'scm_ch5_sourcing', topic: 'scm_ch5', title: 'Purchasing, procurement, strategic sourcing & quadrant',
    items: [
      { term: 'Purchasing', cat: 'p', defs: ['The largely transactional activity of buying goods and services according to the firm\'s procedures.'] },
      { term: 'Procurement', cat: 'p', defs: ['The process of managing a broad range of buying activities: supplier selection, price negotiation, contract and supplier performance management.'] },
      { term: 'Strategic sourcing', cat: 'p', defs: ['Managing procurement priorities so they align with the goals of the supply chain and the whole organisation.'] },
      { term: 'Generics', cat: 'q', defs: ['Quadrant: low value and low risk items (e.g. office supplies) — manage with minimal effort.'] },
      { term: 'Commodities', cat: 'q', defs: ['Quadrant: high value/profit potential but low risk, with many suppliers (e.g. packaging, standard parts) — leverage buying power.'] },
      { term: 'Distinctives', cat: 'q', defs: ['Quadrant: high risk but lower value — items that are hard to get or specialised, so supply must be secured.'] },
      { term: 'Criticals', cat: 'q', defs: ['Quadrant: high value and high risk — key items that need strategic, close supplier relationships.'] },
      { term: 'Total landed cost', cat: 'c', defs: ['All costs of getting a product to its destination: purchase price, transport, duties/customs, taxes and other costs — not just the price.'] },
      { term: 'Spend analysis', cat: 'c', defs: ['Analysing spending by supplier, category and internal user to find improvement opportunities (step 2 of strategic sourcing).'] },
      { term: 'Total cost of ownership', cat: 'c', defs: ['Looking beyond the purchase price to all costs and value over the life of the purchase — part of “assess total value”.'] },
      { term: 'Online marketplace', cat: 'e', defs: ['An e-commerce site where multiple third parties offer products while the operator processes transactions (e.g. Amazon, Expedia, Uber).'] },
      { term: 'Online trading community', cat: 'e', defs: ['A system run by a third-party tech provider giving buyers and sellers a structured way to trade, barter or sell (e.g. eBay, Craigslist).'] },
      { term: 'Sell-side vs buy-side system', cat: 'e', defs: ['Whether an e-commerce capability is seller-centric or buyer-centric.'] },
      { term: 'E-procurement', cat: 'e', defs: ['Using electronic tools for sourcing and buying: supplier search, RFI/RFP, online negotiation, contract management.'] }
    ],
    groups: {
      'Five core principles of strategic sourcing': ['Assess total value', 'Develop individual sourcing strategies', 'Evaluate internal requirements', 'Focus on supplier economics', 'Drive continuous improvement'],
      'Advantages of e-procurement': ['Lower operating costs', 'Improved sourcing efficiency', 'Lower procurement prices', 'Better communication', 'Access to more suppliers'],
      'Concerns about e-procurement': ['Cyber-security', 'No face-to-face contact', 'Technology issues (standards, reliability, investment)'],
      'Quadrant categories': ['Generics', 'Commodities', 'Distinctives', 'Criticals']
    },
    sequences: [{ title: 'The strategic sourcing process', steps: ['Develop strategic plan', 'Understand spend', 'Evaluate supply sources', 'Finalize sourcing strategy', 'Implement sourcing strategy', 'Onboarding and transitioning', 'Collaborative process improvement'] }],
    scenarios: [
      { q: ['A car maker buys a custom engine-control chip from a single qualified supplier; it is expensive and a shortage would stop production. Which quadrant?', 'High-value item with high supply risk — which quadrant?'], a: 'Criticals' },
      { q: ['Paper clips and printer paper. Which quadrant?'], a: 'Generics' },
      { q: ['Standard corrugated boxes bought in huge volumes from many possible suppliers. Which quadrant?'], a: 'Commodities' },
      { q: ['A special low-value spare part only one small firm makes. Which quadrant?'], a: 'Distinctives' },
      { q: ['A clerk places an order for 200 pallets using an approved catalogue. Which term fits best?'], a: 'Purchasing' },
      { q: ['The company aligns its supplier choices with its sustainability strategy and long-term goals. Which term?'], a: 'Strategic sourcing' },
      { q: ['A supplier from Vietnam is cheapest per unit, but after freight, duties and VAT a European supplier is cheaper. Which concept shows this?'], a: 'Total landed cost' }
    ],
    tf: [
      { s: 'Purchasing is a process, while procurement is a single activity.', t: false, why: 'Purchasing = activity; procurement and strategic sourcing = processes.' },
      { s: 'Strategic sourcing emphasises value beyond the purchase price.', t: true, why: 'Assess total value/total cost of ownership.' },
      { s: 'In the quadrant technique, all purchased items should be managed with the same strategy.', t: false, why: 'Strategy depends on value and risk.' },
      { s: 'Amazon can be an example of both B2C and an online marketplace.', t: true, why: 'The slides list it in both categories.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
