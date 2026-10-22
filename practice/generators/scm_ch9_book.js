/* SCM Ch. 9 — EOQ, reorder point, safety stock (Langley) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.eoq = function (R, A, V, W) { var Q = Math.sqrt(2 * R * A / (V * W)); return { Q: Q, orders: R / Q, order: A * R / Q, carry: Q / 2 * V * W, tac: A * R / Q + Q / 2 * V * W }; };
  FSM.calc.safety = function (Rc, sR, S, sS) { return Math.sqrt(Rc * sS * sS + S * S * sR * sR); };



  FSM.addConcepts({
    id: 'scm_ch9_book', topic: 'scm_ch9', title: 'Order quantity logic & inventory control',
    items: [
      { term: 'Economic order quantity (EOQ)', cat: 'q', defs: ['The order size that minimises the sum of annual ordering cost and carrying cost.'] },
      { term: 'Reorder point', cat: 'q', defs: ['The stock level that triggers a new order: lead-time demand (plus any safety stock).'] },
      { term: 'Two-bin system', cat: 'q', defs: ['Another name for the fixed order quantity model: when the first bin is empty, reorder; the second bin covers the lead time.'] },
      { term: 'Perpetual inventory system', cat: 'q', defs: ['Stock is monitored continuously so an order goes out as soon as the reorder point is reached.'] },
      { term: 'Positive tradeoff', cat: 'q', defs: ['When a bigger order saves more in ordering cost than it adds in carrying cost, so total cost falls.'] },
      { term: 'Replenishment time', cat: 'q', defs: ['Order transmittal + order processing + order preparation + delivery.'] },
      { term: 'In-transit inventory carrying cost', cat: 'q', defs: ['The cost of owning goods while they move; slower, cheaper modes raise it, so mode choice trades rate against transit time.'] },
      { term: 'Service level', cat: 'q', defs: ['The share of demand (or cycles) met from stock; higher service needs disproportionately more safety stock.'] }
    ],
    groups: { 'Parts of replenishment (lead) time': ['Order transmittal', 'Order processing', 'Order preparation', 'Order delivery'] },
    scenarios: [
      { q: ['A firm checks stock all the time and orders the same 500 units whenever stock drops to 120.'], a: 'Reorder point', opts: ['Fixed order interval model', 'Economic order quantity (EOQ)', 'Service level'], why: '120 is the trigger level (the reorder point); 500 would be the fixed quantity.' },
      { q: ['Doubling the order size cuts ordering costs by €3,000 but raises carrying cost by €1,200.'], a: 'Positive tradeoff' }
    ],
    tf: [
      { s: 'At the EOQ, annual ordering cost equals annual carrying cost.', t: true, why: 'That is exactly where total cost is lowest.' },
      { s: 'The total-cost curve is flat near the EOQ, so ordering a bit more or less costs little extra.', t: true, why: 'Near the optimum the two costs almost offset each other.' },
      { s: 'The simple EOQ model allows quantity discounts and uncertain lead times.', t: false, why: 'It assumes constant known demand and lead time, a constant price, no in-transit stock, one item, an infinite horizon and unlimited capital.' },
      { s: 'In the fixed order quantity model the quantity is fixed and the time between orders varies.', t: true, why: 'In the fixed interval model, time is fixed and the quantity varies.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
