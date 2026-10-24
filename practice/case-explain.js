/* Makes every model answer easier to follow:
   - calculations start with "Numbers you need — and where to find them" (which line of the case or question),
   - written answers start with "How to build your answer" and use short, plain points.
   Wraps FSM.cases.buildExam, so the exam-question trainer and the full case exam both get it. */
(function (root) {
  var FSM = root.FSM, F = FSM.fmt, H = FSM.caseHelpers, base = FSM.cases.buildExam;
  var E = H.E, P = H.P, N = H.N, Em = H.Em;

  function where(d) {
    return {
      Q: 'in the question text',
      IS: 'case → Income statement',
      BS: 'case → Balance sheet (€ millions), ' + d.year + ' column',
      BS2: 'case → Balance sheet, both columns (' + d.year + ' and ' + (d.year - 1) + ')',
      OPS: 'case → Operational & financial details',
      COGS: d.isNote ? 'case → the note under the income statement' : 'case → Operational & financial details',
      TAX: 'case → Income statement, line "Tax expense (' + P(d.T, 0) + ')"'
    };
  }
  function given(rows, after) {
    return '<div class="given"><div class="gv-h">Numbers you need — and where to find them</div><table>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td><td class="gv-w">' + r[2] + '</td></tr>'; }).join('') + '</table></div><div class="gv-h" style="margin-top:8px">' + (after || 'Step by step') + '</div>';
  }
  function how(text) { return '<div class="howto"><b>How to build your answer:</b> ' + text + '</div>'; }
  function add(p, pre) { if (p && pre) p.model = pre + (p.model || ''); }
  function part(q, id) { return q.parts.filter(function (p) { return p.id === id; })[0]; }
  function two(a) { return F.num(a[0], 1) + ' (' + 'this year) and ' + F.num(a[1], 1) + ' (last year)'; }

  function annotate(ex) {
    var d = ex.d, x = ex.x, W = where(d), v = d.variants || {};
    ex.questions.forEach(function (q) {
      var vv = v['q' + q.n] && v['q' + q.n].v, pv = v['q' + q.n] || {};
      var prefRow = ['Preferred shares, par value, dividend %', N(d.pref.n) + ' shares × ' + E(d.pref.par) + ' × ' + P(d.pref.pct, 0), W.OPS];
      var cccRows = [['Inventory', two(x.inv), W.BS2], ['Cost of goods sold (COGS)', E(d.cogs), W.COGS], ['Accounts receivable', two(x.ar), W.BS2], ['Credit sales', E(d.is.sales) + ' (all sales are on credit)', W.IS + ', "Net sales revenue"'], ['Accounts payable', two(x.ap), W.BS2], ['Credit purchases', E(d.creditPurch), W.COGS]];
      switch (q.n) {
        case 1:
          if (vv === 'legal') {
            add(part(q, '1a'), how('Name the feature → say in one sentence what it means → say why it helps ' + d.short + ' (growth, outside investor, protecting the owners). Three features = three short paragraphs.'));
            add(part(q, '1b'), given([['Pre-tax profit', E(pv.profit), W.Q], ['Corporate tax rate', P(d.T, 0), W.TAX], ['Dividend withholding tax', P(pv.wht, 0), W.Q]]));
          } else if (vv === 'market') {
            add(part(q, '1a'), given([['Number of shares', N(pv.shares), W.Q], ['Ask price (you BUY at the ask)', E(pv.ask, 2), W.Q], ['Bid price', E(pv.bid, 2), W.Q], ['Commission', '€0', W.Q]]));
            add(part(q, '1b'), how('Go through the steps one by one. For each: "raises funds" or "does not raise funds" + because. The test is simple: does the COMPANY issue NEW shares and receive the money (primary = yes), or do existing shares change hands between investors (secondary = no)?'));
          } else if (vv === 'ratios') {
            add(part(q, '1a'), given([['Current assets', F.num(x.ca[0], 1), W.BS + ', "Total current assets"'], ['Inventory', F.num(x.inv[0], 1), W.BS], ['Current liabilities', F.num(x.cl[0], 1), W.BS + ', "Total current liabilities"'], ['Total liabilities', F.num(x.tl[0], 1), W.BS], ['Total assets', F.num(x.ta[0], 1), W.BS]]));
            add(part(q, '1b'), given([['Net profit after taxes', E(x.NI), W.IS + ', last line'], prefRow, ['Common equity + retained earnings', F.num(x.common[0], 1) + ' + ' + F.num(x.re[0], 1), W.BS], ['Number of common shares', N(pv.shares), W.Q]]));
          } else if (vv === 'taxforms') {
            add(part(q, '1a'), how('Two advantages + two disadvantages of a corporation. Each: name it, then one sentence on what it means for the owner.'));
            add(part(q, '1b'), given([['Profit', E(pv.profit), W.Q], ['Personal tax brackets', P(pv.t1, 0) + ' up to ' + E(pv.b1) + ', ' + P(pv.t2, 0) + ' above', W.Q], ['Corporate tax', P(pv.corp, 0), W.Q], ['Dividend tax', P(pv.div, 0), W.Q]]));
          } else if (vv === 'cashaccrual') {
            add(part(q, '1a'), given([['Cost of goods (paid in cash)', E(pv.cost), W.Q], ['Sales (on credit)', E(pv.sales), W.Q], ['Collected before year-end', P(pv.coll, 0), W.Q]].concat(pv.borrow ? [['Loan', E(pv.borrow) + ' (financing, leave it out)', W.Q]] : [])));
            add(part(q, '1b'), how('1) Profit counts the full sale; cash only what customers paid. 2) The gap = receivables still open. 3) If sales keep growing on credit, the gap grows → the company may need to borrow. 4) Give one fix (collect faster or pay later).'));
          }
          break;
        case 2:
          if (!vv) { add(part(q, '2a'), given(cccRows)); add(part(q, '2b'), given([['Average inventory, A/R and A/P', 'the averages you already made in 2a', 'your answer to 2a']])); }
          else if (vv === 'opcycle') { add(part(q, '2a'), given(cccRows)); add(part(q, '2b'), how('Three levers, one per part of the CCC: inventory days ↓, collection days ↓, payment days ↑. For each say what to do and which number in 2a it lowers. End with one risk.')); }
          break;
        case 3:
          if (vv === 'credit') {
            ['3a', '3b', '3c'].forEach(function (id) { add(part(q, id), '<div class="given"><div class="gv-h">Where the numbers come from</div>All numbers are in the bullet list of the question (sales now/new, CM ratio, ACP now/new, bad-debt % now/new, required return).</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); });
            add(part(q, '3d'), how('Net effect = 3a − 3b (cost) − 3c. Positive → implement; negative → don\'t. Write the sum with the numbers.'));
          } else if (vv === 'options') {
            add(part(q, '3a'), given([['Amount needed', E(pv.amt), W.Q], ['Discount loan', pv.X + '%, ' + pv.d1 + ' days', W.Q], ['Regular loan', pv.Y + '% p.a. simple, ' + pv.d2 + ' days', W.Q], ['Supplier terms', pv.cd + '/' + pv.y + ', n/' + pv.z, W.Q + ' (' + pv.cd + '% discount if paid within ' + pv.y + ' days, otherwise pay in full by day ' + pv.z + ')']]));
            add(part(q, '3b'), given([['Period rates', 'from 3a', 'your answer to 3a'], ['Days of each option', pv.d1 + ', ' + pv.d2 + ', and ' + pv.z + ' − ' + pv.y + ' = ' + (pv.z - pv.y) + ' for the bill', W.Q]]));
            add(part(q, '3c'), how('1) Say the rule: one-off need → cheapest in euros (3a); recurring need → lowest EAR (3b). 2) Name the option. 3) Quote its number. The question says it is ' + (pv.recurring ? 'RECURRING' : 'ONE-OFF') + '.'));
          } else if (vv === 'discount') {
            ['3a', '3b', '3c'].forEach(function (id) { add(part(q, id), '<div class="given"><div class="gv-h">Where the numbers come from</div>All numbers are in the bullet list of the question.</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); });
            add(part(q, '3d'), how('Net = ΔCM (3a) − discount cost (3b) − cost of ΔA/R (3c; a saving counts as a plus). Positive → introduce it.'));
          } else if (vv === 'payables') {
            ['3a', '3b', '3c'].forEach(function (id) { add(part(q, id), given([['Invoice', E(pv.amt), W.Q], ['Terms', pv.cd + '/' + pv.y + ', n/' + pv.z + ' → N = ' + pv.z + ' − ' + pv.y + ' = ' + (pv.z - pv.y) + ' days', W.Q]])); });
            add(part(q, '3d'), how('Compare the exact cost (3c) with the bank rate (' + P(pv.bank, 0) + '). Cost higher than the bank → take the discount (borrow if needed). Then one sentence on stretching: cheaper, but it hurts the supplier relationship.'));
          }
          break;
        case 4:
          var levRows = [['Contribution margin', E(x.CM), W.IS], ['EBIT', E(x.EBIT), W.IS], ['Earnings before taxes (EBT)', E(x.EBT), W.IS], prefRow, ['Tax rate', P(d.T, 0), W.TAX]];
          if (!vv) {
            add(part(q, '4a'), given(levRows.slice(0, 2)));
            add(part(q, '4b'), given(levRows.slice(1)));
            add(part(q, '4c'), given([['DOL and DFL', 'from 4a and 4b', 'your answers']]) );
            add(part(q, '4c'), how(d.variants.q4c === 'eps' ? 'DTL = DOL × DFL. Then: "if sales rise 1%, EPS rises by DTL %". Use percentages, not euros.' : 'DTL = DOL × DFL. Then compare DOL and DFL: the bigger one is where the risk comes from (fixed operating costs vs fixed financing costs), and say what management should watch.'));
          } else if (vv === 'epsforecast') {
            add(part(q, '4a'), given(levRows));
            add(part(q, '4b'), given([['Net profit after taxes', E(x.NI), W.IS + ', last line'], prefRow, ['Common shares', N(pv.shares), W.Q]]));
          }
          break;
        case 5:
          if (vv === 'wacc') {
            add(part(q, '5a'), given([['Long-term debt', F.num(x.ltd[0], 1), W.BS], ['Preferred equity', F.num(x.pref[0], 1), W.BS], ['Common equity + retained earnings', F.num(x.common[0], 1) + ' + ' + F.num(x.re[0], 1), W.BS + ' (together = common equity)'], ['Interest expense (for r_d)', E(d.is.interest), W.IS], ['Cost of preferred and common equity', P(d.rp, 1) + ' and ' + P(d.rs, 1), W.OPS + ', "Cost of equity"'], ['Tax rate', P(d.T, 0), W.TAX]]));
            add(part(q, '5b'), how('1) WACC = the minimum return the company must earn for its investors. 2) Compare: project ' + P(pv.proj, 0) + ' vs your WACC. 3) Higher → accept, lower → reject.'));
          } else if (vv === 'tax') {
            var g5 = given([['Subsidiary\'s pre-tax profit', E(pv.pretax), W.Q], ['Foreign tax rate', P(pv.fr, 0), W.Q], ['Home (' + d.countryAdj + ') tax rate', P(d.T, 0), W.TAX + ' (the company\'s own rate)']]);
            add(part(q, '5a'), g5); add(part(q, '5b'), g5);
          } else if (vv === 'fx' || vv === 'equity') {
            q.parts.forEach(function (p) { if (p.fields) add(p, '<div class="given"><div class="gv-h">Where the numbers come from</div>All numbers are in the question text above.</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); });
          }
          break;
        case 6:
          if (vv === 'templates' && part(q, '6a') && part(q, '6a').fields) {
            add(part(q, '6a'), given([['Purchase price and how it is paid', Em(pv.price) + ', ' + P(pv.cashPct, 0) + ' cash / ' + P(1 - pv.cashPct, 0) + ' bank loan', W.Q], ['Cash and long-term debt before the purchase', F.num(x.cash[0], 1) + ' and ' + F.num(x.ltd[0], 1), W.BS], ['All other lines', 'unchanged', W.BS]]));
          } else if (part(q, '6a') && !part(q, '6a').fields) {
            var a6 = part(q, '6a');
            a6.model = how('Three short points: (1) the subsidiary\'s assets and liabilities are added line by line, (2) keeping the investment too would count the same thing twice, (3) the price above the subsidiary\'s equity becomes "excess of cost over book value".') +
              '<ol><li><b>What the investment is:</b> the parent paid for the subsidiary\'s net assets (its assets minus its liabilities).</li><li><b>What consolidation does:</b> it adds all those assets and liabilities line by line to the parent\'s balance sheet.</li><li><b>The problem:</b> if the investment stayed on the balance sheet as well, the same net assets would be counted <b>twice</b>.</li><li><b>The fix:</b> cancel the investment against the subsidiary\'s equity (the parent owns that equity, so it is not equity of the group).</li><li><b>What is left:</b> any amount paid above the subsidiary\'s equity → "excess of cost over book value" (later: asset uplift, then goodwill).</li></ol>';
          }
          if (part(q, '6b')) add(part(q, '6b'), given([['Partially consolidated balance sheet', 'the table in the question', W.Q], ['Market value above book value (uplift)', Em(pv.uplift), W.Q], ['Excess of cost over book value', 'the "Excess…" line of that table', W.Q]]));
          if (vv === 'full') q.parts.forEach(function (p) { add(p, '<div class="given"><div class="gv-h">Where the numbers come from</div>The two balance sheets in the question (€ thousands); the price paid = the "Investment in…" line.</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); });
          break;
        case 7:
          if (vv === 'inventory') {
            add(part(q, '7a'), how('Three decisions. For each: what to do → why stock goes down → why service stays OK. Link to the case (depots carrying the full range, suppliers picked on price, rising inventory).'));
            add(part(q, '7b'), how('For each of (a)–(e): ↑ or ↓, then "because…". Lead time drives cycle stock, variability drives safety stock; smaller stock means ordering smaller amounts more often.') + given([['Current lead time and variability', d.lead.L + ' days ± ' + d.lead.v + ' days', W.OPS], ['What the new supplier changes', 'see the question', W.Q]], 'Model answer'));
          } else if (vv === 'logistics') {
            add(part(q, '7a'), how('Two parts: the definition (plan, implement, control · efficient and effective flow and storage · goods, services, information · from origin to consumption · to meet customer requirements) and the goal (good service at the lowest total cost).'));
            add(part(q, '7b'), how('One sentence intro ("getting the…"), then all 7 Rs as a list, ideally with one example from the case.'));
          } else if (vv === 'utilities') {
            add(part(q, '7a'), how('List the five utilities, and after each: which function creates it.'));
            add(part(q, '7b'), how('One example each for time, place and quantity from the case, then at least one product factor (value, density, fragility, special handling) and how it changes logistics cost.'));
          } else if (vv === 'approaches') {
            add(part(q, '7a'), how('One sentence per department: what it wants from inventory and why.'));
            add(part(q, '7b'), how('Make three comparisons ("EOQ: … / JIT: …"), then a recommendation that uses the case\'s lead time (' + d.lead.L + ' ± ' + d.lead.v + ' days) and how suppliers are chosen.'));
          }
          break;
        case 8:
          if (vv === 'criteria') add(part(q, '8'), how('Five criteria. Each one: name it → explain what you would check → why it matters for ' + d.short + ' (not just price). One short paragraph each.'));
          else if (vv === 'supplier') add(part(q, '8'), how('For each of (a)–(e): ↑ or ↓ + because. Lead time → cycle stock; variability → safety stock; smaller stock → smaller, more frequent orders → order and transport costs ↑; less total stock → ROA ↑.') + given([['Current lead time and variability', d.lead.L + ' days ± ' + d.lead.v + ' days', W.OPS], ['What the new supplier changes', 'see the question', W.Q]], 'Model answer'));
          else if (vv === 'quadrant') { add(part(q, '8a'), how('For each item: its value (spend) and its risk (how many suppliers, what if it is missing) → the quadrant name.')); add(part(q, '8b'), how('Pick two categories and say how you would buy them and why.')); }
          else if (vv === 'abc') { add(part(q, '8a'), '<div class="given"><div class="gv-h">Where the numbers come from</div>The ten values in the question. Rank them from high to low first.</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); add(part(q, '8b'), how('A-items: how you control them. C-items: how you control them. Then why C-items still matter.')); }
          break;
        case 9:
          if (vv === 'tlc') {
            add(part(q, '9a'), how('1) Definition: all costs to get the goods to your door. 2) Name the cost elements. 3) Why better: a low price can hide high transport, duty and inventory costs.'));
            add(part(q, '9b'), given([['Units and price per unit', N(pv.units) + ' × ' + E(pv.price, 2), W.Q], ['Transport', E(pv.transport), W.Q], ['Duty (on price + transport)', P(pv.duty, 0), W.Q], ['VAT (on everything incl. duty)', P(pv.vat, 0), W.Q]]));
          } else if (vv === 'mode') {
            add(part(q, '9a'), how('Two modes. For each: the mode → the product/situation features that fit it (volume, value, urgency, distance, cost).'));
            var b9 = part(q, '9b');
            if (b9) b9.model = how('Lead time ↑ → cycle stock ↑; variability ↑ → safety stock ↑; goods on the way → in-transit stock; conclusion: more inventory and carrying cost, so compare suppliers on total landed cost.') +
              '<ol><li><b>Longer lead time</b> (weeks by sea instead of days by road) → ' + d.short + ' must cover more days between deliveries and orders bigger batches (full containers) → <b>cycle stock ↑</b>, reorder point ↑.</li><li><b>More uncertainty</b> (port delays, customs, weather) → <b>safety stock ↑</b>.</li><li><b>Goods on the water</b> for weeks → <b>in-transit (pipeline) inventory</b>, which ' + d.short + ' may own depending on the terms of sale.</li><li><b>Result:</b> total inventory and carrying costs go up, even if the purchase price is lower → compare on total landed cost.</li></ol>';
          } else if (vv === 'fob') { add(part(q, '9a'), how('For each term: who owns the goods in transit, who files claims, who pays the carrier, who bears the freight cost. A 4 × 2 table works well.')); add(part(q, '9b'), how('Whoever has more influence with carriers should control the freight → say which term gives the buyer control, and why.')); }
          else if (vv === 'scorecard') q.parts.forEach(function (p) { add(p, '<div class="given"><div class="gv-h">Where the numbers come from</div>The scoring rules and both carriers\' results are in the question. First turn each result into a score (0–5), then multiply by its weight.</div><div class="gv-h" style="margin-top:8px">Step by step</div>'); });
          break;
      }
    });
    return ex;
  }

  FSM.cases.buildExam = function (d) { return annotate(base(d)); };

  if (typeof document !== 'undefined' && document.createElement && document.head) {
    var css = document.createElement('style');
    css.textContent = '.given{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:6px 0;font-size:.9rem}.given table{width:100%;border-collapse:collapse}.given td{padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top}.given tr:last-child td{border-bottom:0}.given .gv-w{color:var(--muted);font-size:.85rem}.gv-h{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--muted);margin-bottom:4px}.howto{background:var(--accent-soft);border-radius:8px;padding:8px 10px;margin:6px 0 8px;font-size:.92rem}@media(max-width:560px){.given td{display:block;border-bottom:0;padding:1px 4px}.given tr{display:block;border-bottom:1px solid var(--line);padding:4px 0}}';
    document.head.appendChild(css);
  }
})(typeof window !== 'undefined' ? window : globalThis);
