/* SCM — Langley Ch. 1: Supply chain management overview */
(function (root) {
  var FSM = root.FSM;
  FSM.addTopic({ id: 'scm_ch1', area: 'Supply Chain', label: 'Ch. 1', title: 'SCM overview: change drivers, flows & issues', read: 'Langley et al. Ch. 1' });

  FSM.addConcepts({
    id: 'scm_ch1_drivers', topic: 'scm_ch1', title: 'The six change drivers',
    items: [
      { term: 'Globalization', cat: 'driver', defs: ['A change driver that brings more economic and political risk, shorter product life cycles and blurred organisational boundaries.', 'The driver behind longer, more complex supply chains, faster copying of products and more outsourcing.'] },
      { term: 'Technology', cat: 'driver', defs: ['A change driver that both enables internal and supply-chain transformation and reshapes the marketplace (internet, social networks, the world\'s knowledge pool).'] },
      { term: 'Organisational consolidation and power shifts', cat: 'driver', defs: ['The shift of economic power from manufacturers to large retailers since the 1980s–90s, leading to more collaboration and demands like scheduled deliveries and ASNs.'] },
      { term: 'Empowered consumers', cat: 'driver', defs: ['Consumers with more information and buying power who demand competitive prices, quality, customisation, convenience and omnichannel flexibility.'] },
      { term: 'Government policy and regulation', cat: 'driver', defs: ['Deregulation of transport, finance and communications in the 1980s–90s that created a more competitive environment.'] },
      { term: 'Sustainability', cat: 'driver', defs: ['A change driver covering society (people), environment (“green”) and economy, key to risk management and competitive advantage.'] },
      { term: 'Bullwhip effect', cat: 'other', defs: ['Small changes in consumer demand get amplified into large swings in orders further up the supply chain; sharing point-of-sale data reduces it.'] },
      { term: 'Advance shipment notice (ASN)', cat: 'other', defs: ['A message sent before delivery telling the customer exactly what is arriving — an example of retailer-driven collaboration.'] },
      { term: 'Omnichannel distribution', cat: 'other', defs: ['Serving customers seamlessly through stores, web shops and other channels — a response to empowered consumers\' need for flexibility.'] }
    ],
    groups: {
      'Six change drivers': ['Globalization', 'Technology', 'Organisational consolidation and power shifts', 'Empowered consumers', 'Government policy and regulation', 'Sustainability'],
      'Three pillars of sustainability': ['Society', 'Environment', 'Economy'],
      'Sectors deregulated in the US (1980s–90s)': ['Transportation', 'Financial sector', 'Communications']
    },
    scenarios: [
      { q: ['Walmart demands that suppliers deliver at scheduled times with “rainbow” pallets. Which change driver does this illustrate?', 'Large retailers now dictate delivery terms to manufacturers. Which change driver?'], a: 'Organisational consolidation and power shifts' },
      { q: ['A product is copied by competitors within months and demand drops quickly. Which change driver?'], a: 'Globalization' },
      { q: ['Shoppers want to order online at midnight and pick up in store the next morning. Which change driver?'], a: 'Empowered consumers' },
      { q: ['Truck companies started offering warehousing and outsourcing services after deregulation. Which change driver?'], a: 'Government policy and regulation' },
      { q: ['A retailer shares point-of-sale data with suppliers so orders upstream stop swinging wildly. Which problem does this fight?'], a: 'Bullwhip effect' },
      { q: ['A company redesigns its network to cut CO₂ emissions and improve working conditions at suppliers. Which change driver?'], a: 'Sustainability' }
    ],
    tf: [
      { s: 'Since the 1980s–90s, power in supply chains has shifted from manufacturers to retailers.', t: true, why: 'Large retailers became the driving force.' },
      { s: 'Globalization usually leads to longer product life cycles.', t: false, why: 'It shortens them: products are copied faster and demand falls faster.' },
      { s: 'Sustainability in SCM is only about the environment.', t: false, why: 'Society, environment and economy.' },
      { s: 'Technology is both an enabler of supply chain transformation and a force that changes the marketplace.', t: true, why: 'Internal and external role.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch1_basics', topic: 'scm_ch1', title: 'Logistics, SCM, flows and supply chain issues',
    items: [
      { term: 'Logistics', cat: 'def', defs: ['Planning, implementing and controlling the efficient and effective flow and storage of goods, services and related information from origin to consumption to meet customer requirements.'] },
      { term: 'Supply chain management', cat: 'def', defs: ['Integrating the flows of products, information and finances through the whole pipeline, from the supplier\'s supplier to the customer\'s customer.', 'Managing across company boundaries so the entire channel — not one firm — operates efficiently.'] },
      { term: 'Materials management', cat: 'def', defs: ['The inbound side of the logistics pipeline: getting materials into the company.'] },
      { term: 'Physical distribution', cat: 'def', defs: ['The outbound side of the logistics pipeline: getting finished goods to customers.'] },
      { term: 'Goal of logistics', cat: 'def', defs: ['Providing an acceptable level of customer service at the lowest possible total cost.'] },
      { term: 'Sub-optimization', cat: 'issue', defs: ['Optimising one part (or one firm) of the supply chain at the expense of the whole — the key challenge under “cost and value”.'] },
      { term: 'Inventory deployment', cat: 'issue', defs: ['The supply chain issue of coordinating inventory levels within one firm (horizontal) and across firms (vertical) to reduce stock.'] },
      { term: 'Performance measurement', cat: 'issue', defs: ['The issue of linking lower-level metrics directly to the high-level performance measures of the firm and the supply chain.'] },
      { term: 'Supply chain security', cat: 'issue', defs: ['The issue of disruption risk, vulnerability and exposure to threats, made worse by distance and complexity.'] },
      { term: 'Talent management', cat: 'issue', defs: ['The issue of attracting, developing and keeping the right people from entry level to executive.'] },
      { term: 'Transportation management', cat: 'issue', defs: ['The issue of a transport “perfect storm”: market changes, driver shortages, fuel costs, infrastructure limits and regulation.'] },
      { term: 'Organisational relationships', cat: 'issue', defs: ['The issue of internal collaboration (marketing, finance, operations) and external collaboration (suppliers, customers, 3PLs).'] }
    ],
    groups: {
      'Four supply chain flows': ['Products', 'Information', 'Financials (cash)', 'Demand'],
      'Three key logistics activities': ['Transportation', 'Storage', 'Order processing / purchasing'],
      'Why SCM evolved': ['More demanding consumers', 'Time is valuable', 'Increased competition', 'Cheaper, faster information technology']
    },
    sequences: [{ title: 'The logistics pipeline (company-focused)', steps: ['Suppliers', 'Materials management (inbound)', 'Production / operations', 'Physical distribution (outbound)', 'Customers'] }],
    scenarios: [
      { q: ['Purchasing buys cheap low-quality parts, which saves its budget but raises returns and repairs downstream. Which supply chain issue is this?'], a: 'Sub-optimization' },
      { q: ['A firm wants to cut stock held both in its own warehouses and at its distributors. Which issue?'], a: 'Inventory deployment' },
      { q: ['Warehouse KPIs don\'t connect to the company\'s customer-service goals. Which issue?'], a: 'Performance measurement' },
      { q: ['A trucking company can\'t find enough drivers and fuel prices spike. Which issue?'], a: 'Transportation management' },
      { q: ['Getting raw materials from suppliers into the plant is called…'], a: 'Materials management' }
    ],
    tf: [
      { s: 'Supply chain management stops at the boundaries of the company.', t: false, why: 'SCM crosses company boundaries — supplier\'s supplier to customer\'s customer.' },
      { s: 'SCM tries to substitute information for inventory along the chain.', t: true, why: 'Better information reduces the stock needed.' },
      { s: 'The goal of logistics is the lowest possible cost, regardless of service.', t: false, why: 'Acceptable service at the lowest TOTAL cost.' },
      { s: 'The supply chain manages four flows: products, information, financials and demand.', t: true, why: 'Summary of chapter 1.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
