/* Extra concept drills for items on the SCM lecture slides that were not yet drilled. */
(function (root) {
  var FSM = root.FSM;

  FSM.addConcepts({
    id: 'scm_ch1_slides', topic: 'scm_ch1', title: 'Why SCM evolved, what logistics does, cost & importance factors',
    items: [
      { term: 'Changing markets', cat: 'w', defs: ['Consumers are more sophisticated and demand better quality for a lower price — one reason SCM evolved.'] },
      { term: 'Time is valuable', cat: 'w', defs: ['Customers want things faster; speed became a competitive factor — one reason SCM evolved.'] },
      { term: 'Increased competition', cat: 'w', defs: ['More (global) competitors push firms to make the whole chain efficient — one reason SCM evolved.'] },
      { term: 'Cheaper, faster information processing', cat: 'w', defs: ['Technology made it cheap to share data across companies — one reason SCM evolved.'] },
      { term: 'Crosses company boundaries', cat: 's', defs: ['SCM looks at the whole channel, not one company: the entire chain should operate efficiently.'] },
      { term: 'Substitute information for inventory', cat: 's', defs: ['Sharing real demand data along the chain lets every partner hold less stock.'] },
      { term: 'Win-win relationships', cat: 's', defs: ['SCM builds relationships with customers and suppliers that benefit both sides.'] },
      { term: 'Access to new markets', cat: 'l', defs: ['Logistics lets a company reach customers far away — one thing logistics does for the economy.'] },
      { term: 'Economies of scale', cat: 'l', defs: ['Efficient logistics lets firms produce in large, cheap volumes and ship widely.'] },
      { term: 'Lower prices and more consumer choice', cat: 'l', defs: ['Logistics increases competition, which lowers prices and widens choice for consumers.'] },
      { term: 'Comparative advantage → competitive advantage', cat: 'l', defs: ['Logistics lets a company make things where it is cheapest and sell them where demand is.'] },
      { term: 'Customer service as a competitive weapon', cat: 'f', defs: ['When products are similar, better delivery service wins customers — makes logistics more important.'] },
      { term: 'Degree of substitutability', cat: 'f', defs: ['If customers can easily switch to another product, a stockout means a lost sale, so logistics matters more.'] },
      { term: 'Convenience, shopping and specialty goods', cat: 'f', defs: ['Convenience goods must always be available (high logistics importance); for specialty goods customers will wait.'] },
      { term: 'Weight/volume relationship', cat: 'f', defs: ['Light, bulky goods fill trucks before reaching the weight limit, which makes them expensive to ship and store.'] },
      { term: 'Risk of loss and damage', cat: 'f', defs: ['Fragile or valuable goods need better packaging, handling and transport, which raises logistics cost.'] },
      { term: 'Globalisation: inventory challenges', cat: 'g', defs: ['Faster copying of products, faster drops in demand, new pricing policies, higher risk of obsolescence, longer and more complex chains, more outsourcing.'] },
      { term: 'Sustainability: society, environment, economy', cat: 'g', defs: ['The three pillars: people, being "green", and long-term financial health.'] },
      { term: 'Deregulation: transport, finance, communications', cat: 'g', defs: ['The three US sectors whose deregulation (1980s–90s) made supply chains more competitive.'] }
    ],
    groups: {
      'Why SCM evolved': ['Changing markets', 'Time is valuable', 'Increased competition', 'Cheaper, faster information processing'],
      'What makes SCM different': ['Crosses company boundaries', 'Substitute information for inventory', 'Win-win relationships'],
      'What else logistics does': ['Access to new markets', 'Economies of scale', 'Lower prices and more consumer choice', 'Comparative advantage → competitive advantage'],
      'Factors affecting the cost & importance of logistics': ['Customer service as a competitive weapon', 'Inventory reduction', 'Order cycle speed', 'Information', 'Nature of the product']
    },
    scenarios: [
      { q: ['A retailer shares its point-of-sale data with suppliers so everybody can cut safety stock.'], a: 'Substitute information for inventory' },
      { q: ['Shoppers will walk to another store if their usual brand of milk is out of stock.'], a: 'Degree of substitutability' },
      { q: ['Foam packaging fills a truck long before the truck reaches its weight limit.'], a: 'Weight/volume relationship' },
      { q: ['A Dutch firm can now sell to customers in Poland thanks to fast, cheap road freight.'], a: 'Access to new markets' },
      { q: ['Customers today compare prices online and expect high quality at low cost.'], a: 'Changing markets' },
      { q: ['Two suppliers sell identical parts; the one that delivers next-day wins the contract.'], a: 'Customer service as a competitive weapon' }
    ],
    tf: [
      { s: 'SCM aims to make the whole channel efficient, not just one company.', t: true, why: 'It crosses company boundaries.' },
      { s: 'For specialty goods, customers are usually willing to wait, so availability matters less than for convenience goods.', t: true, why: 'Convenience goods must be on the shelf every time.' },
      { s: 'Globalisation lengthens product life cycles.', t: false, why: 'It shortens them (faster copying, faster drop in demand).' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch3_slides', topic: 'scm_ch3', title: 'Logistics interfaces & macro logistics costs',
    items: [
      { term: 'Interface with manufacturing', cat: 'i', defs: ['Length of production runs, availability of raw materials and components, industrial packaging.'] },
      { term: 'Interface with marketing', cat: 'i', defs: ['The 4 Ps: price (quantity discounts), product (size, weight, packaging), promotion, place (channel selection).'] },
      { term: 'Interface with finance', cat: 'i', defs: ['Inventory investment, owning vs outsourcing warehouses and fleets, the cost of customer service.'] },
      { term: 'Interface with accounting', cat: 'i', defs: ['Cost information to compare logistics options, trade-offs and performance measurement.'] },
      { term: 'Transportation costs (macro)', cat: 'm', defs: ['The largest part of business logistics costs — about 63% in the US.'] },
      { term: 'Inventory carrying costs (macro)', cat: 'm', defs: ['Storage, the financial cost (WACC × inventory value) and other costs such as obsolescence, shrinkage and insurance.'] }
    ],
    scenarios: [
      { q: ['Marketing wants a quantity discount on large orders; logistics must handle the bigger shipments.'], a: 'Interface with marketing' },
      { q: ['The controller provides cost data to compare an own warehouse with a 3PL.'], a: 'Interface with accounting' },
      { q: ['The CFO asks whether to lease or buy the truck fleet.'], a: 'Interface with finance' },
      { q: ['Long production runs fill the warehouse with one product.'], a: 'Interface with manufacturing' }
    ],
    tf: [
      { s: 'Transportation is the largest component of business logistics costs.', t: true, why: 'About 63% in the US.' },
      { s: 'The financial cost of holding inventory is measured as WACC × inventory value.', t: true, why: 'It is the capital tied up in stock.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch5_slides', topic: 'scm_ch5', title: 'Unique aspects of strategic sourcing & e-procurement functions',
    items: [
      { term: 'Leveraging purchasing power', cat: 'u', defs: ['Consolidating spend so the company can negotiate better terms — a unique aspect of strategic sourcing.'] },
      { term: 'Emphasis on value', cat: 'u', defs: ['Looking at total value (total cost of ownership, relationship) instead of only price.'] },
      { term: 'More meaningful supplier relationships', cat: 'u', defs: ['Working closely with fewer, better suppliers.'] },
      { term: 'Attention to process improvement', cat: 'u', defs: ['Sourcing as part of continuous improvement for both buyer and supplier.'] },
      { term: 'Enhanced teamwork and professionalism', cat: 'u', defs: ['Cross-functional sourcing teams and trained buyers.'] },
      { term: 'Management of RFI/RFP processes', cat: 'e', defs: ['An e-sourcing function: running requests for information and proposals online.'] },
      { term: 'Online negotiations', cat: 'e', defs: ['An e-sourcing function: real-time bidding, e.g. reverse auctions.'] },
      { term: 'Contract management', cat: 'e', defs: ['An e-procurement function: storing and managing supplier agreements.'] },
      { term: 'Spend analysis', cat: 'e', defs: ['Understanding spend by supplier, category and internal user (step 2 of strategic sourcing).'] },
      { term: 'Make vs buy', cat: 'e', defs: ['Deciding whether to produce in-house or purchase — addressed in step 2 (understand spend).'] }
    ],
    groups: { 'Unique aspects of strategic sourcing': ['Leveraging purchasing power', 'Emphasis on value', 'More meaningful supplier relationships', 'Attention to process improvement', 'Enhanced teamwork and professionalism'] },
    scenarios: [
      { q: ['Five business units that each bought laptops separately now buy through one central contract.'], a: 'Leveraging purchasing power' },
      { q: ['The buyer chooses the supplier with the best total cost of ownership, not the lowest price.'], a: 'Emphasis on value' },
      { q: ['Before choosing suppliers, the team analyses spend by category and decides what to make in-house.'], a: 'Make vs buy' }
    ],
    sequences: [
      { title: 'Seven steps of strategic sourcing', steps: ['Develop strategic plan', 'Understand spend', 'Evaluate supply sources', 'Finalise sourcing strategy', 'Implement sourcing strategy', 'Transition and onboarding', 'Collaborative process improvement'] }
    ],
    tf: [
      { s: 'Purchasing is a process; procurement is a transactional activity.', t: false, why: 'The other way round: purchasing is the transactional activity; procurement and strategic sourcing are processes.' },
      { s: 'Onboarding and transitioning happens before suppliers are selected.', t: false, why: 'It is step 6, after the strategy is implemented and suppliers are chosen.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch9_slides', topic: 'scm_ch9', title: 'Four inventory questions, MRP/VMI details, JIT attitudes',
    items: [
      { term: 'How much to order?', cat: 'q', defs: ['First fundamental inventory question: the order quantity.'] },
      { term: 'When to order?', cat: 'q', defs: ['Second fundamental inventory question: the reorder point or review moment.'] },
      { term: 'Where to hold inventory?', cat: 'q', defs: ['Third fundamental inventory question: which locations (plant, DC, depot) hold stock.'] },
      { term: 'Which items at which location?', cat: 'q', defs: ['Fourth fundamental inventory question: the product range per location.'] },
      { term: 'MRP advantage', cat: 'a', defs: ['Keeps safety stock reasonable, spots supply problems early, bases production on actual demand and forecasts, coordinates ordering across the network.'] },
      { term: 'MRP shortcoming', cat: 'a', defs: ['Computer-intensive and hard to change; may raise ordering and transport costs; less sensitive to short-term demand changes; can become very complex.'] },
      { term: 'VMI advantage', cat: 'a', defs: ['The supplier sees real-time stock at the customer and can react to demand swings before a stockout happens.'] },
      { term: 'VMI shortcoming', cat: 'a', defs: ['A supplier may push extra stock into the customer\'s DC at month-end to meet its sales quota.'] },
      { term: 'CPFR', cat: 'a', defs: ['Collaborative planning, forecasting and replenishment: partners plan and forecast together; like VMI it manages stock close to real demand.'] },
      { term: 'JIT: inventory is a liability', cat: 'j', defs: ['In JIT, stock hides problems and costs money, so it is treated as a liability (EOQ sees it as an asset).'] },
      { term: 'JIT: single supply source, suppliers as partners', cat: 'j', defs: ['JIT relies on few, close partner suppliers; EOQ uses multiple sources and treats suppliers as adversaries.'] },
      { term: 'JIT: reliability of lead time', cat: 'j', defs: ['For JIT, a reliable lead time matters more than a short one.'] }
    ],
    groups: { 'Four fundamental inventory questions': ['How much to order?', 'When to order?', 'Where to hold inventory?', 'Which items at which location?'] },
    scenarios: [
      { q: ['A supplier receives the customer\'s daily shipment data per SKU and sends a replenishment when stock hits the agreed reorder point.'], a: 'VMI advantage', opts: ['VMI shortcoming', 'MRP advantage', 'CPFR'], why: 'This describes how VMI works and its benefit: the supplier reacts before a stockout.' },
      { q: ['At the end of the month the supplier fills the customer\'s DC with extra stock to hit its sales target.'], a: 'VMI shortcoming' },
      { q: ['The company decides to keep slow movers only at the central DC and fast movers at every depot.'], a: 'Which items at which location?' }
    ],
    tf: [
      { s: 'The closer an inventory technique manages stock to real demand (e.g. VMI, CPFR), the more accurate the forecast and the higher product availability.', t: true, why: 'Shorter forecast cycles, better accuracy.' },
      { s: 'In JIT, the length of the lead time is more important than its reliability.', t: false, why: 'Reliability matters more.' },
      { s: 'Finance usually wants high inventory to protect sales.', t: false, why: 'Finance wants LOW inventory (higher turns, more cash); marketing wants high inventory; manufacturing wants long production runs.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch11_slides', topic: 'scm_ch11', title: 'Carrier industries, negotiation and execution steps',
    items: [
      { term: 'Integrated air carrier', cat: 'c', defs: ['Air carrier such as FedEx or UPS offering door-to-door service with scheduled pickup and delivery through hub-and-spoke networks.'] },
      { term: 'Nonintegrated air carrier', cat: 'c', defs: ['Air carrier that only flies airport to airport, on demand.'] },
      { term: 'Combination carrier', cat: 'c', defs: ['Passenger airline that also carries cargo in the belly of its planes.'] },
      { term: 'Liner service', cat: 'c', defs: ['Ocean shipping on fixed routes and schedules, e.g. container lines.'] },
      { term: 'Charter service', cat: 'c', defs: ['Ocean ship hired for a specific voyage or period, often for bulk.'] },
      { term: 'Unit train', cat: 'c', defs: ['A whole train carrying one commodity from one origin to one destination (e.g. coal).'] },
      { term: 'Class I railroads', cat: 'c', defs: ['The seven large US linehaul freight railroads that dominate the industry; no single railroad covers the whole country.'] },
      { term: 'Captive shipper', cat: 'c', defs: ['A shipper served by only one railroad, so it has little bargaining power on rates.'] },
      { term: 'Gathering, trunk and refined-product lines', cat: 'c', defs: ['The three types of oil pipeline.'] },
      { term: 'Core carrier strategy', cat: 'n', defs: ['Concentrating the transport buy with a few quality carriers and being a "shipper of choice": leverage, focus, strong relationships, priority access to capacity.'] },
      { term: 'Buyer negotiation issues', cat: 'n', defs: ['Equipment availability, freight rates and service levels.'] },
      { term: 'Carrier negotiation issues', cat: 'n', defs: ['Volume commitments, shipment frequency, origin–destination combinations, freight characteristics and cost issues.'] },
      { term: 'In-transit visibility', cat: 'x', defs: ['Tracking where shipments are and their status, so problems can be fixed before they hurt customers.'] }
    ],
    groups: {
      'Transportation execution & control (in order)': ['Shipment preparation', 'Freight documentation', 'Maintain in-transit visibility', 'Transportation metrics', 'Monitor service quality'],
      'Transportation role inhibitors': ['Offshore manufacturing', 'Changing customer requirements', 'Capacity constraints', 'Rate variation', 'Growing government requirements']
    },
    sequences: [
      { title: 'Transportation execution & control', steps: ['Shipment preparation', 'Freight documentation', 'Maintain in-transit visibility', 'Transportation metrics', 'Monitor service quality'] }
    ],
    scenarios: [
      { q: ['A shipper gives 80% of its volume to three carriers in exchange for guaranteed capacity in peak season.'], a: 'Core carrier strategy' },
      { q: ['A chemical plant reachable by only one railroad complains it cannot negotiate rates.'], a: 'Captive shipper' },
      { q: ['A whole train of 100 grain wagons runs straight from one silo to the port.'], a: 'Unit train' },
      { q: ['FedEx picks up the parcel, flies it overnight and delivers it to the door.'], a: 'Integrated air carrier' },
      { q: ['The carrier asks for a minimum of 500 loads a year before it offers a lower rate.'], a: 'Carrier negotiation issues' }
    ],
    tf: [
      { s: 'Trucking is a low-fixed-cost, high-variable-cost business; railroads and pipelines have high fixed costs.', t: true, why: 'Trucks use public roads; railroads and pipelines build their own track or right-of-way.' },
      { s: 'Truck carries most of the US freight value; rail carries a large share of ton-miles.', t: true, why: 'Truck ~69% of value; rail ~28% of ton-miles.' },
      { s: 'The most important future transport challenge named by managers is rising customer expectations.', t: true, why: 'Followed by technology cost and driver availability.' },
      { s: 'Modal selection is made more frequently than carrier selection.', t: false, why: 'Mode is a long-range decision; carrier selection is more active and frequent.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
