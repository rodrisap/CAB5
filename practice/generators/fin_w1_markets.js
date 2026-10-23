/* Finance Week 1 — Intro to managerial finance & financial markets (Ch. 1 & 2) */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt;
  var fact = h.fact, step = h.step;
  FSM.calc = FSM.calc || {};

  FSM.addTopic({ id: 'fin_w1', area: 'Finance', week: 1, title: 'Finance basics & financial markets', read: 'Zutter & Smart Ch. 1 & 2' });

  FSM.calc.tradeCost = function (n, bid, ask, comm) {
    var mid = (bid + ask) / 2;
    return { spread: ask - bid, mid: mid, dealerPay: n * ask + comm, brokerPay: n * mid + comm, dealerCost: n * (ask - bid) / 2 + comm, brokerCost: comm };
  };
  FSM.calc.taxForms = function (profit, b1, r1, r2, corp, divT) {
    var pers = Math.min(profit, b1) * r1 + Math.max(0, profit - b1) * r2;
    var ct = profit * corp, dt = (profit - ct) * divT;
    return { sole: pers, corp: ct + dt, ct: ct, dt: dt };
  };

  /* ---------------- cash vs accrual ---------------- */
  FSM.addSkill({
    id: 'fin_w1_cash_accrual', topic: 'fin_w1', title: 'Accounting profit vs operating cash flow',
    formula: 'Accrual: revenue − expenses · Cash: cash received − cash paid (operating only)',
    build: function (r, c) {
      var cost = r.range(0.5, 8, 0.1) * 1e6;
      var sales = h.r0(cost * r.range(1.08, 1.4, 0.01) / 1e4) * 1e4;
      var collected = r.range(0.5, 0.95, 0.05);
      var oldAR = r.chance(0.5) ? h.r0(sales * r.range(0.05, 0.2, 0.01) / 1e3) * 1e3 : 0;
      var borrow = r.chance(0.4) ? h.r0(cost * r.range(0.1, 0.3, 0.01) / 1e3) * 1e3 : 0;
      var profit = sales - cost;
      var cf = sales * collected + oldAR - cost;
      var C = c.C;
      var facts = [
        fact('Purchases (paid in cash)', cost, 'cur', c.company + ' bought goods for ' + C(cost) + ', all paid in cash before delivery.'),
        fact('Sales (on credit)', sales, 'cur', 'It resold all of them on credit for ' + C(sales) + '.'),
        fact('Collected by year end', collected, 'pct', 'By year end it had collected ' + F.num(collected * 100) + '% of these receivables.', { dp: 0 })
      ];
      if (oldAR) facts.push(fact('Collected from last year\'s receivables', oldAR, 'cur', 'It also collected ' + C(oldAR) + ' of receivables from last year\'s sales.'));
      if (borrow) facts.push(fact('Short-term loan received', borrow, 'cur', 'To support operations it borrowed ' + C(borrow) + ' short-term.'));
      var traps = [{ v: profit, why: 'That is accounting profit (accrual); cash flow counts only cash actually received and paid.' }];
      if (borrow) traps.push({ v: cf + borrow, why: 'Borrowing is a FINANCING cash flow, not operating cash flow.' });
      if (oldAR) traps.push({ v: cf - oldAR, why: 'Cash collected from last year\'s receivables is received this year — include it.' });
      return {
        intro: [c.company + ' is a ' + c.industry + ' trader.', 'Last year at ' + c.company + ':'],
        facts: facts, layouts: ['sentence', 'table', 'case'],
        noise: [fact('x', 0, 'cur', 'The company has ' + r.int(5, 60) + ' employees.')],
        parts: [
          { ask: ['What is the accounting (accrual-basis) profit for the year?', 'What net profit does the income statement show?'], answer: profit, unit: 'cur',
            traps: [{ v: cf, why: 'That is the cash flow; accrual profit records the full sale when it happens.' }].concat(oldAR ? [{ v: profit + oldAR, why: 'Last year\'s receivables are not this year\'s revenue: those sales were already counted as profit LAST year. Collecting them is only cash coming in, so it belongs in the cash flow (part b), not in profit.' }] : []),
            steps: [step('Profit = revenue − cost of goods sold = ' + C(sales) + ' − ' + C(cost), profit, 'cur', 'accrual basis')].concat(oldAR ? ['The ' + C(oldAR) + ' collected from last year\'s receivables is NOT added: that sale was already booked as revenue last year. It only shows up in the cash flow.'] : []) },
          { ask: ['What is the operating cash flow for the year?', 'How much net cash did operations generate?'], answer: cf, unit: 'cur', traps: traps,
            steps: [step('Cash from this year\'s sales = ' + F.num(collected * 100) + '% × ' + C(sales), sales * collected, 'cur', 'collected part'), oldAR ? step('+ cash from last year\'s receivables', oldAR, 'cur', 'given') : 'No old receivables collected.', step('− cash paid for goods', cost, 'cur', 'given'), borrow ? 'The loan of ' + C(borrow) + ' is a financing flow — excluded.' : '', step('Operating cash flow', cf, 'cur', 'cash in − cash out')].filter(Boolean) },
          { kind: 'choice', ask: ['What is the main lesson from the difference?'], choices: cf < profit ? ['A profitable firm can still run short of cash if customers pay slowly.', 'The company is not profitable.', 'Accrual accounting is wrong and should not be used.', 'Cash flow and profit are always equal over one year.'] : ['Cash flow exceeds profit because old receivables were collected this year.', 'The company is not profitable.', 'Accrual accounting is wrong and should not be used.', 'Cash flow and profit are always equal over one year.'], correctChoice: 0, why: 'Finance focuses on cash; accounting on accruals. Both matter.' }
        ]
      };
    }
  });

  /* ---------------- legal forms: how much can the owner lose ---------------- */
  FSM.addSkill({
    id: 'fin_w1_liability', topic: 'fin_w1', title: 'Legal forms: owner liability',
    formula: 'Sole prop. & partnership: unlimited liability · Corporation: limited to investment',
    build: function (r, c) {
      var inv = r.range(10, 200, 5) * 1000, debt = r.range(20, 400, 5) * 1000;
      var form = r.pick(['sole', 'partner', 'partnerFail', 'corp']);
      var name = r.pick(['John', 'Maria', 'Ahmed', 'Sofia', 'Lars', 'Mei', 'Daan', 'Lucía']);
      var ans = form === 'sole' ? inv + debt : form === 'partner' ? inv + debt / 2 : form === 'partnerFail' ? inv + debt : inv;
      var desc = { sole: name + ' is the sole proprietor.', partner: name + ' and a partner share the partnership equally; both partners can pay their share of the debts.', partnerFail: name + ' and a partner share the partnership equally, but the partner cannot pay anything.', corp: 'The firm is a corporation; ' + name + ' is a shareholder.' }[form];
      var C = c.C;
      return {
        intro: [name + ' invested ' + C(inv) + ' in ' + c.company + ' some years ago. The firm has ' + C(debt) + ' of unpaid debts and is going bankrupt. ' + desc],
        facts: [], layouts: ['sentence'],
        parts: [{ ask: ['What is the most ' + name + ' can lose in total (including the original investment)?', 'How much is ' + name + ' personally at risk for in total?'], answer: ans, unit: 'cur',
          traps: [{ v: inv, why: form === 'corp' ? '' : 'Only corporations give limited liability.' }, { v: inv + debt, why: 'Check the legal form: partners share debts; corporations limit liability.' }, { v: inv + debt / 2, why: 'If the partner cannot pay, each partner can be liable for ALL the debts.' }].filter(function (t) { return Math.abs(t.v - ans) > 1; }),
          steps: [form === 'corp' ? step('Limited liability → only the investment', inv, 'cur', 'corporation') : form === 'sole' ? step('Unlimited liability: investment + all debts = ' + C(inv) + ' + ' + C(debt), ans, 'cur', 'sole proprietorship') : form === 'partner' ? step('Investment + half of the debts = ' + C(inv) + ' + ' + C(debt / 2), ans, 'cur', 'equal partnership') : step('Investment + all debts (partner can\'t pay) = ' + C(inv) + ' + ' + C(debt), ans, 'cur', 'unlimited liability for partners\' debts')] },
          { kind: 'choice', ask: ['Which legal form gives owners limited liability?'], choices: ['Corporation', 'Sole proprietorship', 'Partnership', 'None of them'], correctChoice: 0, why: 'Corporate shareholders cannot lose more than they invested.' }]
      };
    }
  });

  /* ---------------- tax: sole proprietorship vs corporation ---------------- */
  FSM.addSkill({
    id: 'fin_w1_tax_forms', topic: 'fin_w1', title: 'Tax burden: sole proprietorship vs corporation',
    formula: 'Corporation: corporate tax on profit, then dividend tax on what is paid out (double taxation)',
    build: function (r, c) {
      var profit = r.range(40, 400, 5) * 1000;
      var b1 = r.pick([40000, 50000, 60000, 75000]);
      var r1 = r.pick([0.15, 0.2, 0.25]), r2 = r1 + r.pick([0.1, 0.15, 0.2]);
      var corp = r.pick([0.15, 0.19, 0.21, 0.25]), divT = r.pick([0.1, 0.15, 0.2, 0.25]);
      var x = FSM.calc.taxForms(profit, b1, r1, r2, corp, divT);
      var nm = r.pick(['Maria', 'Tom', 'Aisha', 'Pedro', 'Femke']);
      var C = c.C;
      var ask = r.pick(['sole', 'corp', 'eff']);
      var parts = [];
      if (ask !== 'corp') parts.push({ ask: ['Total tax as a sole proprietorship?', 'How much tax does ' + nm + ' pay if the business is a sole proprietorship?'], answer: x.sole, unit: 'cur',
        traps: [{ v: profit * r2, why: 'Progressive tax: the lower rate applies to the first bracket.' }, { v: profit * r1, why: 'Income above the bracket is taxed at the higher rate.' }],
        steps: [step('First ' + C(Math.min(profit, b1)) + ' × ' + F.num(r1 * 100) + '%', Math.min(profit, b1) * r1, 'cur', 'bracket 1'), step('Remaining ' + C(Math.max(0, profit - b1)) + ' × ' + F.num(r2 * 100) + '%', Math.max(0, profit - b1) * r2, 'cur', 'bracket 2'), step('Total personal tax', x.sole, 'cur', 'sum')] });
      if (ask !== 'sole') parts.push({ ask: ['Total tax as a corporation that pays all profit out as a dividend?', 'How much tax is paid in total if the business is incorporated?'], answer: x.corp, unit: 'cur',
        traps: [{ v: x.ct, why: 'Don\'t forget the dividend tax on the payout (double taxation).' }, { v: profit * corp + profit * divT, why: 'Dividend tax is on the profit AFTER corporate tax.' }],
        steps: [step('Corporate tax = ' + C(profit) + ' × ' + F.num(corp * 100) + '%', x.ct, 'cur', 'corporate rate'), step('Dividend = ' + C(profit) + ' − ' + C(x.ct), profit - x.ct, 'cur', 'after-tax profit'), step('Dividend tax = dividend × ' + F.num(divT * 100) + '%', x.dt, 'cur', 'dividend rate'), step('Total tax', x.corp, 'cur', 'corporate + dividend')],
        method: ['Calculate corporate income tax on profit', 'Subtract it to find the dividend paid out', 'Calculate dividend tax on that dividend', 'Add both taxes'] });
      if (ask === 'eff') parts.push({ ask: ['What is the effective tax rate as a corporation?'], answer: x.corp / profit, unit: 'pct', dp: 2, traps: [{ v: corp + divT, why: 'The dividend tax is levied on a smaller base, so you can\'t simply add the rates.' }],
        steps: [step('Effective rate = total tax / profit = ' + C(x.corp) + ' / ' + C(profit), x.corp / profit, 'pct', 'definition', 2)] });
      return {
        intro: [nm + ' runs a business earning ' + C(profit) + ' in annual profit and compares legal forms.'],
        facts: [fact('Personal tax', r1, 'pct', 'Personal income tax is ' + F.num(r1 * 100) + '% up to ' + C(b1) + ' and ' + F.num(r2 * 100) + '% above.', { dp: 0 }), fact('Corporate tax', corp, 'pct', 'Corporate income tax is a flat ' + F.num(corp * 100) + '%', { dp: 0 }), fact('Dividend tax', divT, 'pct', 'and dividend tax is ' + F.num(divT * 100) + '%.', { dp: 0 })],
        layouts: ['sentence'], parts: parts
      };
    }
  });

  /* ---------------- bid / ask, dealer vs broker ---------------- */
  var STOCKS = [['ASML Holding', 640, 0.1], ['Heineken', 85, 0.04], ['Philips', 24, 0.02], ['Adyen', 1400, 0.5], ['Shell', 32, 0.01], ['ING Groep', 15, 0.01], ['Unilever', 52, 0.02], ['Ahold Delhaize', 30, 0.02]];
  FSM.addSkill({
    id: 'fin_w1_bidask', topic: 'fin_w1', title: 'Bid/ask spread and transaction costs',
    formula: 'Effective transaction cost = shares × ½ × spread + commission',
    build: function (r, c) {
      var st = r.pick(STOCKS);
      var bid = h.r2(st[1] * r.range(0.9, 1.1, 0.01));
      var spread = st[2] * r.int(1, 5);
      var ask = h.r2(bid + spread);
      var n = r.range(100, 3000, 50), comm = r.pick([2, 3, 4.9, 6, 7.5, 10]);
      var x = FSM.calc.tradeCost(n, bid, ask, comm);
      var sell = r.chance(0.3);
      var market = r.pick(['dealer', 'broker']);
      var payDealer = sell ? n * bid - comm : x.dealerPay;
      var parts = [
        { ask: ['What is the bid/ask spread per share?', 'Calculate the spread.'], answer: x.spread, unit: 'cur', dp: 2, traps: [{ v: x.mid, why: 'That is the midpoint, not the spread.' }], steps: [step('Spread = ask − bid = €' + ask.toFixed(2) + ' − €' + bid.toFixed(2), x.spread, 'cur', 'quotes', 2)] },
        { ask: [market === 'dealer' ? 'Through a dealer (market maker), what is your total transaction cost including commission?' : 'If the order is matched at the midpoint (broker market), what is your total transaction cost?', 'What is the effective transaction cost in a ' + market + ' market?'],
          answer: market === 'dealer' ? x.dealerCost : x.brokerCost, unit: 'cur', dp: 2,
          traps: market === 'dealer' ? [{ v: n * x.spread + comm, why: 'Compared to the fair (midpoint) price you lose only HALF the spread.' }, { v: n * x.spread / 2, why: 'Add the commission.' }] : [{ v: x.dealerCost, why: 'At the midpoint you pay no spread — only commission.' }],
          steps: market === 'dealer' ? [step('Half spread × shares = ½ × €' + x.spread.toFixed(2) + ' × ' + F.num(n), n * x.spread / 2, 'cur', 'formula sheet', 2), step('+ commission', comm, 'cur', 'broker fee', 2), step('Effective cost', x.dealerCost, 'cur', 'sum', 2)] : [step('Midpoint = (' + bid.toFixed(2) + ' + ' + ask.toFixed(2) + ') / 2', x.mid, 'cur', 'average of bid and ask', 3), 'No spread cost at the midpoint.', step('Effective cost = commission', comm, 'cur', 'broker fee', 2)] },
        { ask: [sell ? 'If you SELL through a dealer, how much do you receive in total (after commission)?' : 'Through a dealer, how much do you pay in total for the shares (including commission)?'], answer: payDealer, unit: 'cur', dp: 2,
          traps: sell ? [{ v: n * ask - comm, why: 'Sellers receive the BID (the lower price).' }] : [{ v: n * bid + comm, why: 'Buyers pay the ASK (the higher price).' }, { v: n * ask, why: 'Add the commission.' }],
          steps: sell ? [step(F.num(n) + ' × €' + bid.toFixed(2) + ' (bid)', n * bid, 'cur', 'sellers get the bid', 2), step('− commission', comm, 'cur', 'fee', 2), step('Received', payDealer, 'cur', 'net', 2)] : [step(F.num(n) + ' × €' + ask.toFixed(2) + ' (ask)', n * ask, 'cur', 'buyers pay the ask', 2), step('+ commission', comm, 'cur', 'fee', 2), step('Total paid', payDealer, 'cur', 'sum', 2)] }
      ];
      c.setCur('EUR');
      return {
        intro: ['You want to ' + (sell ? 'trade' : 'buy') + ' ' + F.num(n) + ' shares of ' + st[0] + ' on Euronext Amsterdam. Your broker charges €' + F.num(comm, 2) + ' per trade.'],
        facts: [fact('Bid', bid, 'cur', 'The quote shows a bid of €' + bid.toFixed(2), { dp: 2 }), fact('Ask', ask, 'cur', 'and an ask of €' + ask.toFixed(2) + '.', { dp: 2 })],
        layouts: ['sentence', 'table'], parts: r.chance(0.5) ? parts : parts.slice(1)
      };
    }
  });

  /* ---------------- share issuance chain ---------------- */
  FSM.addSkill({
    id: 'fin_w1_shares', topic: 'fin_w1', title: 'Primary vs secondary market: capital raised & ownership',
    formula: 'Company receives money only when NEW shares are issued (primary market)',
    build: function (r, c) {
      var founder = r.range(50, 500, 10) * 1000, vc = r.range(10, 100, 5) * 1000, pVC = r.range(2, 20, 0.5);
      var ipo = r.range(20, 200, 5) * 1000, pIPO = h.r2(pVC * r.range(1.3, 2.5, 0.1));
      var sec = r.range(1, 20, 1) * 1000, pSec = h.r2(pIPO * r.range(0.9, 1.4, 0.05));
      var nm = r.pick(['Lisa', 'Noor', 'Sem', 'Julia', 'Bram', 'Elena']);
      var total = vc * pVC + ipo * pIPO, out = founder + vc + ipo;
      var C = c.C;
      var q = r.pick(['raised', 'cap', 'own', 'stage3']);
      var part = {
        raised: { ask: ['How much capital has the company raised in total across all three stages?'], answer: total, unit: 'cur', traps: [{ v: total + sec * pSec, why: 'Stage 3 is a secondary-market trade between investors — the company gets nothing.' }],
          steps: [step('Stage 1 (new shares): ' + F.num(vc) + ' × ' + C(pVC, 2), vc * pVC, 'cur', 'primary'), step('Stage 2 IPO (new shares): ' + F.num(ipo) + ' × ' + C(pIPO, 2), ipo * pIPO, 'cur', 'primary'), step('Stage 3: existing shares change hands', 0, 'cur', 'secondary'), step('Total raised', total, 'cur', 'sum')] },
        cap: { ask: ['What is the market capitalisation right after stage 3?'], answer: out * pSec, unit: 'cur', traps: [{ v: (out + sec) * pSec, why: 'Stage 3 does not create new shares.' }, { v: out * pIPO, why: 'Use the latest market price.' }],
          steps: [step('Shares outstanding = ' + F.num(founder) + ' + ' + F.num(vc) + ' + ' + F.num(ipo), out, 'num', 'stage 3 adds none', 0), step('Market cap = shares × ' + C(pSec, 2), out * pSec, 'cur', 'latest price')] },
        own: { ask: ['What percentage of the company does ' + nm + ' own after stage 3?'], answer: founder / out, unit: 'pct', dp: 2, traps: [{ v: founder / (founder + vc), why: 'The IPO shares also dilute the founder.' }, { v: founder / (out + sec), why: 'Stage 3 adds no new shares.' }],
          steps: [step('Shares outstanding', out, 'num', 'founder + VC + IPO', 0), step('Ownership = ' + F.num(founder) + ' / ' + F.num(out), founder / out, 'pct', 'founder shares', 2)] },
        stage3: { ask: ['How much does the company receive from the stage 3 transaction?'], answer: 0, unit: 'cur', traps: [{ v: sec * pSec, why: 'Secondary-market trades are between investors; the company receives nothing.' }],
          steps: [step('Existing shares sold by the VC to another investor', 0, 'cur', 'secondary market')] }
      }[q];
      return {
        intro: [c.company + ' was founded by ' + nm + ', who owns all ' + F.num(founder) + ' shares.'],
        facts: [fact('Stage 1', vc, 'num', 'Stage 1: to fund expansion, ' + F.num(vc) + ' newly issued shares are sold to a venture capital firm for ' + C(pVC, 2) + ' each.'),
          fact('Stage 2', ipo, 'num', 'Stage 2: in its IPO the company issues ' + F.num(ipo) + ' new shares at ' + C(pIPO, 2) + '; existing owners sell nothing.'),
          fact('Stage 3', sec, 'num', 'Stage 3: an investor buys ' + F.num(sec) + ' shares from the VC on the exchange at ' + C(pSec, 2) + ' each.')],
        layouts: ['sentence'],
        parts: [part, { kind: 'choice', ask: ['Stage 3 is a…'], choices: ['secondary-market transaction', 'primary-market transaction', 'direct listing', 'initial public offering'], correctChoice: 0, why: 'Existing shares change hands between investors (like selling a used car).' }]
      };
    }
  });

  /* ---------------- concepts ---------------- */
  FSM.addConcepts({
    id: 'fin_w1_concepts', topic: 'fin_w1', title: 'Finance, institutions & markets concepts',
    items: [
      { term: 'Accrual basis', cat: 'acc', defs: ['Revenues and expenses are recorded when they occur, not when cash changes hands.', 'The method accountants (and GAAP) use.'] },
      { term: 'Cash basis', cat: 'acc', defs: ['Revenues are recognised when cash is received and expenses when cash is paid.', 'The focus of financial managers.'] },
      { term: 'Sole proprietorship', cat: 'form', defs: ['A business owned by one person who receives all profits and has unlimited liability.'] },
      { term: 'Partnership', cat: 'form', defs: ['A business owned by two or more people; owners have unlimited liability and may cover each other\'s debts.'] },
      { term: 'Corporation', cat: 'form', defs: ['A legal entity whose owners have limited liability, with transferable shares and double taxation.'] },
      { term: 'Double taxation', cat: 'form', defs: ['Corporate income is taxed once as profit and again as dividend income when paid out.'] },
      { term: 'Commercial bank', cat: 'inst', defs: ['A bank where consumers and firms open accounts and get loans; it earns the spread between loan and savings rates.'] },
      { term: 'Investment bank', cat: 'inst', defs: ['A bank that helps firms raise capital (e.g. issuing shares) and trades directly in financial markets; not for consumers.'] },
      { term: 'Money market', cat: 'mkt', defs: ['The market for short-term securities with maturities of one year or less.'] },
      { term: 'Capital market', cat: 'mkt', defs: ['The market for long-term funds (more than one year), such as bonds and stocks.'] },
      { term: 'Primary market', cat: 'mkt', defs: ['Where new securities are sold for the first time — the company receives the money.'] },
      { term: 'Secondary market', cat: 'mkt', defs: ['Where existing securities are traded between investors — the company receives nothing.'] },
      { term: 'Initial public offering (IPO)', cat: 'mkt', defs: ['The first time a company lists its shares on a stock exchange, usually issuing new shares.'] },
      { term: 'Direct listing', cat: 'mkt', defs: ['Going public by letting existing shares trade on an exchange without issuing new shares — no new money is raised.'] },
      { term: 'Bid price', cat: 'trade', defs: ['The (lower) price you receive when you sell a share.'] },
      { term: 'Ask price', cat: 'trade', defs: ['The (higher) price you pay when you buy a share.'] },
      { term: 'Dealer market', cat: 'trade', defs: ['You trade directly with a market maker: buy at the ask, sell at the bid, plus commission.'] },
      { term: 'Broker market', cat: 'trade', defs: ['The broker matches buyer and seller and the trade settles at the bid/ask midpoint, plus commission.'] },
      { term: 'Insider trading', cat: 'trade', defs: ['Trading on material information that is not yet public — illegal on stock markets.'] },
      { term: 'Prediction market', cat: 'trade', defs: ['A platform for betting on outcomes; zero- or negative-sum, lightly regulated, and you own nothing.'] },
      { term: 'Market efficiency', cat: 'trade', defs: ['Prices adjust almost instantly to new public information, so trading on public news rarely beats the market.'] },
      { term: 'Shareholder wealth maximization', cat: 'goal', defs: ['The goal of the firm in finance: take only actions expected to increase the owners\' wealth, measured by the share price.'] },
      { term: 'Profit maximization', cat: 'goal', defs: ['Maximising (total) EPS — rejected as the firm\'s goal because it ignores timing, cash flows and risk.'] },
      { term: 'Stakeholders', cat: 'goal', defs: ['Groups with an economic link to the firm who are not owners: employees, customers, suppliers, creditors, the community.'] },
      { term: 'Marginal cost–benefit analysis', cat: 'goal', defs: ['The main economic principle in managerial finance: only take an action when its marginal benefits exceed its marginal costs.'] },
      { term: 'Agency problem', cat: 'gov', defs: ['The conflict between shareholders (principals) and managers (agents) who may pursue their own interests instead of shareholder wealth.'] },
      { term: 'Agency costs', cat: 'gov', defs: ['Costs shareholders bear because managers pursue their own interests — e.g. a lavish corporate jet, auditing costs, or bad investment choices.'] },
      { term: 'Corporate governance', cat: 'gov', defs: ['The rules, processes and laws by which companies are operated, controlled and regulated.'] },
      { term: 'Stock options', cat: 'gov', defs: ['Compensation that lets managers buy shares at a fixed price, so they gain when the share price rises — aligning them with shareholders.'] },
      { term: 'Restricted stock', cat: 'gov', defs: ['Shares paid as compensation that only fully transfer to the employee after conditions (e.g. years of service) are met — the vesting period.'] },
      { term: 'Activist investors', cat: 'gov', defs: ['Investors who build a stake in an underperforming firm to push management to change, e.g. by winning board seats.'] },
      { term: 'Institutional investors', cat: 'gov', defs: ['Professionals such as pension funds, mutual funds, banks and insurers that manage large holdings and can pressure management.'] },
      { term: 'Sarbanes-Oxley Act (SOX)', cat: 'gov', defs: ['2002 US law after accounting scandals: oversight of auditors, tougher fraud penalties, stricter disclosure and ethics/board rules.'] },
      { term: 'Business ethics', cat: 'gov', defs: ['Standards of conduct or moral judgment for people in business; violating them (fraud, insider trading, bribery) destroys value.'] },
      { term: 'Marginal tax rate', cat: 'tax', defs: ['The tax rate on the next euro/dollar of income — the rate that matters for business decisions.'] },
      { term: 'Average tax rate', cat: 'tax', defs: ['Total tax divided by taxable income; under progressive rates it is always below the marginal rate.'] },
      { term: 'Limited partnership (LP)', cat: 'form', defs: ['General partners run the firm with unlimited liability; limited (silent) partners only invest and have limited liability.'] },
      { term: 'Limited liability partnership (LLP)', cat: 'form', defs: ['All partners may manage the business and all have limited liability — common for law and accounting firms.'] },
      { term: 'Shadow banking system', cat: 'inst', defs: ['Institutions that lend like banks but take no deposits, so they escape bank regulation (e.g. funds lending via investment banks).'] },
      { term: 'Private placement', cat: 'mkt', defs: ['Selling new securities directly to one investor or a small group (e.g. an insurer or pension fund) instead of to the public.'] },
      { term: 'Rights offering', cat: 'mkt', defs: ['Selling new shares to the firm\'s existing stockholders.'] },
      { term: 'Underwriting', cat: 'mkt', defs: ['The investment bank guarantees the issuer a price by buying the new securities and bearing the risk of reselling them.'] },
      { term: 'Red herring', cat: 'mkt', defs: ['The preliminary prospectus given to investors while the SEC reviews the registration statement.'] },
      { term: 'Venture capitalists', cat: 'mkt', defs: ['Firms that pool money from (institutional) investors to buy equity in young, fast-growing private companies, usually taking a board seat.'] },
      { term: 'Angel investors', cat: 'mkt', defs: ['Wealthy individuals who invest their own money in promising start-ups for a share of the equity.'] },
      { term: 'Eurobond', cat: 'mkt', defs: ['A bond, usually in dollars, sold to investors outside the issuer\'s home country (e.g. a US firm\'s dollar bond sold in Europe).'] },
      { term: 'Foreign bond', cat: 'mkt', defs: ['A bond issued by a foreign firm or government in the investor\'s home currency and home market (e.g. a US firm\'s Swiss-franc bond sold in Switzerland).'] },
      { term: 'Random walk hypothesis', cat: 'trade', defs: ['In efficient markets prices move unpredictably, because they only react to new (unpredictable) information.'] },
      { term: 'Behavioral finance', cat: 'trade', defs: ['A field combining finance and psychology that argues prices can deviate from true value for long periods, creating predictable patterns.'] },
      { term: 'Liquidity (of a market)', cat: 'trade', defs: ['The ability to buy or sell a security quickly without moving its price.'] }
    ],
    groups: {
      'Strengths of a corporation': ['Limited liability', 'Easily transferable ownership', 'Long life of the firm', 'Better access to financing'],
      'Weaknesses of a sole proprietorship': ['Unlimited liability', 'Limited fund-raising power', 'Lacks continuity when the owner dies'],
      'Weaknesses of a corporation': ['Double taxation', 'More expensive to organise', 'More regulation', 'Lack of secrecy']
    },
    scenarios: [
      { q: ['Mark sells 100 Meta shares to Jack on the exchange. Where does this happen?', 'You buy a used Hyundai from a neighbour — which market is this the stock-market equivalent of?'], a: 'Secondary market' },
      { q: ['A start-up sells newly created shares to a venture capital fund. Which market?'], a: 'Primary market' },
      { q: ['Spotify went public without issuing new shares. What is this called?'], a: 'Direct listing' },
      { q: ['A company records a sale when the contract is signed, even though the customer pays next year. Which basis?'], a: 'Accrual basis' },
      { q: ['An Apple employee buys Apple shares the day before a confidential earnings surprise is published. What is this?'], a: 'Insider trading' },
      { q: ['You read positive news on a website and buy immediately, but the price already rose. Which concept explains this?'], a: 'Market efficiency' },
      { q: ['A firm needs funds for 3 months and issues 90-day commercial paper. Which market?'], a: 'Money market' },
      { q: ['Project A earns more total EPS over 3 years; project B earns less but much sooner and more reliably. Finance prefers B. Why is A\'s higher total not decisive?', 'A manager picks the project with the highest total profit, ignoring when it arrives and how risky it is. Which goal is he (wrongly) following?'], a: 'Profit maximization' },
      { q: ['A CEO uses company money for a private jet that mainly serves her own comfort. The loss to shareholders is called…'], a: 'Agency costs' },
      { q: ['The board gives the CEO the right to buy 100,000 shares at €45 for the next five years. What is this?'], a: 'Stock options' },
      { q: ['A hedge fund buys 10% of an underperforming firm and demands two board seats. Who is this?'], a: 'Activist investors' },
      { q: ['A start-up sells new shares only to its current shareholders. What kind of offering?'], a: 'Rights offering' },
      { q: ['Before SEC approval, investors receive a preliminary prospectus with a red warning on the cover. What is it called?'], a: 'Red herring' },
      { q: ['Goldman Sachs buys all new shares from the issuer at a fixed price and resells them to investors. What role is this?'], a: 'Underwriting' },
      { q: ['A US company issues bonds in Swiss francs to Swiss investors in Switzerland. What is this?'], a: 'Foreign bond', opts: ['Eurobond', 'Private placement', 'Rights offering'] },
      { q: ['A US company sells dollar bonds to investors in Germany and Belgium. What is this?'], a: 'Eurobond', opts: ['Foreign bond', 'Private placement', 'Rights offering'] },
      { q: ['Which tax rate should a manager use to judge the tax effect of one extra project?'], a: 'Marginal tax rate', opts: ['Average tax rate', 'Corporate tax rate on last year\'s profit', 'Dividend tax rate'] },
      { q: ['A law firm where every partner can manage the business but none is personally liable for the firm\'s debts is a…'], a: 'Limited liability partnership (LLP)' }
    ],
    tf: [
      { s: 'Most firms are corporations, but most business income is earned by sole proprietorships and partnerships.', t: false, why: 'The opposite: most firms are proprietorships/partnerships, most income comes from corporations.' },
      { s: 'When you buy shares in a dealer market you pay the ask price.', t: true, why: 'Buyers pay the higher ask; sellers get the lower bid.' },
      { s: 'A company receives money every time its shares are traded on the stock exchange.', t: false, why: 'Only when new shares are issued (primary market).' },
      { s: 'Prediction markets are negative-sum for the average participant.', t: true, why: 'The market maker takes a cut, and one person\'s win is another\'s loss.' },
      { s: 'Small firms can often borrow more as a sole proprietorship because the owner is personally liable.', t: true, why: 'Personal liability gives lenders extra security.' },
      { s: 'The goal of the firm in finance is to maximise profit (EPS).', t: false, why: 'It is to maximise shareholder wealth (share price). Profit maximisation ignores timing, cash flows and risk.' },
      { s: 'Maximising shareholder wealth means managers may ignore employees, customers and suppliers.', t: false, why: 'Unhappy stakeholders hurt future cash flows, so creating shareholder value requires satisfying them — within legal and ethical limits.' },
      { s: 'Holding cash flows fixed, investors pay more for a less risky firm.', t: true, why: 'Investors are risk averse.' },
      { s: 'Interest is tax-deductible for a corporation, but dividends are not.', t: true, why: 'That is why debt has a tax shield.' },
      { s: 'Under a progressive tax system the average tax rate is higher than the marginal tax rate.', t: false, why: 'The average rate is always below the marginal rate.' },
      { s: 'The Securities Act of 1933 regulates secondary-market trading; the 1934 Act regulates new issues.', t: false, why: 'It is the other way round: 1933 = primary market (new issues), 1934 = secondary trading and created the SEC.' },
      { s: 'The Glass-Steagall Act (1933) separated commercial banking from investment banking and created the FDIC.', t: true, why: 'Repealed in 1999 by the Gramm-Leach-Bliley Act.' },
      { s: 'In a dealer market, if the same dealer handles both the buyer and the seller, it earns the full bid/ask spread.', t: true, why: 'Each side pays half the spread.' },
      { s: 'Individuals are net demanders of funds; businesses are net suppliers.', t: false, why: 'Individuals as a group save more than they borrow (net suppliers); businesses and governments are net demanders.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
