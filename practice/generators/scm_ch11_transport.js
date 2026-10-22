/* SCM — Langley Ch. 11: Transportation */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.addTopic({ id: 'scm_ch11', area: 'Supply Chain', label: 'Ch. 11', title: 'Transportation: modes, terms of sale, metrics', read: 'Langley et al. Ch. 11' });

  /* carrier metrics */
  FSM.addSkill({
    id: 'scm_ch11_metrics', topic: 'scm_ch11', title: 'Transportation metrics & perfect delivery index',
    formula: 'Perfect delivery index = on-time % × damage-free % × billing accuracy %',
    build: function (r, c) {
      var n = r.range(500, 20000, 50);
      var late = h.r0(n * r.range(0.005, 0.08, 0.001)), dmg = h.r0(n * r.range(0.001, 0.02, 0.001)), lost = h.r0(n * r.range(0, 0.01, 0.001));
      var bills = r.range(100, 2000, 10), badBills = h.r0(bills * r.range(0.002, 0.04, 0.001));
      var ot = (n - late) / n, df = (n - dmg) / n, ba = (bills - badBills) / bills, pdi = ot * df * ba;
      var carrier = r.pick(['FastLane Freight', 'NordCargo', 'BlueLine Trucking', 'RailConnect', 'Polder Express']);
      var q = r.pick(['ot', 'dmg', 'pdi', 'pdi']);
      var part = {
        ot: { ask: ['What is the on-time delivery percentage?'], answer: ot, unit: 'pct', dp: 2, traps: [{ v: late / n, why: 'That is the late percentage.' }], steps: [step('On-time = (' + F.num(n) + ' − ' + F.num(late) + ') / ' + F.num(n), ot, 'pct', 'on-time ÷ total deliveries', 2)] },
        dmg: { ask: ['What is the damage rate?'], answer: dmg / n, unit: 'pct', dp: 2, traps: [{ v: (dmg + lost) / n, why: 'Lost/stolen units belong to the shortage rate, not the damage rate.' }], steps: [step('Damage rate = ' + F.num(dmg) + ' / ' + F.num(n), dmg / n, 'pct', 'damaged ÷ shipped', 2)] },
        pdi: { ask: ['What is the perfect delivery index?', 'Calculate ' + carrier + '\'s perfect delivery index.'], answer: pdi, unit: 'pct', dp: 2, traps: [{ v: (ot + df + ba) / 3, why: 'Multiply the three percentages — don\'t average them.' }, { v: ot * (1 - dmg / n), why: 'Include billing accuracy.' }],
          steps: [step('On-time % = (' + F.num(n) + ' − ' + F.num(late) + ') / ' + F.num(n), ot, 'pct', 'deliveries', 2), step('Damage-free % = (' + F.num(n) + ' − ' + F.num(dmg) + ') / ' + F.num(n), df, 'pct', 'units', 2), step('Billing accuracy = (' + F.num(bills) + ' − ' + F.num(badBills) + ') / ' + F.num(bills), ba, 'pct', 'freight bills', 2), step('PDI = on-time × damage-free × billing accuracy', pdi, 'pct', 'metric definition', 2)],
          method: ['Calculate on-time %', 'Calculate damage-free %', 'Calculate billing accuracy %', 'Multiply the three'] }
      }[q];
      return {
        intro: [c.company + ' evaluates its carrier ' + carrier + ' over the last year.'],
        facts: [fact('Deliveries (units)', n, 'num', carrier + ' made ' + F.num(n) + ' deliveries (one unit each);'), fact('Late deliveries', late, 'num', F.num(late) + ' arrived late,'), fact('Damaged units', dmg, 'num', F.num(dmg) + ' were damaged'), fact('Lost/stolen units', lost, 'num', 'and ' + F.num(lost) + ' were lost.'), fact('Freight bills / incorrect bills', bills, 'num', 'Of ' + F.num(bills) + ' freight bills, ' + F.num(badBills) + ' were incorrect.')],
        layouts: ['sentence'],
        parts: [part, { kind: 'choice', ask: ['The typical target for on-time delivery is…'], choices: ['> 95%', '> 75%', '> 99.9%', '> 50%'], correctChoice: 0, why: 'Typical targets: on-time > 95%, damage < 1%, billing accuracy > 99%, PDI > 95%.' }]
      };
    }
  });

  /* weighted carrier scorecard */
  FSM.addSkill({
    id: 'scm_ch11_scorecard', topic: 'scm_ch11', title: 'Weighted carrier performance scorecard',
    formula: 'Score = Σ weight × points (0–5)',
    build: function (r, c) {
      var crit = [['On-time delivery', 8], ['Loss and damage rate', 5], ['Billing accuracy', 3], ['Equipment condition', 2], ['Customer service', 2]];
      var pts = crit.map(function () { return r.pick([0, 2, 3, 4, 5, 5]); });
      var total = crit.reduce(function (s, x, i) { return s + x[1] * pts[i]; }, 0);
      var name = r.pick(['FastLane Freight', 'NordCargo', 'BlueLine Trucking', 'Polder Express']);
      return {
        intro: [c.company + ' scores ' + name + ' with a weighted scorecard (maximum 100 points). Points per criterion run from 0 to 5.'],
        statement: { title: 'Criterion', cols: ['Weight', 'Points earned'], rows: crit.map(function (x, i) { return { label: x[0], v: [String(x[1]), String(pts[i])] }; }) },
        facts: [], layouts: ['statement'],
        parts: [{ ask: ['What is the carrier\'s total score?'], answer: total, unit: 'num', dp: 0, traps: [{ v: pts.reduce(function (a, b) { return a + b; }, 0), why: 'Multiply each score by its weight.' }, { v: total / 20, why: 'The total is out of 100, not an average.' }],
          steps: crit.map(function (x, i) { return step(x[0] + ': ' + x[1] + ' × ' + pts[i], x[1] * pts[i], 'num', 'weight × points', 0); }).concat([step('Total', total, 'num', 'sum (max 100)', 0)]) }]
      };
    }
  });

  FSM.addConcepts({
    id: 'scm_ch11_modes', topic: 'scm_ch11', title: 'Transport modes: strengths, costs, selection',
    items: [
      { term: 'Truck (motor carrier)', cat: 'm', defs: ['Most used US mode; accessible, fast and versatile; low fixed, high variable costs; best for smaller, higher-value shipments regionally.'] },
      { term: 'Rail', cat: 'm', defs: ['High capacity, low cost for long-distance, low-value bulk; high fixed costs (track, terminals); weaker service consistency and damage rates.'] },
      { term: 'Air', cat: 'm', defs: ['Fastest mode for urgent, high-value, low-weight goods; high cost, low capacity; high variable costs.'] },
      { term: 'Water', cat: 'm', defs: ['Dominates international tonnage; high capacity and low cost but slow; high variable cost business.'] },
      { term: 'Pipeline', cat: 'm', defs: ['Lowest cost per ton for liquids and gases; mostly fixed costs; slow with a limited network; most reliable.'] },
      { term: 'Intermodal transportation', cat: 'm', defs: ['Using two or more modes in one origin-to-destination move, often in standard containers.'] },
      { term: 'Truckload (TL)', cat: 'c', defs: ['Motor carrier service moving one shipper\'s full trailer load directly.'] },
      { term: 'Less-than-truckload (LTL)', cat: 'c', defs: ['Motor carrier service consolidating smaller shipments from many shippers.'] },
      { term: 'Unit train', cat: 'c', defs: ['A train carrying one commodity for one shipper from origin to destination.'] },
      { term: 'Integrated air carrier', cat: 'c', defs: ['Air carrier like FedEx/UPS offering door-to-door, scheduled, expedited service through hub-and-spoke networks.'] },
      { term: 'Liner service', cat: 'c', defs: ['Ocean service on fixed routes and schedules (vs charter service hired for a specific voyage/time).'] },
      { term: 'Transload freight', cat: 'c', defs: ['Intermodal freight handled and transferred between equipment and modes several times.'] },
      { term: 'Containerized freight', cat: 'c', defs: ['Freight loaded at origin and delivered in the same container with no extra handling.'] },
      { term: 'Core carrier strategy', cat: 's', defs: ['Concentrating transport spend with a few quality carriers to gain lower rates, better relationships and priority capacity.'] },
      { term: 'Collaborative negotiation', cat: 's', defs: ['Developing contracts with carriers for tailored services at rates that fairly compensate them.'] },
      { term: 'Adversarial negotiation', cat: 's', defs: ['Minimising transport cost regardless of the effect on the carrier\'s finances or long-term viability.'] },
      { term: 'Transportation management system (TMS)', cat: 's', defs: ['Software to plan, execute and analyse transport: rating, tendering, carrier selection, documents, tracking and reporting.'] },
      { term: 'Bill of lading', cat: 's', defs: ['The key freight document: receipt for the goods and contract of carriage.'] }
    ],
    groups: {
      'High fixed-cost modes': ['Rail', 'Pipeline'],
      'High variable-cost modes': ['Truck (motor carrier)', 'Air', 'Water'],
      'Carrier selection factors': ['Geographic coverage', 'Transit time average and reliability', 'Freight rates', 'Equipment availability and capacity', 'Product protection'],
      'Transportation execution and control': ['Shipment preparation', 'Freight documentation', 'In-transit visibility', 'Transportation metrics', 'Monitoring service quality']
    },
    scenarios: [
      { q: ['200,000 tonnes of iron ore from a mine in Brazil to a steel mill in China. Best mode?'], a: 'Water' },
      { q: ['Urgent vaccines from Belgium to Singapore. Best mode?'], a: 'Air' },
      { q: ['Natural gas from a field to a city distribution network. Best mode?'], a: 'Pipeline' },
      { q: ['Coal from a mine to a power plant 1,000 km inland, every week. Best mode?'], a: 'Rail' },
      { q: ['Furniture from a regional DC to 40 stores within 300 km. Best mode?'], a: 'Truck (motor carrier)' },
      { q: ['A container goes by ship from Shanghai to Rotterdam, then by train to Duisburg and by truck to the customer. What is this?'], a: 'Intermodal transportation' },
      { q: ['A small webshop sends 3 pallets that share a trailer with other shippers\' goods. Which service?'], a: 'Less-than-truckload (LTL)' },
      { q: ['A shipper concentrates its freight with 5 carriers to get lower rates and guaranteed capacity. Which strategy?'], a: 'Core carrier strategy' }
    ],
    tf: [
      { s: 'In the performance ranking, pipeline scores best on reliability and cost.', t: true, why: 'Pipeline = 1 on reliability, security and cost.' },
      { s: 'Air is the best-ranked mode on accessibility.', t: false, why: 'Truck is the most accessible.' },
      { s: 'Transportation accounts for about 63% of US business logistics costs.', t: true, why: '$1.04 trillion of $1.6 trillion.' },
      { s: 'Carrier selection is a less frequent, more long-range decision than modal selection.', t: false, why: 'Modal selection is more long-range; carrier selection is more frequent.' },
      { s: 'Inbound transportation is typically controlled by purchasing, outbound by marketing or logistics.', t: true, why: 'This split can cause missed efficiencies.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch11_fob', topic: 'scm_ch11', title: 'Terms of sale (FOB) & outsourcing transport',
    items: [
      { term: 'FOB origin, freight collect', cat: 'fob', defs: ['Buyer owns goods in transit, files claims, selects/pays the carrier and bears the freight cost.'] },
      { term: 'FOB origin, freight prepaid', cat: 'fob', defs: ['Buyer owns goods in transit and files claims, but the seller selects, pays and bears the freight cost.'] },
      { term: 'FOB origin, freight prepaid and charged back', cat: 'fob', defs: ['Buyer owns goods in transit; seller selects and pays the carrier, then adds the freight cost to the invoice so the buyer bears it.'] },
      { term: 'FOB destination, freight prepaid', cat: 'fob', defs: ['Seller owns goods in transit, files claims, selects/pays the carrier and bears the freight cost.'] },
      { term: 'FOB destination, freight collect', cat: 'fob', defs: ['Seller owns goods in transit and files claims, but the buyer selects/pays the carrier and bears the freight cost.'] },
      { term: 'FOB destination, freight collect and allowed', cat: 'fob', defs: ['Seller owns goods in transit; buyer pays the carrier but deducts the freight from its payment, so the seller bears the cost.'] },
      { term: 'Private fleet', cat: 'out', defs: ['The “make” option: a company runs its own trucks — more control and flexibility, but large capital and expertise needs.'] },
      { term: 'For-hire carrier', cat: 'out', defs: ['An external carrier hired to move freight, avoiding the cost and effort of running a fleet.'] },
      { term: 'Third-party logistics provider (3PL)', cat: 'out', defs: ['An external provider offering services like dedicated contract carriage, traffic management and international forwarding.'] },
      { term: 'International freight forwarder', cat: 'out', defs: ['A specialised 3PL that arranges international shipments for shippers.'] },
      { term: 'NVOCC', cat: 'out', defs: ['Non-vessel-operating common carrier: books ocean space and consolidates shipments without owning ships.'] },
      { term: 'Customs broker', cat: 'out', defs: ['A specialist that handles customs clearance of imports and exports.'] },
      { term: 'Incoterms', cat: 'fob', defs: ['International commercial terms that define where the seller\'s responsibilities end and the buyer\'s begin in global trade.'] }
    ],
    groups: {
      'Buyer owns goods in transit': ['FOB origin, freight collect', 'FOB origin, freight prepaid', 'FOB origin, freight prepaid and charged back'],
      'Seller owns goods in transit': ['FOB destination, freight prepaid', 'FOB destination, freight collect', 'FOB destination, freight collect and allowed'],
      'Specialised international 3PLs': ['International freight forwarder', 'NVOCC', 'Customs broker']
    },
    scenarios: [
      { q: ['The seller owns the goods until they arrive, chooses the carrier and pays the freight. Which term?'], a: 'FOB destination, freight prepaid' },
      { q: ['Ownership passes at the seller\'s dock; the buyer chooses and pays the carrier. Which term?'], a: 'FOB origin, freight collect' },
      { q: ['The seller arranges and pays the carrier but adds the freight to the invoice; ownership passes at origin. Which term?'], a: 'FOB origin, freight prepaid and charged back' },
      { q: ['A company wants full control over delivery times and the advertising value of trucks with its logo. Which option?'], a: 'Private fleet' },
      { q: ['A firm without ships books container space with an ocean carrier and consolidates small shipments. What is it?'], a: 'NVOCC' }
    ],
    tf: [
      { s: 'Under FOB origin, the buyer owns the goods while they are in transit.', t: true, why: 'Ownership passes at the origin.' },
      { s: 'Under FOB destination, freight collect, the buyer owns the goods in transit.', t: false, why: 'Seller owns them; buyer only pays the carrier.' },
      { s: 'Using for-hire carriers avoids the large capital cost of starting a private fleet.', t: true, why: 'One of the main reasons to outsource.' },
      { s: 'Freight payment terms should usually give control to the party with greater influence over the carrier.', t: true, why: 'The “best used when” column of the FOB table.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
