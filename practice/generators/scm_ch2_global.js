/* SCM — Langley Ch. 2: Global dimensions of supply chains */
(function (root) {
  var FSM = root.FSM;
  FSM.addTopic({ id: 'scm_ch2', area: 'Supply Chain', label: 'Ch. 2', title: 'Global dimensions of supply chains', read: 'Langley et al. Ch. 2' });

  FSM.addConcepts({
    id: 'scm_ch2_global', topic: 'scm_ch2', title: 'Global trade, strategy, security & FTAs',
    items: [
      { term: 'Absolute advantage', cat: 'trade', defs: ['A country can supply something at lower cost, or has access to items not available elsewhere.'] },
      { term: 'Comparative advantage', cat: 'trade', defs: ['Countries specialise in what they produce relatively most efficiently, because production costs differ between countries.'] },
      { term: 'Urbanization', cat: 'factor', defs: ['The growth of cities and megacities, bringing sustainability challenges such as waste, congestion, water and energy.'] },
      { term: 'Population size and distribution', cat: 'factor', defs: ['A contributing factor to global flows because population equals labour and markets.'] },
      { term: 'Land and resources', cat: 'factor', defs: ['A contributing factor: scarcity of crop land, water, food and energy, partly mitigated by technology.'] },
      { term: 'Technology as an internal change agent', cat: 'factor', defs: ['Technology that improves an organisation\'s own efficiency and effectiveness to compete globally.'] },
      { term: 'Technology as an external change agent', cat: 'factor', defs: ['Technology that creates new competition and business models, such as omnichannel distribution and global outsourcing.'] },
      { term: 'Bilateral free trade agreement', cat: 'fta', defs: ['A free trade agreement between two nations.'] },
      { term: 'Regional trade agreement', cat: 'fta', defs: ['A free trade agreement involving three or more nations, e.g. NAFTA/USMCA.'] },
      { term: 'USMCA', cat: 'fta', defs: ['The US–Mexico–Canada agreement that replaced NAFTA (2020).'] },
      { term: 'C-TPAT', cat: 'sec', defs: ['Customs–Trade Partnership Against Terrorism: a voluntary US programme where firms secure their supply chains in return for faster customs handling.'] },
      { term: 'Green lane', cat: 'sec', defs: ['Faster customs clearance for shipments from companies that meet strict security standards.'] },
      { term: 'Ports', cat: 'sec', defs: ['Critical nodes in global supply chains through which most international trade passes — a major focus of security.'] },
      { term: '4PL', cat: 'strat', defs: ['A fourth-party logistics provider that manages and integrates multiple logistics providers on a client\'s behalf.'] }
    ],
    groups: {
      'Contributing factors to global flows': ['Population size and distribution', 'Urbanization', 'Land and resources', 'Technology and information', 'Globalized economy'],
      'Global strategy: supply chain perspective': ['Strategic worldwide sourcing', 'Choosing global DC locations', 'Evaluating transport and channel intermediaries', 'Understanding government influence', 'Collaborating with 3PLs/4PLs'],
      'Global strategy: customer service perspective': ['Standardisation with some customisation', 'Shorter product life cycles', 'More outsourcing', 'More volatility and complexity'],
      'US security measures after 2001': ['Trade Act of 2002', 'Maritime Transportation Security Act of 2002', 'C-TPAT']
    },
    scenarios: [
      { q: ['Country A can make both cloth and wine more cheaply than Country B, yet both gain by A making wine and B making cloth. Which concept?'], a: 'Comparative advantage' },
      { q: ['A country imports bananas because it cannot grow them at all. Which rationale for trade?'], a: 'Absolute advantage' },
      { q: ['The US and Chile sign a deal removing tariffs between the two of them. What type of agreement?'], a: 'Bilateral free trade agreement' },
      { q: ['Three North American countries remove most tariffs between them. What type of agreement?'], a: 'Regional trade agreement' },
      { q: ['An importer secures its container seals and shares cargo data with customs and gets faster clearance. Which programme?'], a: 'C-TPAT' },
      { q: ['New online platforms let small firms outsource production worldwide, creating new competitors. Technology acting as…'], a: 'Technology as an external change agent' }
    ],
    tf: [
      { s: 'By 2030 about 60% of the world population is expected to live in urban areas.', t: true, why: 'Up from 47% in 2000, mostly in less developed countries.' },
      { s: 'Global competition tends to lengthen product life cycles.', t: false, why: 'It shortens them.' },
      { s: 'Supply chain security is a balancing act between security measures and keeping global trade flowing.', t: true, why: 'Measures like e-filing and green lanes try to do both.' },
      { s: 'A regional trade agreement is between exactly two countries.', t: false, why: 'That is bilateral; regional = three or more.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
