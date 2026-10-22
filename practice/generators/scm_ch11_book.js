/* SCM Ch. 11 — extra book material (Langley) */
(function (root) {
  var FSM = root.FSM;
  FSM.addConcepts({
    id: 'scm_ch11_book', topic: 'scm_ch11', title: 'Modal criteria, documents, claims & control',
    items: [
      { term: 'Accessibility', cat: 'm', defs: ['Whether a mode can physically reach the origin and destination; truck is best, pipeline worst.'] },
      { term: 'Transit time', cat: 'm', defs: ['Total elapsed time from pickup to delivery (pickup, terminal handling, linehaul, delivery); air is fastest.'] },
      { term: 'Reliability (transport)', cat: 'm', defs: ['Consistency of transit time, measured by its statistical variation.'] },
      { term: 'Straight bill of lading', cat: 'd', defs: ['A NON-negotiable bill of lading: goods must go to the named receiver.'] },
      { term: 'Order bill of lading', cat: 'd', defs: ['A negotiable bill of lading that serves as title, so ownership can be transferred and the goods rerouted.'] },
      { term: 'Freight bill', cat: 'd', defs: ['The carrier\'s invoice for moving the shipment (charges), unlike the bill of lading (terms and title).'] },
      { term: 'Freight claim', cat: 'd', defs: ['A written demand to the carrier to recover the value of goods lost, damaged or delayed.'] },
      { term: 'Released value', cat: 'd', defs: ['Declaring freight at less than its full worth in exchange for a lower rate, which limits carrier liability.'] },
      { term: 'Concealed loss', cat: 'd', defs: ['Damage or shortage discovered only after the packages are opened.'] },
      { term: 'Commercial invoice', cat: 'd', defs: ['Record of the sale between exporter and importer, used for customs value and duties.'] },
      { term: 'Certificate of origin', cat: 'd', defs: ['Document proving the country where the goods were made.'] },
      { term: 'Routing guide', cat: 'c', defs: ['Instructions telling suppliers/shippers which carriers and rules to use, to keep control and avoid "maverick" buying.'] },
      { term: 'Maverick buying', cat: 'c', defs: ['Buying transport off-contract outside the approved carriers.'] },
      { term: 'Dedicated contract carriage', cat: 'c', defs: ['A 3PL or carrier acts as the firm\'s private fleet, with dedicated drivers, equipment and management.'] },
      { term: 'Traffic management (3PL)', cat: 'c', defs: ['A 3PL handles transport planning, decisions and admin such as freight bill auditing.'] },
      { term: 'COFC / double-stack', cat: 'c', defs: ['Containers on rail flatcars (two high for double-stack); has largely replaced trailer-on-flatcar (TOFC, "piggyback").'] },
      { term: 'Near-shoring', cat: 'r', defs: ['Moving production closer to the market to cut transport cost, transit time and disruption risk.'] },
      { term: 'Hours of service (HOS)', cat: 'r', defs: ['Safety rules limiting how long truck drivers may drive (e.g. 11 hours after 10 off duty).'] },
      { term: 'SmartWay', cat: 'r', defs: ['Voluntary US programme helping firms move freight in cleaner, more fuel-efficient ways.'] }
    ],
    groups: {
      'Carrier is NOT liable when loss is due to…': ['Act of God', 'Act of public enemy', 'Act of public authority', 'Act of the shipper', 'Inherent nature of the goods'],
      'Most common freight documents': ['Bill of lading', 'Freight bill', 'Freight claim'],
      'Transportation role inhibitors': ['Offshore manufacturing', 'Changing customer requirements', 'Capacity constraints', 'Rate variation', 'Government regulation']
    },
    scenarios: [
      { q: ['A seller wants to be able to sell the goods to another buyer while they are still at sea.'], a: 'Order bill of lading' },
      { q: ['The carrier sends the shipper an invoice listing weight, origin, destination and total charges.'], a: 'Freight bill' },
      { q: ['A store finds broken glasses only after unpacking the cartons a week later.'], a: 'Concealed loss' },
      { q: ['A shipper declared its electronics at €2/kg to get a cheaper rate; after damage it can recover only that amount.'], a: 'Released value' },
      { q: ['A retailer tells all vendors: "use carrier X, ship collect, max 20 cartons".'], a: 'Routing guide' },
      { q: ['Ryder provides trucks, drivers and managers that work only for one shipper.'], a: 'Dedicated contract carriage' }
    ],
    tf: [
      { s: 'In the performance ranking of modes, pipeline is best for reliability, security and cost but worst for accessibility and transit time.', t: true, why: 'Truck: best accessibility; air: best transit time.' },
      { s: 'Motor carriage costs roughly 10× rail, and air more than twice motor carriage.', t: true, why: 'But speed can lower inventory cost and the total landed cost.' },
      { s: 'The freight bill acts as a receipt for the goods and as document of title.', t: false, why: 'That is the bill of lading; the freight bill is the invoice.' },
      { s: 'A carrier is liable for damage caused by the shipper\'s poor packaging.', t: false, why: '"Act of the shipper" is one of the five exemptions.' },
      { s: 'Modal selection is revisited often; carrier selection rarely.', t: false, why: 'The opposite: there are only a few modes but many carriers, so carrier selection needs more frequent attention.' },
      { s: 'Split control (purchasing for inbound, logistics for outbound) usually gives the best transport efficiency.', t: false, why: 'Centralising transport decisions in logistics allows coordination and leverage of buying power.' }
    ],
    sequences: [
      { title: 'Transportation planning framework', steps: ['Functional responsibility', 'Terms of sale', 'Decision to outsource', 'Modal selection', 'Carrier selection', 'Rate negotiation'] }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
