/* Summaries of every assigned reading, written for this site (not copied from the books).
   Course methods only (formula sheet + seminar slides), focused on what the two mock exams ask.
   Shape: { exec: [paragraphs], big, parts: [{h, li[]}], example?: {q, steps[]}, remember: [] } */
(function (root) {
  root.FSM_SUMMARIES = {

  zs1: {
    exec: [
      'This chapter explains what a financial manager does and why. Every company has to decide two things: what to invest in (machines, stock, other companies) and how to pay for it (borrowing or getting money from owners). The financial manager makes those decisions, and also handles the daily money of the firm: cash, inventory, receivables and payables.',
      'The goal is to <b>maximise shareholder wealth</b>, which in practice means a higher share price. That is not the same as maximising profit. Profit ignores when the money arrives, ignores whether it is actual cash, and ignores risk. A plan that gives a bit less profit but more certain and earlier cash can be worth more to the owners. Finance therefore looks at <b>cash</b>, while accounting records profit on an <b>accrual basis</b> (sales are counted when you sell, not when the customer pays). That is why a profitable company can still run out of cash.',
      'The chapter then compares the legal forms of a business. A sole proprietorship and a partnership are simple, but the owners are personally liable for all debts. A <b>corporation</b> (in the Netherlands a B.V. or N.V., in Germany a GmbH or AG) is a separate legal person. Its owners can lose only what they invested (<b>limited liability</b>), shares are easy to sell or pass on, the company keeps existing when owners change, and it can raise large amounts of money from many investors. The downside is <b>double taxation</b>: the company pays corporate tax on its profit, and then the shareholders pay tax again on the dividend (in the mock: 15% dividend withholding tax).',
      'Finally, owners and managers are not always the same people. Managers (agents) may follow their own interest instead of the owners\' (principals). This is the <b>agency problem</b>. It is limited by corporate governance (a board that supervises), by paying managers in shares or options so their interests line up with the owners, and by outside pressure such as takeover threats. Keep in mind that ethical behaviour also protects the share price.'
    ],
    big: 'Make the owners richer by deciding where money comes from and where it goes, honestly and with an eye on cash, timing and risk.',
    parts: [
      { h: 'Key points', li: ['Goal = maximise shareholder wealth (share price), not profit.', 'Accrual (accounting) vs cash (finance).', 'Corporation: limited liability, easy transfer of shares, unlimited life, easy to raise capital; but double taxation.', 'Agency problem → governance + incentive pay + market pressure.', 'Average tax rate = total tax ÷ income; marginal rate = tax on the next euro. Interest is tax-deductible, dividends are not.'] }
    ],
    example: { q: 'Mock-style: a B.V. earns €1,000,000 before tax and pays all of it out as dividends. Corporate tax is 25%; dividend withholding tax is 15%. What is the effective tax rate on the distributed profit?', steps: ['Corporate tax = 1,000,000 × 25% = <b>€250,000</b>.', 'Profit left to pay out = 1,000,000 − 250,000 = €750,000.', 'Withholding tax on the dividend = 750,000 × 15% = <b>€112,500</b>.', 'Total tax = 250,000 + 112,500 = €362,500.', 'Effective tax rate = 362,500 ÷ 1,000,000 = <b>36.25%</b>.'] },
    remember: ['Three features of a corporation that the exam wants: limited liability, easy transfer of ownership, unlimited life / easy to raise capital.', 'Double taxation = corporate tax + tax on dividends.', 'Use the tax rate given in the case.']
  },

  zs2: {
    exec: [
      'Companies get money from people who save. That can go through a <b>financial institution</b> (a bank, insurer or pension fund collects savings and lends or invests them) or directly through a <b>financial market</b>, where the company sells shares or bonds to investors. Households are usually net savers; companies and governments are net borrowers.',
      'Markets are split in two ways. The <b>money market</b> is for short-term debt (less than a year); the <b>capital market</b> is for long-term bonds and shares. More important for the exam is the split between the <b>primary market</b> and the <b>secondary market</b>. In the primary market a security is sold for the first time and the money goes to the company. In the secondary market investors trade existing shares with each other; the company receives nothing. So only steps where the company itself issues new shares or borrows actually <b>raise funds for the company</b>. An owner selling part of his stake, or an IPO in which no new shares are issued, does not.',
      'On a <b>dealer market</b> a dealer quotes two prices. The <b>bid</b> is what the dealer pays you when you sell; the <b>ask</b> is what you pay when you buy. The difference is the <b>bid-ask spread</b>, the dealer\'s income. On the formula sheet, the effective transaction cost = number of shares × ½ × spread + brokerage commission. You use half the spread because the "true" price lies in the middle.',
      'The chapter also explains how a firm grows its funding: founders first, then angel investors and venture capital, then private placements with a few investors, and finally an IPO with the help of an investment bank. Regulation forces companies to publish information so investors can trust the market.'
    ],
    big: 'Firms raise money in the primary market; investors trade in the secondary market. Know the bid/ask logic and which steps bring cash into the company.',
    parts: [
      { h: 'Key points', li: ['Primary market = company gets the money (new shares, new debt). Secondary market = investors trade; company gets nothing.', 'Bid = dealer buys from you; ask = dealer sells to you; spread = ask − bid.', 'Effective transaction cost = shares × ½ × spread + commission.', 'Money market < 1 year; capital market > 1 year.', 'Venture capital and angels fund young firms; investment banks underwrite IPOs.'] }
    ],
    example: { q: 'Mock 2 style: bid €38.20, ask €38.50, you buy 200 shares, no commission. Total paid and effective transaction cost?', steps: ['You buy at the ask: 200 × 38.50 = <b>€7,700</b>.', 'Spread = 38.50 − 38.20 = €0.30.', 'Effective transaction cost = 200 × ½ × 0.30 + 0 = <b>€30</b>.', 'Which steps raise funds? Founders investing (money goes into the company) and issuing new shares to investors: yes. Family selling existing shares to a VC, or an IPO with no new shares: no, the money goes to the sellers.'] },
    remember: ['Buy at the ask, sell at the bid.', 'Only new shares or new debt raise money for the company.', 'Half the spread × number of shares.']
  },

  zs3: {
    exec: [
      'This chapter is about reading a company\'s financial statements and turning them into ratios. The <b>income statement</b> shows revenue, costs and profit over a year. The <b>balance sheet</b> shows what the company owns (assets) and how it is financed (liabilities and equity) on one date. The <b>statement of retained earnings</b> links the two: retained earnings at the start + net profit − dividends = retained earnings at the end. The <b>cash flow statement</b> shows where cash came from and went.',
      'A ratio on its own says little. You learn something by comparing: with other firms in the same industry, or with the same firm in earlier years. Ratios fall into five groups. <b>Liquidity</b> ratios ask whether the firm can pay its short-term bills. <b>Activity</b> ratios ask how quickly inventory is sold, customers pay and suppliers are paid. <b>Debt</b> ratios ask how much of the firm is financed by borrowing. <b>Profitability</b> ratios compare profit with sales, assets or equity. <b>Market</b> ratios compare the share price with earnings or book value.',
      'For the exam, the most important ratios are the activity ratios, because they feed the cash conversion cycle (next week). Note how the formula sheet defines them: inventory turnover uses <b>average</b> inventory, ACP uses <b>average</b> receivables and <b>credit</b> sales, and APP uses <b>average</b> payables and <b>credit purchases</b>. In a case with two balance sheets, average = (last year + this year) ÷ 2. Use earnings available for common stockholders (net profit − preferred dividends) for EPS, ROA and ROE. The DuPont system is not exam material.'
    ],
    big: 'Statements show what happened; ratios turn the numbers into comparisons you can judge.',
    parts: [
      { h: 'Key formulas (formula sheet)', li: ['Current ratio = CA ÷ CL; quick ratio = (CA − inventory) ÷ CL.', 'Inventory turnover = COGS ÷ average inventory; AAI = 365 ÷ turnover.', 'ACP = average A/R ÷ (credit sales ÷ 365); APP = average A/P ÷ (credit purchases ÷ 365).', 'Debt ratio = total liabilities ÷ total assets; TIE = EBIT ÷ interest.', 'ROA = earnings for common ÷ total assets; ROE = earnings for common ÷ common equity; EPS = earnings for common ÷ number of common shares.'] }
    ],
    example: { q: 'Inventory was €13m last year and €15m this year; COGS is €49.5m. What are inventory turnover and AAI?', steps: ['Average inventory = (13 + 15) ÷ 2 = €14m.', 'Turnover = 49.5 ÷ 14 = <b>3.54 times</b>.', 'AAI = 365 ÷ 3.5357 = <b>103.2 days</b>.'] },
    remember: ['Always use averages when two years are given.', 'ACP uses credit sales; APP uses credit purchases.', 'DuPont is not on the exam.']
  },

  zs15: {
    exec: [
      'Working capital is the money a company needs to keep its daily operations running. It buys materials (often on credit), keeps them in stock, sells the products (often on credit) and waits for the customer to pay. During that time money is tied up. <b>Net working capital</b> = current assets − current liabilities.',
      'The <b>cash conversion cycle (CCC)</b> measures how many days the company has to finance this itself. The <b>operating cycle</b> is the time from buying the stock until the customer pays: AAI (days in stock) + ACP (days to collect). Suppliers often give you time to pay, which is free financing, so you subtract that: <b>CCC = AAI + ACP − APP</b>. A shorter CCC means less money tied up. A negative CCC (like a supermarket) means customers pay before you pay your suppliers, so operations bring in money.',
      'The CCC in days becomes money with the formula sheet: <b>resources needed = average inventory + average receivables − average payables</b>, or written out, AAI/365 × COGS + ACP/365 × credit sales − APP/365 × credit purchases. In a case with two balance sheets you can simply take the averages of the balance sheet items. The CCC can be reduced by selling stock faster, collecting from customers faster and paying suppliers later, as long as relationships with suppliers are not damaged.',
      'There is a trade-off between profit and risk. More current assets make the firm safer (it can always pay its bills) but less profitable, because cash and stock earn little. Fewer current assets are more profitable but riskier.'
    ],
    big: 'CCC = AAI + ACP − APP tells you how long your own money is stuck; resources needed tells you how much money that is.',
    parts: [
      { h: 'Key points', li: ['Operating cycle = AAI + ACP.', 'CCC = AAI + ACP − APP (can be negative).', 'Resources needed = avg inventory + avg A/R − avg A/P.', 'Reduce CCC: faster stock turnover, faster collection, slower (but on-time) payment.'] }
    ],
    example: { q: 'Mock 2 (Hartmann): COGS 49.5m, sales 90m (all credit), credit purchases 28m. Inventory 13.0 → 15.0, A/R 15.5 → 18.0, A/P 7.2 → 8.0 (€m). CCC and resources needed?', steps: ['Average inventory = (13 + 15) ÷ 2 = 14.0; turnover = 49.5 ÷ 14 = 3.5357; AAI = 365 ÷ 3.5357 = <b>103.23 days</b>.', 'Average A/R = (15.5 + 18) ÷ 2 = 16.75; credit sales per day = 90 ÷ 365 = 0.24658; ACP = 16.75 ÷ 0.24658 = <b>67.93 days</b>.', 'Average A/P = (7.2 + 8) ÷ 2 = 7.6; credit purchases per day = 28 ÷ 365 = 0.07671; APP = 7.6 ÷ 0.07671 = <b>99.07 days</b>.', 'CCC = 103.23 + 67.93 − 99.07 = <b>72.09 days</b>.', 'Resources needed = 14.0 + 16.75 − 7.6 = <b>€23.15m</b>.'] },
    remember: ['Use the credit purchases the case gives you for APP.', 'Resources needed = averages: inventory + receivables − payables.', 'Show every step: averages, per-day figures, days.']
  },

  zs15b: {
    exec: [
      'This part is about receivables: who gets credit, on what terms, and how you collect. Giving credit increases sales, but it also costs money: some customers never pay (<b>bad debts</b>) and the money sitting in receivables could have been used elsewhere. A credit policy change is only a good idea if the extra profit is larger than these extra costs.',
      'The course uses one simple method for every credit question (tighten or relax credit, add or remove a discount). Step 1: the change in <b>contribution margin</b> (extra sales × CM ratio, or extra units × CM per unit). Step 2: the change in <b>bad debts</b> (bad-debt % × sales, new minus old) and, if there is a discount, the change in discount cost. Step 3: the change in <b>investment in receivables</b>: A/R = sales × ACP ÷ 365 (net of any discount), new minus old, and its cost = ΔA/R × required return. The net effect is ΔCM − Δbad debts (and discounts) − cost of ΔA/R. If it is positive, make the change.',
      'Credit terms such as "2/10 net 30" mean a 2% discount if the customer pays within 10 days, otherwise the full amount within 30 days. A discount makes customers pay faster, but you give away part of the price. Receivables are monitored with the ACP and an <b>aging schedule</b> (how much of the receivables is 0–30, 31–60, 61–90 days old). Collection goes step by step: letters, phone calls, visits, a collection agency and finally legal action. The 5 C\'s of credit help decide who gets credit: character, capacity, capital, collateral, conditions.',
      'The last part is about cash: get money in fast (electronic payments, lockboxes, gathering cash in one account) and pay out on time but not early.'
    ],
    big: 'Change credit policy only if ΔCM is bigger than Δbad debts plus the cost of the extra money stuck in receivables.',
    parts: [
      { h: 'Course method', li: ['ΔCM = Δsales × CM ratio.', 'Δbad debts = new % × new sales − old % × old sales.', 'A/R = sales × ACP ÷ 365; cost = ΔA/R × required return.', 'Net = ΔCM − Δbad debts − cost of ΔA/R → do it if positive.'] }
    ],
    example: { q: 'Mock 1 (VerdantFlow): credit sales 9.6m → 12m, CM ratio 60%, ACP 45 → 60 days, bad debts 1.2% → 2.5%, required return 10%.', steps: ['ΔCM = (12,000,000 − 9,600,000) × 60% = <b>€1,440,000</b>.', 'A/R now = 9,600,000 × 45 ÷ 365 = €1,183,562; A/R new = 12,000,000 × 60 ÷ 365 = €1,972,603.', 'ΔA/R = 1,972,603 − 1,183,562 = <b>€789,041</b>; cost = 789,041 × 10% = <b>€78,904</b>.', 'Bad debts now = 9,600,000 × 1.2% = €115,200; new = 12,000,000 × 2.5% = €300,000; Δ = <b>€184,800</b>.', 'Net = 1,440,000 − 78,904 − 184,800 = <b>+€1,176,296</b> → implement the new policy.'] },
    remember: ['A/R is based on sales, not on variable cost.', 'Apply the required return only to the CHANGE in A/R.', 'The decision is one sentence: positive net effect → do it.']
  },

  zs16: {
    exec: [
      'This chapter is about short-term financing. Some of it is "spontaneous": accounts payable and accruals (wages and taxes you owe but haven\'t paid yet) grow automatically with sales and carry no interest. Other financing must be arranged: bank loans, commercial paper, or loans backed by receivables or inventory.',
      'The key skill is comparing options that are quoted in different ways. First turn each option into a <b>rate per period (r<sub>p</sub>)</b>. A loan at X% p.a. simple interest for d days: r<sub>p</sub> = X × d ÷ 365. A rate for the whole period (e.g. 5% for 6 months): r<sub>p</sub> = 5%. A <b>discount loan</b> at X% (interest paid up front): you receive 100 − X and repay 100, so r<sub>p</sub> = X ÷ (100 − X). A supplier bill "CD/y, n/z": not taking the discount costs CD on (100 − CD) for N = z − y days, so r<sub>p</sub> = CD ÷ (100 − CD).',
      'To compare options of different lengths, turn every r<sub>p</sub> into an <b>effective annual rate</b>: EAR = (1 + r<sub>p</sub>)<sup>365/days</sup> − 1. For a supplier the "exact" cost of giving up the discount is the same formula with N days; the "approximate" cost is r<sub>p</sub> × 365 ÷ N. The money cost in euros of an option = amount raised × r<sub>p</sub>.',
      'Which option to choose depends on the situation. For a <b>one-off</b> need, choose the option with the <b>lowest total interest cost</b> for the period (lowest r<sub>p</sub> or euro cost). For a <b>recurring</b> need, choose the <b>lowest EAR</b>. Stretching payables (paying after the due date) is an emergency source but damages supplier relationships. Secured loans use receivables (pledging, or factoring = selling them) or inventory as collateral.'
    ],
    big: 'Put every option on the same basis: r_p first, then EAR. One-off need → lowest total cost; recurring need → lowest EAR.',
    parts: [
      { h: 'Period rates', li: ['Simple X% p.a. for d days: r_p = X × d/365.', 'Discount loan X%: r_p = X/(100 − X).', 'Supplier CD/y, n/z: r_p = CD/(100 − CD), N = z − y.', 'EAR = (1 + r_p)^(365/days) − 1. Approximate (no compounding) = r_p × 365/days.'] }
    ],
    example: { q: 'Mock 2: raise €500,000 by (1) a 6% discount loan for 120 days, (2) a 13% p.a. simple-interest loan for 60 days, (3) a supplier bill 2/15, n/60.', steps: ['(1) r_p = 6 ÷ 94 = 6.383%; cost = 500,000 × 6.383% = <b>€31,915</b>; EAR = 1.06383<sup>365/120</sup> − 1 = <b>20.71%</b>.', '(2) r_p = 13% × 60 ÷ 365 = 2.137%; cost = 500,000 × 2.137% = <b>€10,685</b>; EAR = 1.02137<sup>365/60</sup> − 1 = <b>13.73%</b>.', '(3) N = 60 − 15 = 45; r_p = 2 ÷ 98 = 2.041%; cost = 500,000 × 2.041% = <b>€10,204</b>; exact EAR = 1.02041<sup>365/45</sup> − 1 = <b>17.81%</b>.', 'One-off need → lowest total cost → <b>supplier bill</b> (€10,204). If it were recurring → lowest EAR → the 13% loan.'] },
    remember: ['Discount loan: X/(100 − X), not X.', 'N = full period − discount period.', 'One-off → cheapest in euros; recurring → lowest EAR.']
  },

  zs125: {
    exec: [
      'Leverage means that fixed costs make profits move more than sales. If a firm has many fixed costs (rent, depreciation, salaries), a small rise in sales gives a big rise in EBIT, because the fixed costs stay the same. A small fall in sales hits EBIT just as hard. This is <b>operating leverage</b>.',
      'The <b>break-even point</b> is the sales level where EBIT is exactly zero: fixed costs ÷ contribution margin per unit. Every unit sold above break-even adds its contribution margin to EBIT. The further a firm sells above break-even, the lower its operating leverage.',
      'The <b>degree of operating leverage</b> measures the effect: DOL = %change in EBIT ÷ %change in sales = <b>contribution margin ÷ EBIT</b>. With a contribution-format income statement (as in the mock cases), you read CM and EBIT straight from the statement. A DOL of 1.8 means that a 1% rise in sales gives a 1.8% rise in EBIT.',
      'The same chapter shows that risk in projects can be studied by changing assumptions: one input at a time (sensitivity analysis) or several at once in scenarios (worst, expected, best). For the exam, the core skill is DOL from the case statements and explaining what it means.'
    ],
    big: 'Fixed operating costs make EBIT swing more than sales: DOL = CM ÷ EBIT.',
    parts: [
      { h: 'Key points', li: ['Break-even units = fixed costs ÷ (price − variable cost per unit).', 'DOL = CM ÷ EBIT = %ΔEBIT ÷ %ΔSales.', 'More fixed costs → higher DOL → more business risk.', 'DOL works both ways: up and down.'] }
    ],
    example: { q: 'Mock 2 (Hartmann): CM €40.5m, EBIT €22.5m. DOL and meaning?', steps: ['DOL = CM ÷ EBIT = 40.5 ÷ 22.5 = <b>1.80</b>.', 'If sales rise 1%, EBIT rises 1.8%; if sales fall 1%, EBIT falls 1.8%.'] },
    remember: ['Read CM and EBIT from the contribution income statement.', 'Explain the number in words: "1% sales → x% EBIT".']
  },

  zs131: {
    exec: [
      'Financial leverage comes from fixed <b>financing</b> costs: interest on debt and dividends on preferred shares. These must be paid whatever the profit, so a change in EBIT gives a bigger change in earnings per share (EPS). Borrowing makes good years better and bad years worse for the common shareholders.',
      'The course measures it with the <b>degree of financial leverage</b>: DFL = %change in EPS ÷ %change in EBIT = <b>EBIT ÷ (EBT − PD ÷ (1 − T))</b>. Preferred dividends (PD) are paid out of after-tax profit, so you turn them into a before-tax amount by dividing by (1 − T) before subtracting them from EBT. Find PD in the case: number of preferred shares × par value × dividend %.',
      'Operating and financial leverage together give <b>total leverage</b>: DTL = DOL × DFL. DTL tells you what happens to EPS when sales change: %ΔEPS = DTL × %ΔSales. If DOL is much bigger than DFL, most of the firm\'s risk comes from its cost structure (business risk), not from its debt. Management should then watch sales stability and fixed costs. It might even have room to borrow more. If DFL is the big one, the risk comes from debt.',
      'More debt raises expected returns for shareholders only if the firm earns more on its assets than the debt costs. It always raises risk, so shareholders demand a higher return. Choosing the capital structure means balancing these two effects.'
    ],
    big: 'Fixed financing costs make EPS swing more than EBIT: DFL = EBIT ÷ (EBT − PD/(1 − T)); DTL = DOL × DFL.',
    parts: [
      { h: 'Key points', li: ['PD = preferred shares × par × dividend %.', 'DFL = EBIT ÷ (EBT − PD/(1 − T)).', 'DTL = DOL × DFL; %ΔEPS = DTL × %ΔSales.', 'Compare DOL and DFL to say where the risk comes from.'] }
    ],
    example: { q: 'Mock 2 (Hartmann): EBIT €22.5m, EBT €19.7m, tax 30%, 40,000 preferred shares of €150 par with a 5% dividend; DOL = 1.80.', steps: ['PD = 40,000 × 150 × 5% = €300,000.', 'Before-tax PD = 300,000 ÷ (1 − 0.30) = €428,571.', 'DFL = 22,500,000 ÷ (19,700,000 − 428,571) = 22,500,000 ÷ 19,271,429 = <b>1.168</b>.', 'DTL = 1.80 × 1.168 = <b>2.10</b>: a 1% rise in sales gives about a 2.1% rise in EPS.', 'DOL (1.80) > DFL (1.17): operating leverage contributes most, so the risk mainly comes from the high fixed operating costs.'] },
    remember: ['Don\'t forget preferred dividends in DFL.', 'Divide PD by (1 − T).', 'Interpretation question: compare DOL with DFL and say what it means for management.']
  },

  zs95: {
    exec: [
      'The weighted average cost of capital (WACC) is the average return the company has to pay to everyone who finances it: lenders, preferred shareholders and common shareholders. It is the minimum return a new project must earn. If a project earns more than the WACC, it creates value; if it earns less, it destroys value. That is why the WACC is called the <b>hurdle rate</b>.',
      'The formula is WACC = (w<sub>d</sub> × r<sub>d</sub>)(1 − T) + w<sub>p</sub> × r<sub>p</sub> + w<sub>s</sub> × r<sub>s</sub>. Only the cost of debt is multiplied by (1 − T), because interest is tax-deductible. The weights tell you what share of the long-term financing each source provides.',
      'In this course you take the weights from the <b>balance sheet (book values)</b>: long-term debt, preferred equity, and common equity (common stock + retained earnings). Current liabilities are left out. The cost of debt is r<sub>d</sub> = interest expense on long-term debt ÷ long-term debt; the mock tells you to assume all interest is on long-term debt. The costs of preferred and common equity are given in the case.',
      'When you explain a decision, say it in two steps: compare the project\'s return with your WACC, then conclude. For example: "The project yields 7%, which is below the WACC of 7.23%, so it does not cover the cost of the money used and VerdantFlow should reject it, assuming the project has the same risk as the company."'
    ],
    big: 'WACC = average cost of the long-term money (book weights); projects must beat it.',
    parts: [
      { h: 'Course method', li: ['Weights: LT debt, preferred equity, common equity (incl. retained earnings), from the balance sheet.', 'r_d = interest ÷ LT debt; only debt × (1 − T).', 'Accept a project if its return > WACC (same risk).'] }
    ],
    example: { q: 'Mock 1 (VerdantFlow): LT debt 28m, preferred 5m, common 30m + retained earnings 19.5m; interest 2.4m; tax 25%; r_p 6%; r_s 7.8%.', steps: ['Common equity = 30 + 19.5 = 49.5m; total = 28 + 5 + 49.5 = 82.5m.', 'w_d = 28 ÷ 82.5 = 33.94%; w_p = 5 ÷ 82.5 = 6.06%; w_s = 49.5 ÷ 82.5 = 60.00%.', 'r_d = 2.4 ÷ 28 = 8.571%.', 'WACC = 0.3394 × 8.571% × (1 − 0.25) + 0.0606 × 6% + 0.60 × 7.8% = 2.182% + 0.364% + 4.680% = <b>7.23%</b>.', 'A 7% project is below 7.23% → it destroys value → reject.'] },
    remember: ['Leave out current liabilities.', 'Common equity includes retained earnings.', 'Return > WACC → accept; < WACC → reject.']
  },

  zs19: {
    exec: [
      'A company that operates in several countries (a multinational) faces everything a domestic firm faces, plus extra issues: different currencies, different tax systems, different laws and political risk. Trade blocs such as the EU and agreements policed by the WTO make trade easier. Joint ventures with local partners are common where foreign ownership is limited.',
      '<b>Taxes</b> are the part the exam calculates. A foreign subsidiary pays tax in its own country, and the after-tax profit is paid to the parent as a dividend. The home country can then tax that dividend again. Without a tax agreement, the total tax = foreign tax + home tax on the dividend. With a tax agreement (a credit), the foreign tax already paid is subtracted from the home tax. The home tax can never go below zero: if foreign tax is higher, nothing extra is paid at home, but you don\'t get money back either.',
      '<b>Exchange rates</b> are the other big risk. Always read the units: "€/£ 1.15" means 1 pound costs 1.15 euros. If the rate moves, the value of foreign sales, costs and assets in euros changes. A <b>forward contract</b> fixes a rate today for a future date; you give up possible gains for certainty. Countries with higher inflation tend to see their currency weaken. <b>Political risk</b> is the risk that a government changes the rules: macro (all foreign firms) or micro (one firm or industry).',
      'Consolidating a foreign or domestic subsidiary is covered on the Week 6 page (it comes from the lecture, not this chapter).'
    ],
    big: 'Foreign profit is taxed twice unless a tax credit applies; home tax can\'t go below zero. Always read currency units carefully.',
    parts: [
      { h: 'Key points', li: ['No agreement: total = foreign tax + home rate × dividend.', 'With credit: home tax = max(0, home rate × dividend − foreign tax).', 'Forward contract = certainty, no upside.', 'Higher inflation → weaker currency.'] }
    ],
    example: { q: 'Mock 2 (Hartmann): US subsidiary earns €1,000,000 before tax; US tax 35%; German tax 30% on the dividend.', steps: ['US tax = 1,000,000 × 35% = €350,000; dividend = €650,000.', 'German tax = 650,000 × 30% = €195,000.', 'a) Not deductible: total = 350,000 + 195,000 = <b>€545,000</b> (54.5%).', 'b) Deductible: German tax = max(0, 195,000 − 350,000) = 0 → total = <b>€350,000</b> (35%).'] },
    remember: ['Home tax is on the dividend (after foreign tax).', 'Credit can\'t make home tax negative.', 'Read currency units before you multiply or divide.']
  },

  l1: {
    exec: [
      'This chapter introduces supply chain management (SCM) and logistics. <b>Logistics</b> is the process of planning, implementing and controlling the efficient and effective flow and storage of raw materials, work-in-process, finished goods, related services and information, from point of origin to point of consumption, to meet customer requirements. The <b>goal of logistics</b> is to give an acceptable level of customer service at the lowest possible total cost.',
      'Logistics customer service is often summarised by the <b>7 Rs</b>: the right product, to the right customer, at the right place, in the right quantity, in the right condition, at the right time, for the right price. Missing any one of them means the customer is not served, even if the others are perfect.',
      'A supply chain goes further than one company. It links suppliers\' suppliers to customers\' customers, and it manages four flows: products, information, cash and demand. SCM tries to make the whole chain efficient, replaces inventory with information, and builds win-win relationships. Six forces pushed companies towards SCM: globalisation, technology, consolidation and the power shift to big retailers, empowered consumers, government policy and regulation, and sustainability.',
      'The chapter ends with the major issues every supply chain must manage: network design, complexity, where to hold inventory, information sharing, cost and value (avoid saving in one place while costing more elsewhere), relationships, performance measurement, technology, transport, security and talent.'
    ],
    big: 'Logistics = efficient, effective flow and storage from origin to consumption; goal = acceptable customer service at the lowest total cost (7 Rs).',
    parts: [
      { h: 'Key points', li: ['Definition of logistics (plan, implement, control; flow and storage; origin → consumption; customer requirements).', 'Goal: acceptable customer service at lowest total cost.', '7 Rs: product, customer, place, quantity, condition, time, price.', 'Four flows: product, information, cash, demand.', 'Six change drivers.'] }
    ],
    example: { q: 'Mock 2 Q7 style: "Explain logistics customer service using the 7 Rs" (6 points).', steps: ['Name all seven Rs: right product, right customer, right place, right quantity, right condition, right time, right price.', 'Give each a short meaning, e.g. "right condition = undamaged, at the right temperature".', 'Link to the case: for Hartmann, the right condition means seals within spec, and the right time means delivered before the customer\'s production run.'] },
    remember: ['Learn the definition and the goal word for word.', 'Seven Rs, one line each.', 'Link answers to the case company.']
  },

  l2: {
    exec: [
      'Countries trade because they are better at different things. With an <b>absolute advantage</b> a country makes something more efficiently than others. With a <b>comparative advantage</b> it specialises in what it is relatively best at, and both trading partners gain even if one is better at everything.',
      'Global commerce is shaped by population (size, ageing, growth and urbanisation), by where land and resources are, and by technology that makes it easier to coordinate across the world. The EU as a bloc and China as a country are the largest exporters; the US is a large net importer.',
      'Global supply chains bring longer lead times, more inventory, more risk and more paperwork. Security rules increased after 2001; programmes such as C-TPAT give trusted companies faster customs clearance, which balances security with speed. Ports are important bottlenecks, and free trade agreements reduce tariffs and paperwork between member countries.',
      'For the exam this chapter mostly gives background for questions about switching to a far-away supplier: longer and less reliable lead times mean more cycle and safety stock, more in-transit stock and higher total landed cost.'
    ],
    big: 'Trade follows comparative advantage; going global adds lead time, risk, inventory and paperwork.',
    parts: [
      { h: 'Key points', li: ['Comparative advantage is the main reason to trade.', 'Population, resources and technology shape trade flows.', 'Security vs speed (C-TPAT, green lanes).', 'Far-away sourcing → longer pipeline → more stock.'] }
    ],
    remember: ['Explain effects of a distant supplier on inventory (mock 2 Q9b).', 'Don\'t memorise the trade tables.']
  },

  l3: {
    exec: [
      'Logistics adds value to products through <b>utilities</b>. Production creates <b>form</b> utility (the product exists). Logistics creates <b>place</b> utility (it is where the customer is), <b>time</b> utility (it is there when needed) and <b>quantity</b> utility (in the right amount). Marketing creates <b>possession</b> utility (the customer can buy it).',
      'The main logistics activities are transportation, storage, packaging, materials handling, inventory control, order fulfilment, forecasting, production planning, procurement, customer service and facility location. Logistics touches manufacturing (long production runs create stock), marketing (logistics is the "place" in the 4 Ps), finance (inventory and assets) and accounting (cost information).',
      'Several factors decide how important and costly logistics is for a product. Competitive factors: a shorter order cycle means less stock is needed at the customer, substitutable products need very good service, and spending more on inventory or transport can reduce lost sales. Product factors: high value, low density, fragility and special handling all raise costs. Spatial factors: distance between plants, warehouses and markets.',
      'Logistics systems are analysed as a whole. Look at the <b>total cost</b> of all activities together (cost centres), not at one cost. A cheaper transport mode can be the more expensive choice once inventory and packaging costs are added. Static analysis compares systems at one volume; dynamic analysis compares them over a range of volumes.'
    ],
    big: 'Logistics creates place, time and quantity utility; always judge decisions on total cost.',
    parts: [
      { h: 'Key points', li: ['Form (production), place / time / quantity (logistics), possession (marketing).', 'Cost factors: competitive, product, spatial.', 'Total cost approach: trade-offs between transport, inventory, warehousing and packaging.', 'Static (one volume) vs dynamic (range of volumes).'] }
    ],
    remember: ['Who creates which utility.', 'Total cost, not one cost.']
  },

  l5: {
    exec: [
      'Buying is a strategic activity. <b>Purchasing</b> is the transaction itself, <b>procurement</b> is the whole buying process (selecting suppliers, negotiating, contracts, monitoring), and <b>strategic sourcing</b> aligns buying with the goals of the company and the supply chain.',
      'Not everything you buy is equally important. The <b>quadrant technique</b> classifies items by risk and value: generics (low risk, low value), commodities (low risk, high value), distinctives (high risk, low value) and criticals (high risk, high value). Each needs its own approach. The strategic sourcing process has seven steps: plan, understand spend, evaluate supply sources, finalise the strategy, implement it, transition and onboard suppliers, and keep improving.',
      'Choosing suppliers on price alone is risky. Other criteria are <b>quality</b> (specifications, certifications such as ISO 9001, defect rates), <b>reliability</b> (on-time delivery, performance history), <b>capability</b> (production and technical capacity, management, information systems), <b>financial stability</b>, <b>risk</b> (lead-time and supply uncertainty, location), <b>sustainability</b> and "desirable qualities" such as culture fit, location, packaging and after-sales service.',
      '<b>Total landed cost (TLC)</b> is everything it costs to get the goods to your door: the purchase price plus transport, insurance, customs duties, taxes, handling and inventory costs. A supplier with a low price can be the most expensive once all costs are added. Follow the order the question gives. In mock 1, duty is charged on price + transport, and VAT on the total including duty.'
    ],
    big: 'Classify purchases by risk and value, choose suppliers on more than price, and compare them on total landed cost.',
    parts: [
      { h: 'Key points', li: ['Generics / commodities / distinctives / criticals.', 'Seven sourcing steps.', 'Supplier criteria: quality, reliability, capability, financial, risk, sustainability, desirable qualities.', 'TLC = price + transport + duties + taxes + other costs.'] }
    ],
    example: { q: 'Mock 1 (VerdantFlow): 5,000,000 units at €1.20 ex-works; transport €800,000; duty 30% on price + transport; VAT 21% on the total including duty.', steps: ['Purchase price = 5,000,000 × 1.20 = €6,000,000.', 'Price + transport = 6,000,000 + 800,000 = €6,800,000.', 'Duty = 6,800,000 × 30% = €2,040,000 → subtotal €8,840,000.', 'VAT = 8,840,000 × 21% = €1,856,400.', 'Total landed cost = 8,840,000 + 1,856,400 = <b>€10,696,400</b> (≈ €2.14 per unit vs €1.20 price).'] },
    remember: ['Five criteria + one-line explanation each (10 points in mock 1).', 'TLC: follow the base the question gives for duty and VAT.', 'Explain why TLC beats price alone: hidden costs.']
  },

  l9: {
    exec: [
      'Inventory protects a company against uncertainty and lets it buy or produce in efficient batches, but it ties up money and costs money to hold. The types of stock are: <b>cycle stock</b> (normal stock between deliveries, which depends on order size and lead time), <b>safety stock</b> (a buffer against uncertainty in demand and lead time), <b>in-transit stock</b>, <b>work-in-process</b>, <b>seasonal stock</b> and <b>anticipatory stock</b>.',
      'Inventory costs are <b>carrying costs</b> (capital cost, storage space, service such as insurance and taxes, and risk such as obsolescence and damage), <b>ordering/setup costs</b> and <b>stockout costs</b>. Ordering and carrying costs move in opposite directions: smaller, more frequent orders lower average stock and carrying cost but raise ordering and often transport costs. Higher service levels need more safety stock.',
      'This logic answers the mock question about a <b>new supplier</b>. A shorter lead time lowers cycle stock (you need fewer days of stock to cover the lead time). Less variability lowers safety stock, while less reliability raises it. Ordering more often to keep the lower stock raises order costs, and smaller shipments usually raise transport costs per unit. Less inventory means fewer assets, so return on assets (ROA) goes up unless the extra costs or extra safety stock cancel it out.',
      'Approaches to managing inventory include the fixed order quantity model (order the same amount at a reorder point), the fixed order interval model, JIT (small, frequent, reliable deliveries), MRP and DRP, and VMI (the supplier manages your stock). <b>ABC analysis</b> puts most control on the few A-items that represent most of the value. Ways to cut inventory without hurting delivery include: ABC focus, better forecasting, shorter or more reliable lead times, pooling stock in fewer locations instead of a full range at every depot, VMI, and removing slow-moving SKUs.'
    ],
    big: 'Cycle stock follows lead time and order size; safety stock follows uncertainty. Less stock means a higher ROA, but watch ordering and transport costs.',
    parts: [
      { h: 'Key points', li: ['Six types of stock.', 'Carrying cost = capital + storage + service + risk.', 'Ordering vs carrying trade-off.', 'Lead time ↓ → cycle stock ↓; variability ↓ → safety stock ↓; reliability ↓ → safety stock ↑.', 'Inventory ↓ → assets ↓ → ROA ↑ (if profit holds).'] }
    ],
    example: { q: 'Mock 2 Q8: new supplier, delivery time −50% but 10% less reliable, same price. Effect on (a) cycle stock (b) safety stock (c) order costs (d) transport costs (e) ROA?', steps: ['(a) Cycle stock <b>↓</b>: half the lead time needs about half the cycle stock (18 → 9 days).', '(b) Safety stock <b>↑</b>: less reliable delivery means more uncertainty, so a bigger buffer.', '(c) Order costs <b>↑</b>: to keep the lower cycle stock you order more often.', '(d) Transport costs <b>↑</b>: smaller, more frequent shipments cost more per unit (less consolidation).', '(e) ROA: probably <b>↑</b>. The cycle stock fall (~9 days) is bigger than the safety stock rise, so assets fall. But higher order and transport costs lower profit, so the net effect depends on their size.'] },
    remember: ['Answer each item: direction + why (one sentence).', 'Mock 1 version (shorter AND more reliable): cycle ↓, safety ↓, order costs ↑, transport ↑, ROA ↑.', 'Three ways to cut inventory: pooling, ABC, better forecasting/lead times, VMI.']
  },

  l11: {
    exec: [
      'Transportation links every part of the supply chain and is usually the biggest logistics cost. There are five modes. <b>Truck</b> reaches almost everywhere and is fast and reliable, but it is expensive and carries small loads. <b>Rail</b> is cheap for heavy, bulky, low-value goods over long distances, but slower and with more damage. <b>Air</b> is the fastest and safest but the most expensive, for urgent, high-value goods. <b>Water</b> is the cheapest for very large volumes and international freight, but slow. <b>Pipeline</b> is very cheap and reliable for liquids and gas, but only where pipes exist. <b>Intermodal</b> combines modes, e.g. rail for the long distance and truck for pickup and delivery.',
      'To choose a mode, match the product and situation with the mode\'s strengths. Heavy, low-value, non-perishable materials over a long distance point to <b>rail</b> (or water where possible), because cost per ton matters more than speed. If stockouts are expensive and the reorder point leaves little time, add reliability: rail combined with truck (intermodal) keeps the low cost and reaches the plant door. In the mode ranking (1 = best), truck is best for accessibility, air for transit time, and pipeline for reliability, security and cost.',
      'Planning decisions come in order: who controls transport, the terms of sale (FOB origin = buyer owns the goods in transit; FOB destination = seller owns them), outsourcing or a private fleet, mode, carrier and rate negotiation. Execution needs documents (the bill of lading as contract and receipt, the freight bill as the invoice), shipment tracking and performance measurement with KPIs and weighted scorecards.',
      'A more distant supplier means longer and less reliable transport, so you need more in-transit, cycle and safety stock at your plant. That raises inventory and carrying costs, even if the purchase price is lower.'
    ],
    big: 'Match product and situation to mode strengths; longer, less reliable transport means more inventory.',
    parts: [
      { h: 'Key points', li: ['Strengths and weaknesses of truck, rail, air, water, pipeline.', 'Heavy, low-value, non-perishable, long distance → rail / water; add truck for door-to-door (intermodal).', 'FOB origin vs FOB destination.', 'Bill of lading ≠ freight bill.'] }
    ],
    example: { q: 'Mock 2 Q9a: heavy, low-value, non-perishable materials from Eastern Europe and Central Asia to Stuttgart; stockouts are costly; reorder point = 3 weeks of demand.', steps: ['Mode 1: <b>rail</b>. High capacity and low cost per ton fit heavy, low-value bulk over long land distances. Slower speed is acceptable because the goods are not perishable.', 'Mode 2: <b>truck</b> (as intermodal with rail, or direct from Eastern Europe). It is accessible door-to-door and more reliable, which protects against costly stockouts within the 3-week reorder window.', 'Why not air: far too expensive for low-value heavy goods. Why not pipeline: only for liquids and gas.'] },
    remember: ['Always link mode to product characteristics + situation (2 modes, explained).', 'Distant supplier → more inventory (in-transit, cycle, safety).']
  }
  };
})(typeof window !== 'undefined' ? window : globalThis);
