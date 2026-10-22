/* SCM — Langley Ch. 3: Role of logistics in supply chains */
(function (root) {
  var FSM = root.FSM;
  FSM.addTopic({ id: 'scm_ch3', area: 'Supply Chain', label: 'Ch. 3', title: 'Role of logistics: utilities, activities, cost factors', read: 'Langley et al. Ch. 3' });

  FSM.addConcepts({
    id: 'scm_ch3_utility', topic: 'scm_ch3', title: 'Economic utilities & types of logistics',
    items: [
      { term: 'Form utility', cat: 'u', defs: ['Value created by changing the product\'s shape or composition — mainly from production/manufacturing.'] },
      { term: 'Time utility', cat: 'u', defs: ['Value created by having the product available WHEN the customer needs it — a logistics utility.'] },
      { term: 'Place utility', cat: 'u', defs: ['Value created by having the product WHERE the customer needs it — a logistics utility.'] },
      { term: 'Quantity utility', cat: 'u', defs: ['Value created by delivering the right AMOUNT — a logistics utility.'] },
      { term: 'Possession utility', cat: 'u', defs: ['Value created by making the customer want and acquire the product (e.g. via credit, promotion) — mainly from marketing.'] },
      { term: 'Business logistics', cat: 't', defs: ['The part of the supply chain that plans, implements and controls the flow and storage of goods, services and information.'] },
      { term: 'Military logistics', cat: 't', defs: ['Designing and integrating all support for the operational capability of armed forces and their equipment.'] },
      { term: 'Event logistics', cat: 't', defs: ['Organising, scheduling and deploying resources for an event and withdrawing them afterwards.'] },
      { term: 'Service logistics', cat: 't', defs: ['Acquiring, scheduling and managing facilities, people and materials to support a service operation.'] }
    ],
    groups: {
      'Utilities created by logistics': ['Time utility', 'Place utility', 'Quantity utility'],
      'Utility from manufacturing': ['Form utility'],
      'Utility from marketing': ['Possession utility']
    },
    scenarios: [
      { q: ['Fresh strawberries arrive in Groningen supermarkets in December. Which utility did logistics create?', 'Getting umbrellas into a store in a city where it is raining creates…'], a: 'Place utility', opts: ['Form utility', 'Possession utility', 'Quantity utility'] },
      { q: ['Toys reach the shelves just before Sinterklaas, not after. Which utility?'], a: 'Time utility', opts: ['Form utility', 'Possession utility', 'Place utility'] },
      { q: ['A store receives 40 cases instead of the 400 it ordered and runs out. Which utility failed?'], a: 'Quantity utility', opts: ['Form utility', 'Possession utility', 'Time utility'] },
      { q: ['Steel coils are pressed into car doors. Which utility?'], a: 'Form utility', opts: ['Time utility', 'Place utility', 'Possession utility'] },
      { q: ['A retailer offers 0% financing so customers buy a TV now. Which utility?'], a: 'Possession utility', opts: ['Place utility', 'Form utility', 'Quantity utility'] },
      { q: ['Setting up and removing all stages, food and staff for a music festival is…'], a: 'Event logistics' }
    ],
    tf: [
      { s: 'Logistics is mainly credited with form utility.', t: false, why: 'Form = manufacturing. Logistics: time, place, quantity.' },
      { s: 'Marketing is mainly credited with possession utility.', t: true, why: 'Marketing creates the desire/ability to own.' }
    ]
  });

  FSM.addConcepts({
    id: 'scm_ch3_costs', topic: 'scm_ch3', title: 'Logistics activities, interfaces & cost factors',
    items: [
      { term: 'Competitive relationships', cat: 'f', defs: ['Customer service is used as a form of competition, which raises the importance of logistics.'] },
      { term: 'Order cycle length', cat: 'f', defs: ['Shorter order cycles reduce the inventory the customer must hold.'] },
      { term: 'Substitutability', cat: 'f', defs: ['When products are easily substituted, good logistics service matters more to avoid lost sales.'] },
      { term: 'Inventory effect', cat: 'f', defs: ['Spending more on inventory can reduce the cost of lost sales.'] },
      { term: 'Transportation effect', cat: 'f', defs: ['Spending more on faster/better transport can reduce the cost of lost sales.'] },
      { term: 'Spatial relationships', cat: 'f', defs: ['The location of plants and warehouses relative to suppliers and markets strongly affects transport costs.'] },
      { term: 'Product density', cat: 'p', defs: ['The weight-to-space ratio; as it increases, transport and storage costs (per unit of weight) fall.'] },
      { term: 'Dollar value of the product', cat: 'p', defs: ['A product factor: higher value raises inventory, warehousing, transport and packaging costs.'] },
      { term: 'Susceptibility to damage', cat: 'p', defs: ['A product factor: the higher the risk of damage, the higher transport and warehousing costs.'] },
      { term: 'Special handling requirements', cat: 'p', defs: ['A product factor such as refrigeration or strapping that increases storage, transport and packaging costs.'] },
      { term: 'Nodes', cat: 's', defs: ['Fixed points in a logistics system where goods stop for storage or processing, such as plants and warehouses.'] },
      { term: 'Links', cat: 's', defs: ['The transport network that connects the nodes of a logistics system.'] },
      { term: 'Cost centers approach', cat: 's', defs: ['Analysing logistics activities as cost centres so trade-offs between them (e.g. transport vs inventory) become visible.'] },
      { term: 'Short-run (static) analysis', cat: 's', defs: ['Analysing a logistics system at one point in time or one level of output.'] },
      { term: 'Long-run (dynamic) analysis', cat: 's', defs: ['Analysing a logistics system over a long period or a range of outputs.'] }
    ],
    groups: {
      'Product-related cost factors': ['Product density', 'Dollar value of the product', 'Susceptibility to damage', 'Special handling requirements'],
      'Approaches to analysing logistics systems': ['Materials management vs physical distribution', 'Cost centers approach', 'Nodes vs links', 'Logistics channels'],
      'Key logistics activities': ['Transportation', 'Storage', 'Industrial packaging', 'Materials handling', 'Inventory control', 'Order fulfillment', 'Demand forecasting', 'Procurement', 'Plant and warehouse site location'],
      'Logistics interface with marketing (4 Ps)': ['Price', 'Product', 'Promotion', 'Place']
    },
    scenarios: [
      { q: ['Feathers fill a truck long before it reaches its weight limit, so the cost per kg is high. Which product factor?', 'Shipping pillows is expensive per kilo because they take lots of space. Which factor?'], a: 'Product density' },
      { q: ['A company pays for express air freight to avoid customers switching to a competitor\'s brand. Which factor explains this?'], a: 'Transportation effect' },
      { q: ['Fresh fish needs refrigerated trucks and cold storage. Which product factor?'], a: 'Special handling requirements' },
      { q: ['A warehouse is moved 200 km closer to its main customers to cut freight costs. Which factor?'], a: 'Spatial relationships' },
      { q: ['Customers can easily buy another brand of bottled water if yours is out of stock. Which factor raises the importance of logistics?'], a: 'Substitutability' },
      { q: ['Expensive laptops increase insurance and inventory carrying costs. Which product factor?'], a: 'Dollar value of the product' }
    ],
    tf: [
      { s: 'As product density increases, transportation and warehousing costs per unit of weight tend to decrease.', t: true, why: 'More weight fits in the same space.' },
      { s: 'Transportation is the largest component of US business logistics costs.', t: true, why: 'Around $1.04 trillion of $1.6 trillion (≈ 63%).' },
      { s: 'The financial cost of inventory is calculated as WACC × total business inventory.', t: true, why: 'That is how inventory carrying cost includes the cost of capital.' },
      { s: 'Logistics has no interface with finance because it only moves goods.', t: false, why: 'Inventory, warehouses/fleets (own vs outsource) and service all affect finance.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
