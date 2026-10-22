/* SCM Ch. 5 — extra book material (Langley) */
(function (root) {
  var FSM = root.FSM;
  FSM.addConcepts({
    id: 'scm_ch5_book', topic: 'scm_ch5', title: 'Types of buys, supplier selection & quality programmes',
    items: [
      { term: 'Capital goods purchase', cat: 'b', defs: ['A long-term investment buy (e.g. equipment) that needs financial planning.'] },
      { term: 'Standard rebuy', cat: 'b', defs: ['A repeat purchase identical to earlier ones.'] },
      { term: 'Modified rebuy', cat: 'b', defs: ['A repeat purchase with some change from earlier ones (spec, supplier, quantity).'] },
      { term: 'MRO items', cat: 'b', defs: ['Maintenance, repair and operating supplies needed to keep the company running.'] },
      { term: 'Request for information (RFI)', cat: 's', defs: ['An early-stage request asking possible suppliers for general information about their capabilities.'] },
      { term: 'Request for proposal (RFP)', cat: 's', defs: ['A formal request for detailed offers (price, service, terms) from pre-qualified suppliers.'] },
      { term: 'Total Quality Management (TQM)', cat: 'q', defs: ['A company-wide focus on reducing process variability and continuous improvement, using statistical process control and employee involvement.'] },
      { term: 'Six Sigma', cat: 'q', defs: ['A statistical problem-solving approach run by trained experts (green and black belts) who also teach others.'] },
      { term: 'ISO 9000', cat: 'q', defs: ['Third-party certification that a firm follows documented standard processes: "document what you do and do what you document".'] },
      { term: 'Lean', cat: 'q', defs: ['A commitment to eliminating waste and improving efficiency based on what customers value.'] },
      { term: 'Reverse auction', cat: 'e', defs: ['Online bidding in which suppliers bid prices DOWN to win a buyer\'s business.'] },
      { term: 'Bid optimization', cat: 'e', defs: ['Software that evaluates many suppliers\' bids (e.g. transport lanes) together to find the best-cost award, including combinations and constraints.'] }
    ],
    groups: {
      'Three types of buys': ['Capital goods purchase', 'Standard rebuy', 'Modified rebuy', 'MRO items'],
      'Quality programmes suppliers may hold': ['Total Quality Management (TQM)', 'Six Sigma', 'ISO 9000', 'Lean'],
      'Supplier selection criteria': ['Quality', 'Reliability', 'Risk', 'Capability', 'Financial', 'Desirable qualities', 'Sustainability']
    },
    scenarios: [
      { q: ['A factory reorders exactly the same lubricant from the same supplier every month.'], a: 'Standard rebuy' },
      { q: ['A firm reorders packaging but switches to a recycled material this time.'], a: 'Modified rebuy' },
      { q: ['A supplier must prove that an outside registrar has certified it follows documented processes.'], a: 'ISO 9000' },
      { q: ['Five carriers compete live online, each lowering its price to win a lane.'], a: 'Reverse auction' },
      { q: ['The buyer sends a detailed request for prices, service levels and contract terms to three pre-qualified suppliers.'], a: 'Request for proposal (RFP)' }
    ],
    tf: [
      { s: 'Quality is usually the most important supplier selection factor.', t: true, why: 'Followed by reliability (on-time delivery) and others.' },
      { s: 'Supplier evaluation should be informal and only happen when there are problems.', t: false, why: 'It should be regular and formal: were needs met, what can improve, did both sides\' investments pay off?' }
    ],
    sequences: [
      { title: 'Supplier portfolio screening (funnel)', steps: ['Initial supplier research and screening', 'Request for information (RFI)', 'Request for proposal (RFP)', 'Supplier selection', 'Supplier site visits'] }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
