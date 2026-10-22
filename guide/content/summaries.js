/* Plain-language summaries of every assigned reading, written for this site (not copied from the books).
   Shape: { big: one-sentence idea, parts: [{h, li[]}], example?: {q, steps[]}, remember: [] } */
(function (root) {
  root.FSM_SUMMARIES = {

  zs1: {
    big: 'Finance is about making the owners richer by deciding where money comes from and where it goes, and doing it in a way that is honest and fair to everyone involved.',
    parts: [
      { h: 'What the finance manager does', li: ['Decides <b>which investments</b> to make (machines, projects, other companies) and <b>how to pay</b> for them (debt or equity).', 'Manages the day-to-day money: cash, stock, receivables, payables.', 'Accounting records what happened (<b>accrual basis</b>: revenue when you sell, not when you are paid). Finance looks at <b>cash</b>: money actually in and out. A firm can show a profit and still run out of cash.'] },
      { h: 'The goal', li: ['Goal = <b>maximise shareholder wealth</b>, i.e. the share price. This is NOT the same as maximising profit. Profit ignores <b>timing</b> (money now is worth more than later), <b>cash flows</b> and <b>risk</b>.', 'Stakeholders (workers, customers, suppliers, the community) matter too. Treating them well protects long-run value.', 'Ethics: unethical behaviour destroys value through fines, lost trust and a lower share price.'] },
      { h: 'Legal forms', li: ['<b>Sole proprietorship</b>: one owner, unlimited liability, simple.', '<b>Partnership</b>: two or more owners, unlimited liability (except limited partners).', '<b>Corporation</b> (NV/BV): owners have <b>limited liability</b>, easy to raise money and sell shares, but profits are taxed twice (company tax + tax on dividends).'] },
      { h: 'Agency problem', li: ['Managers (agents) may act for themselves instead of the owners (principals).', 'Fixes: <b>corporate governance</b> (board, rules), pay linked to the share price (stock options), and market pressure (takeover threat, activist investors).', 'Agency <b>costs</b> = the cost of monitoring managers plus the value lost when they misbehave.'] },
      { h: 'Taxes', li: ['<b>Average</b> tax rate = total tax ÷ income. <b>Marginal</b> tax rate = tax on the <i>next</i> euro. Decisions use the marginal rate.', 'Interest is tax-deductible; dividends are not. That makes debt cheaper.'] }
    ],
    remember: ['Shareholder wealth ≠ profit (timing, cash, risk).', 'Accrual (accounting) vs cash (finance).', 'Corporation = limited liability but double taxation.', 'Agency problem → governance + incentive pay.']
  },

  zs2: {
    big: 'Firms get money from savers either through banks (institutions) or directly in markets; this chapter explains who is who and how shares and bonds are sold.',
    parts: [
      { h: 'Institutions', li: ['Banks, insurers, pension funds and mutual funds collect savings and lend or invest them.', '<b>Shadow banking</b>: lending done outside normal regulated banks.', 'Households are net <b>savers</b>; firms and governments are net <b>borrowers</b>.'] },
      { h: 'Markets', li: ['<b>Money market</b>: short-term (under 1 year) debt such as T-bills and commercial paper. <b>Capital market</b>: long-term bonds and shares.', '<b>Primary market</b>: a security is sold for the first time and the firm gets the money (IPO). <b>Secondary market</b>: investors trade existing securities with each other; the firm gets nothing.', 'Broker markets (exchanges) vs dealer markets (OTC, dealers quote a <b>bid</b> (they buy) and an <b>ask</b> (they sell); the difference is the <b>spread</b>).', 'International: <b>Eurobond</b> = a bond in a currency other than the currency of the country where it is sold; <b>foreign bond</b> = a bond in the local currency issued by a foreign firm.'] },
      { h: 'Issuing shares', li: ['Start-ups use <b>angels</b> and <b>venture capital</b>.', 'An IPO uses an <b>investment bank</b> that <b>underwrites</b> (buys the issue and resells it, taking the risk). The <b>red herring</b> is the first prospectus without the final price.', '<b>Rights offering</b>: existing shareholders get to buy new shares first, so they are not diluted. <b>Private placement</b>: sold straight to a few big investors.'] },
      { h: 'Regulation & efficiency', li: ['Regulators (SEC in the US, AFM in NL) force disclosure so markets are fair.', '<b>Efficient market</b>: prices quickly reflect all information, so they move randomly (random walk). <b>Behavioural finance</b> says people make systematic mistakes, so prices can be wrong for a while.'] }
    ],
    remember: ['Primary = firm gets money; secondary = investors trade.', 'Money market < 1 year; capital market > 1 year.', 'Bid = dealer buys, ask = dealer sells, spread = ask − bid.', 'Rights offering protects existing owners from dilution.']
  },

  zs3: {
    big: 'The four financial statements show what a firm earned, owns and owes; ratios turn those numbers into comparisons you can actually judge.',
    parts: [
      { h: 'The four statements', li: ['<b>Income statement</b>: revenue − costs = profit over a period.', '<b>Balance sheet</b>: assets = liabilities + equity at one moment.', '<b>Statement of retained earnings</b>: opening RE + net income − dividends = closing RE.', '<b>Cash flow statement</b>: operating, investing and financing cash flows.', 'The notes explain the methods used. Rules: GAAP (US) or IFRS (EU).'] },
      { h: 'How to use ratios', li: ['A ratio alone means nothing. Compare it with <b>other firms</b> (cross-sectional, benchmarking) and with <b>earlier years</b> (time-series), or both (combined).', 'Watch out: inflation, different accounting methods, seasonal businesses, and one-off events distort ratios.'] },
      { h: 'Five groups of ratios', li: ['<b>Liquidity</b>: can it pay short-term bills? Current ratio = CA/CL; quick ratio = (CA − inventory)/CL.', '<b>Activity</b>: how fast does stuff move? Inventory turnover = COGS/inventory; ACP = A/R ÷ (sales/365); APP = A/P ÷ (purchases/365); total asset turnover = sales/total assets.', '<b>Debt</b>: how much is borrowed? Debt ratio = total liabilities/total assets; TIE = EBIT/interest.', '<b>Profitability</b>: gross, operating and net margin; ROA = net income/total assets; ROE = earnings for common/common equity; EPS.', '<b>Market</b>: P/E = price/EPS; market-to-book.'] }
    ],
    example: { q: 'A firm has current assets 500, inventory 200 and current liabilities 250. What are the current and quick ratios?', steps: ['Current ratio = CA / CL = 500 / 250 = <b>2.0</b>.', 'Quick ratio = (CA − inventory) / CL = (500 − 200) / 250 = 300 / 250 = <b>1.2</b>.', 'Meaning: without selling any stock the firm can still cover its short-term debts 1.2 times.'] },
    remember: ['DuPont is NOT exam material.', 'Always compare a ratio with something (other firms or other years).', 'ACP uses sales; APP uses purchases.']
  },

  zs15: {
    big: 'Working capital is the money tied up in running the business day to day; the cash conversion cycle shows how many days your cash is stuck before it comes back.',
    parts: [
      { h: 'Net working capital', li: ['NWC = current assets − current liabilities.', '<b>Trade-off</b>: more current assets = safer (less risk of not paying bills) but less profitable (current assets earn little). Fewer current assets = more profitable but riskier.'] },
      { h: 'Cash conversion cycle', li: ['<b>Operating cycle</b> (OC) = AAI + ACP: days to sell the stock + days to collect from customers.', '<b>CCC</b> = OC − APP = AAI + ACP − APP. You subtract the days the supplier lets you wait.', 'Shorter CCC = less money to finance = cheaper. Ways: sell stock faster, collect faster, pay later (without hurting your credit).', 'Resources needed = inventory + receivables − payables (in money, not days).'] },
      { h: 'Funding the cycle', li: ['Part of the need is <b>permanent</b> (always there); part is <b>seasonal</b>.', '<b>Aggressive</b> strategy: seasonal need with short-term debt, permanent need with long-term. Cheaper but riskier (you must keep rolling over loans).', '<b>Conservative</b> strategy: everything, including the seasonal peak, with long-term money. Safer but more expensive (you pay interest on money you sometimes don\'t need).'] }
    ],
    example: { q: 'AAI = 60 days, ACP = 40 days, APP = 35 days. What is the CCC?', steps: ['Operating cycle = AAI + ACP = 60 + 40 = 100 days.', 'CCC = OC − APP = 100 − 35 = <b>65 days</b>.', 'Meaning: from paying the supplier to getting the customer\'s money takes 65 days, and you must finance those 65 days.'] },
    remember: ['CCC = AAI + ACP − APP.', 'Aggressive = cheap + risky; conservative = safe + expensive.', 'Section 15.3 (inventory) is skipped.']
  },

  zs15b: {
    big: 'Decide who gets credit and on what terms, then collect fast and pay slowly (but on time) to keep cash in the firm.',
    parts: [
      { h: 'Giving credit', li: ['<b>Credit standards</b>: who is allowed to buy on credit (use credit scoring and the 5 C\'s).', 'Looser standards → more sales and profit, but also more bad debts and higher receivables to finance. Do it only if the extra profit beats the extra costs.', 'Course method: net effect = Δ contribution margin − Δ bad debts (and discounts) − cost of the extra receivables (ΔA/R × required return).'] },
      { h: 'Credit terms', li: ['"2/10 net 30": 2% discount if paid within 10 days, otherwise the full amount within 30 days.', 'A <b>cash discount</b> makes customers pay faster (lower ACP) but you give away part of the price.', 'Longer credit period → more sales but slower payment.'] },
      { h: 'Monitoring & collecting', li: ['Watch the <b>ACP</b> and the <b>aging schedule</b> (which % of receivables is 0–30, 31–60… days old).', 'Collection steps, from soft to hard: letters → phone calls → personal visits → collection agency → legal action.'] },
      { h: 'Cash in and cash out', li: ['<b>Float</b> = money sent but not yet usable. Mail float, processing float and clearing float.', 'Speed up receipts: <b>lockbox</b> (customers pay to a bank box near them), electronic payments, <b>cash concentration</b> into one account.', 'Slow down payments (legally): controlled disbursing, <b>zero-balance accounts</b>.', 'Spare cash goes into safe, liquid <b>marketable securities</b>.'] }
    ],
    remember: ['Looser credit: compare extra profit with extra bad debts + discount cost + cost of extra A/R.', 'Aging schedule shows how old receivables are.', 'Collect fast, pay late but on time.']
  },

  zs16: {
    big: 'Short-term money can come almost for free (suppliers and accruals) or cost interest (bank loans, commercial paper); always compare the effective cost, not the stated rate.',
    parts: [
      { h: 'Free (spontaneous) financing', li: ['<b>Accounts payable</b> (trade credit) and <b>accruals</b> (wages and taxes you owe but haven\'t paid yet) grow automatically with sales and cost no interest.', 'If a supplier offers a discount, giving it up has a cost. Course formula (approximate): CD/(100 − CD) × 365/N, with N = days you gain by not taking the discount.', 'Rule: if that cost is higher than your bank rate, <b>take the discount</b> (borrow from the bank to pay early).'] },
      { h: 'Bank loans (unsecured)', li: ['Rate = <b>prime</b> + a spread. Fixed or floating.', '<b>Single-payment note</b>: one loan, paid back in one go.', '<b>Line of credit</b>: maximum you can borrow; not guaranteed. May include a <b>compensating balance</b> (cash you must keep at the bank) and an <b>annual cleanup</b>.', '<b>Revolving credit</b>: a guaranteed line; you pay a <b>commitment fee</b> on the unused part.', '<b>Discount loan</b>: interest taken off at the start, so you get less money and the effective rate is higher.'] },
      { h: 'Commercial paper', li: ['Short-term (up to 270 days) IOUs sold by big, strong firms. Sold below face value; usually cheaper than a bank loan.'] },
      { h: 'Secured loans', li: ['Collateral = receivables or inventory. <b>Pledging</b> receivables (they stay yours) vs <b>factoring</b> (you sell them).', 'Inventory loans: floating lien, trust receipt (e.g. cars at a dealer), warehouse receipt.'] }
    ],
    example: { q: 'Terms 2/10 net 30, bank rate 12%. Take the discount or not?', steps: ['CD = 2%, N = 30 − 10 = 20 days.', 'Cost = 2/(100 − 2) × 365/20 = 0.02041 × 18.25 = <b>37.24%</b>.', '37.24% > 12%, so it is cheaper to borrow at the bank and <b>take the discount</b>.'] },
    remember: ['Effective rate = what you pay ÷ money you can actually use.', 'Use the formula sheet, not the book, for the discount cost.', 'Compensating balance and discount loans raise the effective rate.']
  },

  zs125: {
    big: 'Fixed costs make profit swing more than sales: that is leverage. Break-even analysis tells you how much you must sell before you make any profit.',
    parts: [
      { h: 'Break-even', li: ['Operating break-even (units) = fixed costs ÷ (price − variable cost per unit).', 'Price − variable cost = <b>contribution margin</b> per unit: what each unit adds to cover fixed costs.', 'More fixed costs → higher break-even. Higher price or lower variable cost → lower break-even.'] },
      { h: 'Operating leverage (DOL)', li: ['DOL = % change in EBIT ÷ % change in sales = contribution margin ÷ EBIT.', 'Higher fixed costs → higher DOL → EBIT reacts more strongly to sales, both up and down.', 'DOL is highest close to break-even.'] },
      { h: 'Project risk tools', li: ['<b>Break-even cash inflow</b>: the yearly cash flow that makes NPV = 0.', '<b>Sensitivity analysis</b>: change ONE input at a time and see how NPV moves.', '<b>Scenario analysis</b>: change several inputs together (worst / likely / best); range = best NPV − worst NPV.'] }
    ],
    example: { q: 'Price €10, variable cost €5, fixed costs €2,500, sales 1,000 units. Break-even and DOL?', steps: ['Contribution margin per unit = 10 − 5 = €5.', 'Break-even = 2,500 / 5 = <b>500 units</b>.', 'At 1,000 units: total CM = 1,000 × 5 = €5,000; EBIT = 5,000 − 2,500 = €2,500.', 'DOL = CM / EBIT = 5,000 / 2,500 = <b>2</b>. So +10% sales gives +20% EBIT.'] },
    remember: ['DOL = CM / EBIT.', 'Fixed costs = leverage = more risk.', 'Sensitivity = one input; scenario = several at once.']
  },

  zs131: {
    big: 'Borrowing makes good years better and bad years worse for shareholders; whether it is worth it depends on whether the firm earns more on its assets than the debt costs.',
    parts: [
      { h: 'Financial leverage', li: ['Debt brings a <b>fixed</b> cost (interest). That fixed cost magnifies changes in EBIT into bigger changes in EPS.', 'DFL = % change in EPS ÷ % change in EBIT = EBIT ÷ (EBIT − interest − preferred dividends/(1 − T)).', 'Course version: DFL = EBIT / (EBT − PD/(1 − T)).'] },
      { h: 'When is debt good for shareholders?', li: ['If the return on assets is <b>higher</b> than the interest rate, borrowing raises EPS and ROE. If it is lower, borrowing hurts.', 'The break point (indifference point): EBIT where EPS is the same with or without debt = interest rate × total assets.', 'Debt always raises <b>risk</b> (financial risk), so shareholders want a higher return. Modigliani & Miller: in a perfect market without taxes, both effects cancel out and capital structure does not change firm value.'] },
      { h: 'Debt vs equity in short', li: ['Debt: cheaper, interest is tax-deductible, no dilution of control; but fixed payments and bankruptcy risk.', 'Equity: no fixed payments; but more expensive and dilutes ownership.', '<b>Total leverage</b> DTL = DOL × DFL.'] }
    ],
    example: { q: 'Firm worth €180m, 1m shares, EBIT €18m, no tax. It borrows €90m at 7% and buys back half the shares. EPS?', steps: ['Interest = 90m × 7% = €6.3m.', 'Profit = 18m − 6.3m = €11.7m.', 'Shares left = 1m − 0.5m = 0.5m.', 'EPS = 11.7m / 0.5m = <b>€23.40</b> (vs 18m / 1m = €18 without debt).', 'Indifference EBIT = 7% × 180m = €12.6m. Above it debt helps, below it debt hurts.'] },
    remember: ['Debt helps EPS only if return on assets > interest rate.', 'DTL = DOL × DFL.', 'More debt = higher expected EPS AND higher risk.']
  },

  zs95: {
    big: 'The WACC is the average rate the firm pays for all its money; a project must earn more than this to create value.',
    parts: [
      { h: 'The formula', li: ['WACC = w<sub>d</sub> × r<sub>d</sub> × (1 − T) + w<sub>p</sub> × r<sub>p</sub> + w<sub>s</sub> × r<sub>s</sub>.', 'Weights w = share of debt, preferred stock and common equity in total capital; they add up to 1.', 'Only debt is multiplied by (1 − T), because interest is tax-deductible.'] },
      { h: 'Which weights?', li: ['The book prefers <b>market values</b> (and the target mix).', '<b>Course/exam</b>: use <b>book values</b> from the balance sheet and r<sub>d</sub> = interest on LT debt ÷ LT debt.'] },
      { h: 'Using it', li: ['WACC = <b>hurdle rate</b>: accept projects that earn more.', 'Only valid for projects as risky as the firm\'s average. Riskier project → use a higher rate.'] }
    ],
    example: { q: 'Weights: debt 40%, preferred 10%, equity 50%. After-tax cost of debt 4.88%, preferred 8.26%, equity 13%. WACC?', steps: ['Debt part = 0.40 × 4.88% = 1.95%.', 'Preferred part = 0.10 × 8.26% = 0.83%.', 'Equity part = 0.50 × 13% = 6.50%.', 'WACC = 1.95 + 0.83 + 6.50 = <b>9.28%</b>.'] },
    remember: ['Only debt gets (1 − T).', 'Exam: book-value weights.', 'WACC = minimum return for an average-risk project.']
  },

  zs19: {
    big: 'Doing business abroad adds currency risk, political risk and extra tax and accounting rules on top of normal finance.',
    parts: [
      { h: 'The environment', li: ['Trade blocs (EU, USMCA, Mercosur, ASEAN) and the WTO set trade rules.', '<b>Joint ventures</b> with local partners are common in emerging markets; they reduce political risk but you lose some control.', 'Taxes differ per country; tax treaties prevent double taxation (foreign tax becomes a credit at home, but home tax cannot go below zero).', '<b>Euromarket</b>: borrowing and lending a currency outside its home country.'] },
      { h: 'Translating a foreign subsidiary', li: ['<b>All-current-rate method</b>: balance sheet at the year-end rate, income statement at the average rate; the difference goes into equity (not profit).', '<b>Temporal method</b>: some items at historical rates; the difference goes into profit. Used when the subsidiary is an extension of the parent or in hyperinflation.'] },
      { h: 'Exchange rates', li: ['Spot = today; forward = a rate fixed now for later.', 'Read the units: €/£ = euros per 1 pound. If €/£ goes from 1.15 to 1.10, the pound got weaker.', '<b>PPP</b>: the country with higher inflation sees its currency fall. <b>Interest rate parity</b>: higher interest abroad is cancelled out by the forward rate.', '<b>Accounting exposure</b> = statement values change; <b>economic exposure</b> = firm value changes. Hedge with forwards, options or money market deals.'] },
      { h: 'Political risk', li: ['<b>Macro</b> = hits all foreign firms in the country (e.g. a revolution). <b>Micro</b> = hits one firm, industry or nationality.'] }
    ],
    example: { q: 'You will receive $100,000. The rate moves from 1.11 $/€ to 1.09 $/€. How many euros do you get before and after?', steps: ['$/€ = dollars per 1 euro, so divide dollars by the rate.', 'Before: 100,000 / 1.11 = <b>€90,090</b>.', 'After: 100,000 / 1.09 = <b>€91,743</b>.', 'The euro got weaker (fewer dollars per euro), so the same dollars buy more euros.'] },
    remember: ['Always check which currency is on top.', 'Higher inflation → weaker currency (PPP).', 'All-current-rate: differences go to equity.']
  },

  l1: {
    big: 'A supply chain is all the companies and steps from raw material to final customer; managing it well saves cost, frees cash and keeps customers happy.',
    parts: [
      { h: 'Why supply chains changed', li: ['Six change drivers: <b>globalisation</b>, <b>technology</b>, <b>consolidation and power shifts</b> (big retailers like Walmart and Amazon call the shots), <b>empowered consumers</b>, <b>government policy and regulation</b>, and <b>sustainability</b>.'] },
      { h: 'How the idea grew', li: ['1960s <b>physical distribution</b> (outbound only) → 1980s <b>integrated logistics</b> (inbound + outbound) → 1990s+ <b>supply chain management</b> (all partners together).', 'Logistics is one part of SCM: moving and storing goods. SCM also covers relationships, information and money.'] },
      { h: 'Four flows', li: ['<b>Products/services</b> (mostly downstream), <b>information</b> (both ways), <b>cash</b> (mostly upstream) and <b>demand</b> (orders from customers).'] },
      { h: 'Major issues', li: ['Network design, complexity, where to hold inventory, information sharing, cost and value, relationships, performance measurement, technology, transport, security, and talent.', 'Avoid <b>sub-optimisation</b>: saving in one department while costing the whole chain more.', '<b>Bullwhip effect</b>: small changes in customer demand become huge swings upstream. Fix it by sharing real demand data.'] }
    ],
    remember: ['Six change drivers.', 'PD → integrated logistics → SCM.', 'Four flows: product, information, cash, demand.', 'Supply chain affects cash flow and working capital (link to finance).']
  },

  l2: {
    big: 'Countries trade because each is better at making certain things; global supply chains follow population, resources and technology, and must balance speed with security.',
    parts: [
      { h: 'Why trade', li: ['<b>Absolute advantage</b>: you make something more efficiently than others.', '<b>Comparative advantage</b>: even if you are better at everything, specialise in what you are <i>relatively</i> best at; both sides gain.'] },
      { h: 'What shapes global commerce', li: ['<b>Population</b>: size, ageing, growth in emerging countries, and <b>urbanisation</b> (people moving to cities).', '<b>Land and resources</b>: where raw materials are.', '<b>Technology</b>: inside firms (efficiency) and outside (internet makes markets global).'] },
      { h: 'Trade flows & strategy', li: ['The EU as a bloc exports most; China is the biggest single exporter; the US is the biggest net importer.', 'Global strategies have to deal with longer lead times, more stock, more risk and more paperwork.'] },
      { h: 'Security, ports, agreements', li: ['After 9/11 security got stricter. <b>C-TPAT</b>: certified "safe" firms get faster customs (<b>green lanes</b>). It is a balancing act between security and speed.', '<b>Ports</b> are key bottlenecks.', 'Free trade agreements (bilateral or regional, e.g. USMCA, the old NAFTA) lower tariffs and paperwork.'] }
    ],
    remember: ['Comparative advantage is the key reason to trade.', 'Security vs speed trade-off (C-TPAT).', 'Don\'t memorise the tables, know the trends.']
  },

  l3: {
    big: 'Logistics adds value by getting the right product to the right place at the right time in the right amount; it is a system where saving in one area often costs more in another.',
    parts: [
      { h: 'Value logistics creates (utilities)', li: ['<b>Form</b>: the product is made or changed (mostly production).', '<b>Place</b>: available where the customer is (transport).', '<b>Time</b>: available when needed (storage, inventory).', '<b>Quantity</b>: the right amount.', '<b>Possession</b>: the customer can buy and own it (marketing, credit).'] },
      { h: 'Activities', li: ['Transport, storage, packaging, materials handling, inventory control, order fulfilment, forecasting, production planning, procurement, customer service, facility location.'] },
      { h: 'Interfaces', li: ['With <b>manufacturing</b>: long production runs are cheap but create stock.', 'With <b>marketing</b>: the 4 P\'s; logistics is the "place" part. Customer service is the bridge.'] },
      { h: 'Cost factors', li: ['<b>Competitive</b>: order cycle length, substitutability, inventory effect, transport effect.', '<b>Product</b>: density, value, fragility, special handling.', '<b>Spatial</b>: distance between plants, warehouses and markets.'] },
      { h: 'Analysis techniques', li: ['<b>Cost centres</b> (total cost approach): compare the total of transport + inventory + packaging + warehousing, not one cost.', '<b>Short-run (static)</b>: compare systems at one output level. <b>Long-run (dynamic)</b>: compare over a range of volumes to find where one system becomes cheaper.', 'Network view: <b>nodes</b> (places where goods stop) and <b>links</b> (transport between them).'] }
    ],
    example: { q: 'Rail: transport €3.00 + inventory €5.00 + packaging €3.50 + warehousing €1.50 per unit. Truck: €4.30 + €3.75 + €3.20 + €0.75. Which is cheaper?', steps: ['Rail total = 3.00 + 5.00 + 3.50 + 1.50 = €13.00.', 'Truck total = 4.30 + 3.75 + 3.20 + 0.75 = €12.00.', 'Truck transport is more expensive, but the total is lower, so <b>truck wins by €1.00 per unit</b>. That is the total cost idea.'] },
    remember: ['Five utilities: form, place, time, quantity, possession.', 'Always look at the total cost.', 'Static = one volume; dynamic = range of volumes.']
  },

  l5: {
    big: 'Buying is strategic: classify what you buy by risk and value, follow a clear sourcing process, pick suppliers on more than price, and compare suppliers on total landed cost.',
    parts: [
      { h: 'Words', li: ['<b>Purchasing</b> = the buying transaction. <b>Procurement</b> = the whole buying process. <b>Strategic sourcing</b> = long-term, cross-functional planning of what to buy and from whom.'] },
      { h: 'Quadrant technique (risk × value)', li: ['<b>Generics</b>: low risk, low value (office supplies) → keep it simple and cheap.', '<b>Commodities</b>: low risk, high value (fuel, steel) → use buying power and price.', '<b>Distinctives</b>: high risk, low value (special spare parts) → secure supply, standardise.', '<b>Criticals</b>: high risk, high value (engines) → close partnerships.'] },
      { h: 'Strategic sourcing process (MSSP)', li: ['1 strategic plan → 2 understand spend → 3 evaluate supply sources → 4 finalise strategy → 5 implement → 6 transition/onboarding → 7 continuous improvement.', 'Types of buys: capital goods, standard or modified <b>rebuys</b>, and MRO.'] },
      { h: 'Choosing suppliers', li: ['Funnel: research → RFI → RFP → selection → site visits.', 'Criteria: quality (usually #1), reliability, risk, capability, financial, sustainability. Certificates: TQM, Six Sigma, ISO 9000, Lean.'] },
      { h: 'Total landed cost', li: ['TLC = purchase price + transport + insurance + duties + inventory/handling + other costs to get it to your door.', 'The cheapest price is often NOT the cheapest supplier once everything is added.', 'E-sourcing: online marketplaces, reverse auctions, e-procurement.'] }
    ],
    example: { q: 'Supplier A: price €10.00, freight €1.20, duty 5% of price. Supplier B: price €10.80, freight €0.30, no duty. Which has the lower landed cost per unit?', steps: ['A: duty = 5% × 10.00 = €0.50; TLC = 10.00 + 1.20 + 0.50 = €11.70.', 'B: TLC = 10.80 + 0.30 + 0 = €11.10.', 'B is <b>€0.60 cheaper</b> although its price is higher.'] },
    remember: ['Generics / commodities / distinctives / criticals.', 'Seven MSSP steps.', 'Compare total landed cost, not price.']
  },

  l9: {
    big: 'Inventory protects you against uncertainty but costs money to hold; the job is to hold just enough, ordering the right amount at the right time.',
    parts: [
      { h: 'Why hold stock (types)', li: ['<b>Cycle stock</b> (normal demand between orders), <b>safety stock</b> (buffer for uncertainty), <b>in-transit</b> (on the move), <b>work-in-process</b>, <b>seasonal</b> and <b>anticipatory</b> (expected price rise or strike).'] },
      { h: 'Costs', li: ['<b>Carrying cost</b> (% of value per year): capital cost (biggest part), storage space, service (insurance, taxes), risk (obsolescence, damage, theft).', '<b>Ordering/setup cost</b>: per order.', '<b>Stockout cost</b>: lost sales, lost customers, stopped production.', 'Bigger orders → lower ordering cost but higher carrying cost. EOQ finds the balance.'] },
      { h: 'Approaches', li: ['<b>EOQ / reorder point</b>: fixed quantity, independent demand, pull.', '<b>Fixed interval</b>: order every X weeks; the quantity varies.', '<b>JIT</b>: tiny stock, frequent deliveries, close suppliers, top quality.', '<b>MRP</b> (dependent demand, parts for production) and <b>DRP</b> (distribution), both push. <b>VMI</b>: the supplier manages your stock.'] },
      { h: 'Classifying', li: ['<b>ABC</b> (Pareto 80/20): A = few items with most of the value, so control them tightly; C = many cheap items, so keep control simple.'] }
    ],
    example: { q: 'Annual demand 3,600 units, order cost €200, unit value €100, carrying cost 25%. EOQ?', steps: ['Carrying cost per unit = 100 × 25% = €25 per year.', 'EOQ = √(2 × 3,600 × 200 / 25) = √(1,440,000 / 25) = √57,600 = <b>240 units</b>.', 'Orders per year = 3,600 / 240 = 15; ordering cost = 15 × 200 = €3,000; carrying cost = 240/2 × 25 = €3,000; total = €6,000.'] },
    remember: ['Six types of stock.', 'Carrying cost has four parts; capital cost is the largest.', 'At the EOQ, ordering cost = carrying cost.', 'Independent demand → EOQ; dependent → MRP.']
  },

  l11: {
    big: 'Transport links every part of the supply chain; pick the mode and carrier that give the best total cost and service, agree who pays and owns the goods, and measure carrier performance.',
    parts: [
      { h: 'Five modes + intermodal', li: ['<b>Truck</b>: goes everywhere, fast, reliable; expensive, small loads. TL vs LTL.', '<b>Rail</b>: cheap for heavy, bulky goods over long distances; slow, more damage.', '<b>Air</b>: fastest, safe; most expensive, small volumes.', '<b>Water</b>: cheapest for huge volumes and international; slow.', '<b>Pipeline</b>: liquids and gas, very cheap and reliable, but only where pipes are.', '<b>Intermodal</b>: two or more modes with containers (e.g. ship + truck).'] },
      { h: 'Planning decisions (in order)', li: ['Who controls transport → <b>terms of sale (FOB)</b> → outsource or private fleet → mode → carrier → negotiate rates.', '<b>FOB origin</b>: the buyer owns the goods from the moment they leave; <b>FOB destination</b>: the seller owns them until they arrive. "Freight collect/prepaid" says who pays the carrier.', 'Internationally: Incoterms; helpers are freight forwarders, NVOCCs and customs brokers.'] },
      { h: 'Execution', li: ['Documents: <b>bill of lading</b> (contract, receipt, sometimes title), <b>freight bill</b> (invoice), <b>freight claim</b> (for loss or damage).', 'Track shipments (visibility), measure KPIs (on-time %, damage %, cost per unit) and use a <b>weighted scorecard</b> to rate carriers.', 'A <b>TMS</b> (software) plans, executes and checks transport.'] }
    ],
    example: { q: 'Scorecard: on-time weight 35 (score 4), damage weight 30 (score 5), billing weight 15 (score 3), service weight 20 (score 4). Total out of 500?', steps: ['On-time: 35 × 4 = 140.', 'Damage: 30 × 5 = 150.', 'Billing: 15 × 3 = 45.', 'Service: 20 × 4 = 80.', 'Total = 140 + 150 + 45 + 80 = <b>415 / 500</b> (83%).'] },
    remember: ['Strengths and weaknesses of each mode.', 'FOB origin = the buyer owns the goods in transit; FOB destination = the seller does.', 'Bill of lading ≠ freight bill.']
  }
  };
})(typeof window !== 'undefined' ? window : globalThis);
