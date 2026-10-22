/* SCM — Langley Ch. 9: Managing inventory in the supply chain */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.addTopic({ id: 'scm_ch9', area: 'Supply Chain', label: 'Ch. 9', title: 'Inventory: types, costs, EOQ/JIT/MRP/DRP/VMI, ABC', read: 'Langley et al. Ch. 9' });

  /* ABC classification by annual value */
  FSM.addSkill({
    id: 'scm_ch9_abc', topic: 'scm_ch9', title: 'ABC classification (Pareto)',
    formula: 'Rank items by annual value; A = top ~80% of value, B = next ~15%, C = rest',
    build: function (r, c) {
      c.setCur('EUR');
      var names = r.sample(['Bike frames', 'Brake sets', 'E-bike batteries', 'Helmets', 'Inner tubes', 'Water bottles', 'Saddles', 'Chains', 'Pedals', 'Gloves', 'Lights', 'Locks'], 8);
      var items = names.map(function (n, i) {
        var big = i < 2;
        return { n: n, q: big ? r.range(200, 900, 10) : r.range(500, 6000, 50), p: big ? r.range(150, 600, 5) : r.range(2, 25, 0.5) };
      });
      items.forEach(function (x) { x.v = x.q * x.p; });
      var tot = items.reduce(function (s, x) { return s + x.v; }, 0);
      var sorted = items.slice().sort(function (a, b) { return b.v - a.v; });
      var cum = 0;
      sorted.forEach(function (x) { cum += x.v; x.cum = cum / tot; });
      var top = sorted[0];
      var top2share = (sorted[0].v + sorted[1].v) / tot;
      var target = r.pick(items);
      var C = c.C;
      return {
        intro: [c.company + ' wants to classify its inventory with ABC analysis. Annual usage and unit cost:'],
        statement: { title: 'Item', cols: ['Annual units', 'Unit cost', 'Annual value'], rows: r.shuffle(items).map(function (x) { return { label: x.n, v: [F.num(x.q), C(x.p, x.p % 1 ? 2 : 0), ''] }; }) },
        facts: [], layouts: ['statement'],
        parts: [
          { ask: ['What is the annual value of “' + target.n + '”?'], answer: target.v, unit: 'cur', traps: [{ v: target.q + target.p, why: 'Multiply units by unit cost.' }], steps: [step(F.num(target.q) + ' × ' + C(target.p, 2), target.v, 'cur', 'units × unit cost')] },
          { ask: ['Which share of total inventory value do the two most valuable items represent?'], answer: top2share, unit: 'pct', dp: 1, traps: [{ v: 2 / items.length, why: 'Share of VALUE, not share of the number of items.' }],
            steps: items.map(function (x) { return step(x.n + ': ' + F.num(x.q) + ' × ' + C(x.p, 2), x.v, 'cur', 'annual value'); }).concat([step('Total value', tot, 'cur', 'sum'), step('Top two (' + sorted[0].n + ', ' + sorted[1].n + ') / total', top2share, 'pct', 'Pareto check', 1)]) },
          { kind: 'choice', ask: ['Which item should be an “A” item?'], choices: [top.n].concat(sorted.slice(-3).map(function (x) { return x.n; })), correctChoice: 0, why: 'A items are the few with the largest annual value. But B and C items still need their own strategy — they are not unimportant.' }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'scm_ch9_types', topic: 'scm_ch9', title: 'Inventory types, reasons & costs',
    items: [
      { term: 'Cycle stock', cat: 'type', defs: ['Inventory from ordering in batches to get purchase, production or transport economies of scale.'] },
      { term: 'Safety stock', cat: 'type', defs: ['Buffer inventory held because of uncertainty in demand or supply/lead time.'] },
      { term: 'In-transit (pipeline) inventory', cat: 'type', defs: ['Goods in motion during transport; its cost matters most on long global moves.'] },
      { term: 'Work-in-process inventory', cat: 'type', defs: ['Goods in process during manufacturing or assembly of a complex product.'] },
      { term: 'Seasonal stock', cat: 'type', defs: ['Inventory built up because supply or demand is seasonal (e.g. harvests, holiday sales).'] },
      { term: 'Anticipatory stock', cat: 'type', defs: ['Inventory held in anticipation of an unusual event such as a strike, a price increase or extreme weather.'] },
      { term: 'Inventory carrying cost', cat: 'cost', defs: ['Costs of holding inventory at rest: capital cost, storage space, inventory service and inventory risk costs.'] },
      { term: 'Ordering and setup cost', cat: 'cost', defs: ['The cost of placing an order (excluding the product) or of changing a production line over.'] },
      { term: 'Expected stockout cost', cat: 'cost', defs: ['The cost of not having a product available when needed — lost sales, back orders.'] },
      { term: 'Capital cost', cat: 'carry', defs: ['The part of carrying cost representing the money tied up in inventory (opportunity cost).'] },
      { term: 'Inventory risk cost', cat: 'carry', defs: ['The part of carrying cost for obsolescence, damage, shrinkage (theft) and relocation.'] },
      { term: 'Inventory service cost', cat: 'carry', defs: ['The part of carrying cost for insurance and taxes on inventory.'] },
      { term: 'Storage space cost', cat: 'carry', defs: ['The part of carrying cost for warehouse space used by the inventory.'] }
    ],
    groups: {
      'Four components of carrying cost': ['Capital cost', 'Storage space cost', 'Inventory service cost', 'Inventory risk cost'],
      'Major inventory cost types': ['Inventory carrying cost', 'Ordering and setup cost', 'Expected stockout cost', 'In-transit inventory carrying cost'],
      'Types of inventory': ['Cycle stock', 'Safety stock', 'In-transit inventory', 'Work-in-process', 'Seasonal stock', 'Anticipatory stock']
    },
    scenarios: [
      { q: ['A retailer buys extra stock because a supplier announced a 10% price increase next month. Which inventory type?'], a: 'Anticipatory stock' },
      { q: ['A distributor keeps 2 weeks of extra stock because supplier lead times vary a lot. Which type?'], a: 'Safety stock' },
      { q: ['Containers of shoes on a ship from Vietnam to Rotterdam. Which type?'], a: 'In-transit (pipeline) inventory' },
      { q: ['A company orders a full truckload every month to get a freight discount. The resulting stock is…'], a: 'Cycle stock' },
      { q: ['A toy maker builds up stock from June to sell in December. Which type?'], a: 'Seasonal stock' },
      { q: ['Obsolete phones and stolen goods are part of which carrying-cost component?'], a: 'Inventory risk cost' },
      { q: ['Insurance premiums and taxes on stock belong to which carrying-cost component?'], a: 'Inventory service cost' }
    ],
    tf: [
      { s: 'Finance usually prefers low inventories, while marketing prefers enough or extra inventory.', t: true, why: 'Finance wants turns and cash; marketing wants availability.' },
      { s: 'Manufacturing typically favours short production runs with frequent changeovers.', t: false, why: 'Manufacturing favours long runs to lower unit costs.' },
      { s: 'Ordering cost and carrying cost react in the same direction when the order size increases.', t: false, why: 'Bigger orders: fewer orders (ordering cost ↓) but more stock (carrying cost ↑).' },
      { s: 'A higher service level requires more safety stock.', t: true, why: 'Fewer stockouts need a bigger buffer.' },
      { s: 'Inventory cost analysis should focus on the variable components of costs.', t: true, why: 'Only costs that change with decisions matter.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch9_approaches', topic: 'scm_ch9', title: 'EOQ, JIT, MRP, DRP, VMI & classification',
    items: [
      { term: 'Fixed order quantity model', cat: 'a', defs: ['Ordering the same amount every time stock reaches the reorder point (two-bin model).'] },
      { term: 'Fixed order interval model', cat: 'a', defs: ['Ordering at regular time intervals; the amount depends on stock on hand at review (fixed review period).'] },
      { term: 'Just-in-time (JIT)', cat: 'a', defs: ['A pull approach with short, reliable lead times, small frequent deliveries, minimal inventory and close supplier partnerships.'] },
      { term: 'Materials requirements planning (MRP)', cat: 'a', defs: ['A push, system-wide approach that translates the master production schedule into time-phased requirements for dependent-demand components.'] },
      { term: 'Distribution requirements planning (DRP)', cat: 'a', defs: ['The outbound counterpart of MRP: plans replenishment from plants to distribution centres for independent-demand items.'] },
      { term: 'Vendor-managed inventory (VMI)', cat: 'a', defs: ['The supplier monitors and replenishes the stock of its products in the customer\'s distribution centre.'] },
      { term: 'Independent demand', cat: 'k', defs: ['Demand that is not related to the demand for other items, e.g. finished goods sold to customers.'] },
      { term: 'Dependent demand', cat: 'k', defs: ['Demand derived from the demand for another item, e.g. wheels needed for bikes being built.'] },
      { term: 'Pull system', cat: 'k', defs: ['Customer orders drive product movement through the logistics system.'] },
      { term: 'Push system', cat: 'k', defs: ['Inventory is moved in anticipation of demand using replenishment plans.'] },
      { term: 'ABC analysis', cat: 'c', defs: ['Classifying items into A, B and C groups by their relative value/impact so each gets an appropriate strategy.'] },
      { term: 'Pareto\'s law (80–20 rule)', cat: 'c', defs: ['A small percentage of items often accounts for a large percentage of value or impact.'] },
      { term: 'Quadrant model (inventory)', cat: 'c', defs: ['Classifying finished goods by value (profit contribution) and risk (impact of being out of stock); critical items get the most attention.'] },
      { term: 'Reorder point', cat: 'k', defs: ['The stock level that triggers a new order in the fixed order quantity model; depends on demand during lead time (plus safety stock).'] }
    ],
    groups: {
      'Simple EOQ assumptions': ['Constant, known demand', 'Constant, known lead time', 'All demand is satisfied', 'Price independent of order quantity', 'No inventory in transit', 'One item / no interaction between items', 'Infinite planning horizon', 'Unlimited capital'],
      'JIT attitudes (vs EOQ)': ['Inventory is a liability', 'No safety stock', 'Short production runs', 'Minimise setup times', 'Single supply sources', 'Suppliers as partners']
    },
    scenarios: [
      { q: ['A bike factory calculates exactly how many wheels, chains and frames it needs each week from its production plan. Which approach?'], a: 'Materials requirements planning (MRP)' },
      { q: ['A supermarket\'s supplier sees the stock in the supermarket\'s DC in real time and ships when it hits an agreed reorder point. Which approach?'], a: 'Vendor-managed inventory (VMI)' },
      { q: ['A manufacturer plans weekly shipments from its plant to its regional DCs based on DC forecasts. Which approach?'], a: 'Distribution requirements planning (DRP)' },
      { q: ['Toyota receives parts several times a day in small batches from nearby partner suppliers with almost no stock. Which approach?'], a: 'Just-in-time (JIT)' },
      { q: ['Tyres needed for cars on an assembly line have which type of demand?'], a: 'Dependent demand' },
      { q: ['A shop checks stock every Monday and orders whatever is needed to fill up to a target level. Which model?'], a: 'Fixed order interval model' },
      { q: ['10% of a firm\'s SKUs make up 75% of its inventory value. Which principle?'], a: 'Pareto\'s law (80–20 rule)' }
    ],
    tf: [
      { s: 'In JIT, the reliability of the lead time matters more than its length.', t: true, why: 'Consistent lead times are the priority.' },
      { s: 'In ABC analysis, C items can be ignored because they are unimportant.', t: false, why: 'All categories matter; each needs its own strategy.' },
      { s: 'A risk of VMI is that suppliers push excess stock into the customer\'s DC to meet sales targets.', t: true, why: 'Principal shortcoming from the slides.' },
      { s: 'MRP systems are very sensitive to short-term fluctuations in demand.', t: false, why: 'They are less sensitive than order-point approaches.' },
      { s: 'The simple EOQ model considers only ordering costs and carrying costs.', t: true, why: 'Under certainty these are the two relevant costs.' },
      { s: 'JIT is a pull approach for dependent demand at a single facility.', t: true, why: 'From the comparison table: JIT = dependent, pull, single facility.' },
      { s: 'MRP and DRP are both push, system-wide approaches.', t: true, why: 'MRP: dependent demand; DRP: independent demand; both push and system-wide.' },
      { s: 'VMI is a pull approach.', t: false, why: 'VMI is push (both demand types, both system-wide and single facility).' },
      { s: 'EOQ is a system-wide approach.', t: false, why: 'EOQ is a single-facility approach (both demand types, both push and pull).' },
      { s: 'DRP deals with dependent demand.', t: false, why: 'DRP handles independent demand (finished goods to DCs); MRP handles dependent demand.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
