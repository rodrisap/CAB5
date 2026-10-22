/* SCM Ch. 1–2 — extra book material (Langley) */
(function (root) {
  var FSM = root.FSM;
  FSM.addConcepts({
    id: 'scm_ch1_book', topic: 'scm_ch1', title: 'Book: evolution, value chain & the financial link',
    items: [
      { term: 'Physical distribution (1960s)', cat: 'e', defs: ['The first phase: managing the OUTBOUND side (transport, warehousing, packaging, finished goods) as one system at lowest total cost.'] },
      { term: 'Integrated logistics (1980s)', cat: 'e', defs: ['The second phase: inbound and outbound logistics coordinated together, helped by transport deregulation (fewer empty backhauls).'] },
      { term: 'Supply chain management (1990s+)', cat: 'e', defs: ['The third phase: an extended enterprise managing product, information, cash and demand flows with partners.'] },
      { term: 'Value chain (Porter)', cat: 'e', defs: ['Porter\'s model in which inbound and outbound logistics are PRIMARY activities that create customer value.'] },
      { term: 'Total cost (systems) concept', cat: 'e', defs: ['Judge a decision such as the transport mode by its effect on the cost of the whole system, not one cost centre.'] },
      { term: 'Extended enterprise', cat: 'e', defs: ['Viewing the supply chain as one enterprise across company boundaries, managed collaboratively.'] },
      { term: 'Disruptive innovation', cat: 'e', defs: ['A change that reshapes a whole sector, e.g. Amazon in retail.'] }
    ],
    tf: [
      { s: 'Supply chains affect cash flow through cost, revenue and asset (working capital) requirements: inventory, receivables and cash.', t: true, why: 'This is the bridge with the finance part: a shorter cash conversion cycle frees cash.' },
      { s: 'The GMA grocery study estimated $30bn of savings a year from cutting inventory from 104 to 61 days.', t: true, why: 'One of the two studies that gave SCM traction in the 1990s.' },
      { s: 'Best-in-class firms spent about 7% of sales on supply chain costs vs 13.1% for the median firm.', t: true, why: 'Supply Chain Council comparison.' },
      { s: 'Technology should be introduced first; processes and employee training can follow.', t: false, why: 'Langley: technology should FOLLOW process change and employee education.' },
      { s: 'Integrated logistics added inbound logistics to physical distribution.', t: true, why: 'Physical distribution was outbound only.' }
    ],
    sequences: [
      { title: 'Evolution towards supply chain management', steps: ['Activity fragmentation (before 1960)', 'Physical distribution', 'Integrated logistics', 'Supply chain management'] }
    ]
  });
  FSM.addConcepts({
    id: 'scm_ch2_book', topic: 'scm_ch2', title: 'Book: global trade flows',
    items: [
      { term: 'BRIC countries', cat: 'g', defs: ['Brazil, Russia, India, China: the leading emerging economies of the early 2000s.'] },
      { term: 'VISTA countries', cat: 'g', defs: ['Vietnam, Indonesia, South Africa, Turkey, Argentina: fast-developing economies whose future role is less clear.'] },
      { term: 'Net exporter', cat: 'g', defs: ['A country that exports more merchandise than it imports (e.g. China, Germany).'] },
      { term: 'Net importer', cat: 'g', defs: ['A country that imports more merchandise than it exports (e.g. the United States).'] },
      { term: 'Balance of payments', cat: 'g', defs: ['All flows between a country and the rest of the world, including financial flows, not just merchandise trade.'] }
    ],
    tf: [
      { s: 'The EU (as one bloc) is the largest exporter; China is the largest single exporting country.', t: true, why: 'The US exports about 30% less than China, followed closely by Germany.' },
      { s: 'Merchandise trade data are the same thing as the balance of payments.', t: false, why: 'The balance of payments also includes financial flows.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
