/* SCM Ch. 9 — EOQ, reorder point, safety stock (Langley) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.eoq = function (R, A, V, W) { var Q = Math.sqrt(2 * R * A / (V * W)); return { Q: Q, orders: R / Q, order: A * R / Q, carry: Q / 2 * V * W, tac: A * R / Q + Q / 2 * V * W }; };
  FSM.calc.safety = function (Rc, sR, S, sS) { return Math.sqrt(Rc * sS * sS + S * S * sR * sR); };

  FSM.addSkill({
    id: 'scm_ch9_eoq', topic: 'scm_ch9', title: 'EOQ, total annual cost & reorder point',
    formula: 'EOQ = √(2RA / VW); TAC = A·R/Q + ½Q·V·W; ROP = lead time × daily demand',
    build: function (r, c) {
      var C = c.C, R, A = r.range(50, 400, 10), V = r.range(5, 200, 1), W = r.range(15, 35, 1) / 100, Q;
      do { R = r.range(1200, 60000, 100); Q = Math.sqrt(2 * R * A / (V * W)); } while (Q > R / 2 || Q < 20);
      var x = FSM.calc.eoq(R, A, V, W), days = r.pick([250, 360, 365]), lt = r.int(3, 21), d = R / days, rop = lt * d;
      var alt = h.r0(x.Q * r.pick([0.5, 0.7, 1.5, 2]) / 10) * 10, altTac = A * R / alt + alt / 2 * V * W;
      var fmtW = F.num(W * 100) + '%';
      return {
        intro: [c.company + ' sells an item with steady demand.'],
        facts: [h.fact('Annual demand', R, 'num', 'Annual demand is ' + F.num(R) + ' units.'), h.fact('Order cost', A, 'cur', 'Each order costs ' + C(A) + ' to place.'), h.fact('Unit value', V, 'cur', 'The item is valued at ' + C(V) + ' per unit.'), h.fact('Carrying cost', W, 'pct', 'Annual inventory carrying cost is ' + fmtW + ' of value.', { dp: 0 }), h.fact('Lead time', lt, 'days', 'A new order takes ' + lt + ' days to arrive; the firm works ' + days + ' days a year.')],
        noise: [h.fact('Warehouse size', r.range(2, 20, 1) * 1000, 'num', 'The warehouse has ' + F.num(r.range(2, 20, 1) * 1000) + ' m² of floor space.')],
        parts: [
          { ask: ['What is the economic order quantity?', 'How many units should be ordered each time to minimise total cost?'], answer: x.Q, unit: 'num', dp: 0, traps: [{ v: Math.sqrt(R * A / (V * W)), why: 'Don\'t forget the 2 in √(2RA/VW).' }, { v: Math.sqrt(2 * R * A / V), why: 'Carrying cost per unit is V × W, not V.' }],
            steps: [step('Carrying cost per unit per year = ' + C(V) + ' × ' + fmtW, V * W, 'cur', 'V × W', 2), step('EOQ = √(2 × ' + F.num(R) + ' × ' + C(A) + ' / ' + C(V * W, 2) + ')', x.Q, 'num', 'EOQ', 0)] },
          { ask: ['What is the total annual cost (ordering + carrying) at the EOQ?'], answer: x.tac, unit: 'cur', dp: 0, traps: [{ v: x.order, why: 'Add the carrying cost; at the EOQ the two are equal.' }, { v: A * R / x.Q + x.Q * V * W, why: 'Average inventory is Q/2.' }],
            steps: [step('Ordering cost = A × R / Q', x.order, 'cur', 'orders × cost'), step('Carrying cost = ½ × Q × V × W', x.carry, 'cur', 'average inventory × V × W'), step('TAC', x.tac, 'cur', 'sum')] },
          { ask: ['If the firm orders ' + F.num(alt) + ' units instead, how much more does it pay per year than at the EOQ?'], answer: altTac - x.tac, unit: 'cur', dp: 0, traps: [{ v: altTac, why: 'Asked for the DIFFERENCE with TAC at the EOQ.' }],
            steps: [step('TAC(' + F.num(alt) + ') = ' + C(A) + ' × ' + F.num(R) + '/' + F.num(alt) + ' + ½ × ' + F.num(alt) + ' × ' + C(V * W, 2), altTac, 'cur', 'formula'), step('Difference', altTac - x.tac, 'cur', 'vs EOQ')] },
          { ask: ['What is the reorder point (no safety stock)?'], answer: rop, unit: 'num', dp: 0, traps: [{ v: x.Q, why: 'The reorder point is WHEN to order (demand during lead time), not how much.' }, { v: R / 365 * lt, why: 'Use ' + days + ' working days.' }].filter(function (t) { return Math.abs(t.v - rop) > 0.5; }),
            steps: [step('Daily demand = ' + F.num(R) + ' / ' + days, d, 'num', 'per day', 2), step('ROP = ' + lt + ' days × daily demand', rop, 'num', 'lead-time demand', 0)] }
        ]
      };
    }
  });

  FSM.addSkill({
    id: 'scm_ch9_safety', topic: 'scm_ch9', title: 'Safety stock with uncertain demand and lead time',
    formula: 'σ_c = √(R·σ_S² + S²·σ_R²)  (R = avg lead time, S = avg daily demand)',
    build: function (r, c) {
      var Rc = r.int(4, 20), sR = r.range(0.5, 3, 0.1), S = r.range(100, 3000, 5), sS = h.r0(S * r.range(0.1, 0.35, 0.01)), k = r.pick([[1, '84%'], [1.65, '95%'], [2, '97.7%'], [2.33, '99%']]);
      var sc = FSM.calc.safety(Rc, sR, S, sS), ss = sc * k[0];
      return {
        intro: [c.company + '\'s daily demand for a part averages ' + F.num(S) + ' units with a standard deviation of ' + F.num(sS) + ' units. The replenishment cycle averages ' + Rc + ' days with a standard deviation of ' + F.num(sR, 1) + ' days. Both are normally distributed.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is the combined standard deviation of demand during the replenishment cycle (σ_c)?'], answer: sc, unit: 'num', dp: 0, traps: [{ v: Math.sqrt(Rc * sS * sS + S * sR * sR), why: 'S is squared in the second term: S² × σ_R².' }, { v: sS * Rc + S * sR, why: 'Add variances, then take the square root.' }],
            steps: [step('R × σ_S² = ' + Rc + ' × ' + F.num(sS) + '²', Rc * sS * sS, 'num', 'demand uncertainty'), step('S² × σ_R² = ' + F.num(S) + '² × ' + F.num(sR, 1) + '²', S * S * sR * sR, 'num', 'lead-time uncertainty'), step('σ_c = √(sum)', sc, 'num', 'formula 9.1', 0)] },
          { ask: ['How much safety stock gives a ' + k[1] + ' service level (z = ' + k[0] + ')?'], answer: ss, unit: 'num', dp: 0, traps: [{ v: sc, why: 'One σ only covers about 84%. Multiply by z.' }],
            steps: [step('Safety stock = ' + k[0] + ' × σ_c', ss, 'num', 'z × σ_c', 0)] },
          { kind: 'choice', ask: ['What happens to safety stock as the required service level approaches 100%?'], choices: ['It rises at an increasing rate', 'It rises linearly', 'It falls', 'It stays the same'], correctChoice: 0, why: 'Each extra percent of service costs more stock; 100% is never reached statistically.' }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'scm_ch9_book', topic: 'scm_ch9', title: 'Book: EOQ logic & inventory control',
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
      { s: 'At the EOQ, annual ordering cost equals annual carrying cost.', t: true, why: 'In the book example (Q = 240) both are $3,000.' },
      { s: 'The total-cost curve is flat near the EOQ, so ordering a bit more or less costs little extra.', t: true, why: 'Langley stresses the shallow curve between roughly 180 and 320 units.' },
      { s: 'The simple EOQ model allows quantity discounts and uncertain lead times.', t: false, why: 'It assumes constant known demand and lead time, a constant price, no in-transit stock, one item, an infinite horizon and unlimited capital.' },
      { s: 'In the fixed order quantity model the quantity is fixed and the time between orders varies.', t: true, why: 'In the fixed interval model, time is fixed and the quantity varies.' },
      { s: 'If demand rises 4×, the EOQ also rises 4×.', t: false, why: 'EOQ grows with the square root: 4× demand → 2× EOQ.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
