/* Finance Week 5 — extra material from Zutter & Smart 9.5, 12.1, 13.1 */
(function (root) {
  var FSM = root.FSM, h = FSM.h, F = FSM.fmt, step = h.step;
  FSM.calc = FSM.calc || {};
  FSM.calc.recap = function (o) { // o: value, shares, debt, rd, nop[], tax
    var t = o.tax || 0, sh1 = o.shares * (1 - o.debt / o.value), I = o.debt * o.rd;
    return { sh1: sh1, I: I, indiff: o.rd * o.value,
      eps0: o.nop.map(function (n) { return n * (1 - t) / o.shares; }), eps1: o.nop.map(function (n) { return (n - I) * (1 - t) / sh1; }) };
  };
  FSM.calc.beCF = function (inv, r, n) { return inv * r / (1 - Math.pow(1 + r, -n)); };

  FSM.addSkill({
    id: 'fin_w5_recap', topic: 'fin_w5', title: 'Recapitalization: EPS with and without debt',
    formula: 'EPS = (NOP − interest)(1 − T) / shares; indifference NOP = r_d × total value',
    build: function (r, c) {
      var C = c.C, shares = r.range(1, 10, 0.5) * 1e6, price = r.range(20, 200, 5), value = shares * price, w = r.pick([0.25, 0.3, 0.4, 0.5, 0.6]);
      var debt = value * w, rd = r.range(4, 9, 0.5) / 100, base = value * r.range(rd + 0.02, rd + 0.06, 0.005), sw = r.pick([0.3, 0.4, 0.5]);
      var nop = [base * (1 - sw), base, base * (1 + sw)].map(function (x) { return h.r0(x / 1000) * 1000; });
      var tax = r.chance(0.5) ? 0 : r.pick([0.21, 0.25]);
      var x = FSM.calc.recap({ value: value, shares: shares, debt: debt, rd: rd, nop: nop, tax: tax });
      var sc = r.int(0, 2), names = ['a recession', 'a normal year', 'a boom'];
      return {
        intro: [c.company + ' is all-equity financed: ' + F.num(shares) + ' shares worth ' + C(price) + ' each (' + C(value) + ' in total). It plans to issue ' + C(debt) + ' of bonds at ' + F.num(rd * 100, 1) + '% and use the money to buy back shares at the same price. ' + (tax ? 'The tax rate is ' + F.num(tax * 100) + '%.' : 'Ignore taxes.')],
        facts: [], layouts: ['sentence'],
        statement: null,
        parts: [
          { ask: ['Expected net operating profit (EBIT) is ' + C(nop[0]) + ' in a recession, ' + C(nop[1]) + ' in a normal year and ' + C(nop[2]) + ' in a boom. What is EPS after the recapitalization in ' + names[sc] + '?'], answer: x.eps1[sc], unit: 'cur', dp: 2,
            traps: [{ v: x.eps0[sc], why: 'That is EPS WITHOUT debt.' }, { v: (nop[sc] - x.I) * (1 - tax) / shares, why: 'After the buyback there are fewer shares.' }],
            steps: [step('Shares bought back = ' + C(debt) + ' / ' + C(price), shares - x.sh1, 'num', 'buyback'), step('Shares left', x.sh1, 'num', 'remaining'), step('Interest = ' + C(debt) + ' × ' + F.num(rd * 100, 1) + '%', x.I, 'cur', 'fixed cost'), step('EPS = (' + C(nop[sc]) + ' − ' + C(x.I) + ')' + (tax ? ' × (1 − ' + F.num(tax * 100) + '%)' : '') + ' / ' + F.num(x.sh1), x.eps1[sc], 'cur', 'levered EPS', 2)] },
          { ask: ['At what level of operating profit is EPS the same with and without the recapitalization?'], answer: x.indiff, unit: 'cur', traps: [{ v: x.I, why: 'At NOP = interest, levered EPS is zero, not equal to unlevered EPS.' }, { v: base, why: 'Indifference is where the return on assets equals the cost of debt.' }],
            steps: [step('Return on assets must equal the cost of debt: ' + F.num(rd * 100, 1) + '% × ' + C(value), x.indiff, 'cur', 'indifference point')] },
          { kind: 'choice', ask: ['What happens to shareholders\' expected return and risk after the recapitalization?'], choices: ['Expected EPS/ROE rises AND risk rises', 'Expected EPS/ROE rises and risk falls', 'Expected EPS/ROE falls and risk rises', 'Nothing changes'], correctChoice: 0, why: 'Expected NOP (' + C(nop[1]) + ') is above the indifference point, so leverage raises expected EPS, but EPS swings more (financial risk). Whether the share price rises depends on whether the higher return outweighs the higher required return.' }
        ]
      };
    }
  });

  FSM.addSkill({
    id: 'fin_w5_project_risk', topic: 'fin_w5', title: 'Project risk: break-even cash inflow & scenario range',
    formula: 'Break-even cash inflow = annuity payment that gives NPV = 0; range = NPV(best) − NPV(worst)',
    build: function (r, c) {
      var C = c.C, inv = r.range(10, 500, 5) * 1000, k = r.range(6, 14, 0.5) / 100, n = r.int(4, 15);
      var be = FSM.calc.beCF(inv, k, n), af = (1 - Math.pow(1 + k, -n)) / k;
      var cfs = [be * r.range(0.6, 0.9, 0.05), be * r.range(1.0, 1.2, 0.02), be * r.range(1.25, 1.6, 0.05)].map(function (v) { return h.r0(v / 100) * 100; });
      var npv = cfs.map(function (cf) { return cf * af - inv; });
      return {
        intro: [c.company + ' considers a project costing ' + C(inv) + ' that gives equal annual cash inflows for ' + n + ' years. Its cost of capital is ' + F.num(k * 100, 1) + '%.'],
        facts: [], layouts: ['sentence'],
        parts: [
          { ask: ['What is the minimum annual cash inflow for the project to be acceptable (NPV ≥ 0)?', 'What is the break-even cash inflow?'], answer: be, unit: 'cur', dp: 2, traps: [{ v: inv / n, why: 'This ignores the time value of money.' }, { v: inv * (1 + k) / n, why: 'Use the annuity formula.' }],
            steps: [step('Annuity factor = (1 − (1 + ' + F.num(k * 100, 1) + '%)^−' + n + ') / ' + F.num(k * 100, 1) + '%', af, 'num', 'PV of 1 per year', 4), step('Break-even CF = ' + C(inv) + ' / annuity factor', be, 'cur', 'NPV = 0', 2)] },
          { ask: ['Managers estimate annual inflows of ' + C(cfs[0]) + ' (pessimistic), ' + C(cfs[1]) + ' (most likely) and ' + C(cfs[2]) + ' (optimistic). What is the range of NPVs?'], answer: npv[2] - npv[0], unit: 'cur', dp: 0, traps: [{ v: cfs[2] - cfs[0], why: 'The range is between NPVs, not annual cash flows.' }],
            steps: [step('NPV(optimistic) = ' + C(cfs[2]) + ' × ' + F.num(af, 4) + ' − ' + C(inv), npv[2], 'cur', 'best'), step('NPV(pessimistic) = ' + C(cfs[0]) + ' × ' + F.num(af, 4) + ' − ' + C(inv), npv[0], 'cur', 'worst'), step('Range = best − worst', npv[2] - npv[0], 'cur', 'scenario analysis')] },
          { kind: 'choice', ask: ['What is the difference between sensitivity analysis and scenario analysis?'], choices: ['Sensitivity changes ONE input at a time; scenarios change several inputs together', 'Sensitivity uses probabilities; scenarios do not', 'They are the same', 'Scenarios change one input; sensitivity changes all inputs'], correctChoice: 0, why: 'Sensitivity analysis shows which single assumption moves NPV most; scenario analysis looks at whole worlds (worst/expected/best).' }
        ]
      };
    }
  });

  FSM.addConcepts({
    id: 'fin_w5_book', topic: 'fin_w5', title: 'Book: project risk, capital structure & WACC',
    items: [
      { term: 'Break-even cash inflow', cat: 'p', defs: ['The minimum level of annual cash inflow needed for a project to have NPV ≥ 0.'] },
      { term: 'Sensitivity analysis', cat: 'p', defs: ['Changing one NPV input at a time to see which assumption has the greatest effect.'] },
      { term: 'Scenario analysis', cat: 'p', defs: ['Calculating NPV under a few complete scenarios (e.g. worst, most likely, best) where several inputs change together.'] },
      { term: 'Simulation', cat: 'p', defs: ['Drawing many random combinations of inputs to get a whole distribution of possible NPVs.'] },
      { term: 'Recapitalization', cat: 'c', defs: ['Changing the debt/equity mix without raising money for new investment, e.g. borrowing to buy back shares.'] },
      { term: 'Levered firm', cat: 'c', defs: ['A firm that uses debt financing.'] },
      { term: 'Business risk', cat: 'c', defs: ['Risk from the firm\'s operations, regardless of how it is financed.'] },
      { term: 'Financial risk', cat: 'c', defs: ['Extra risk to shareholders caused by the fixed cost of debt (and preferred dividends).'] },
      { term: 'Optimal capital structure', cat: 'c', defs: ['The debt/equity mix that minimises the WACC and so maximises firm value.'] },
      { term: 'M&M irrelevance', cat: 'c', defs: ['In a perfect market (no taxes or frictions, same borrowing rate, same information), capital structure does not change firm value.'] },
      { term: 'Market value weights', cat: 'w', defs: ['WACC weights based on the market values of debt and equity; the book prefers these because they are forward-looking.'] },
      { term: 'Target weights', cat: 'w', defs: ['WACC weights based on the capital structure the firm aims for, rather than the historical one.'] },
      { term: 'Hurdle rate', cat: 'w', defs: ['The minimum return a project must earn; the WACC is the right hurdle only for projects as risky as the firm\'s average.'] }
    ],
    groups: { 'Ways to look at project risk': ['Break-even cash inflow', 'Sensitivity analysis', 'Scenario analysis', 'Simulation'] },
    scenarios: [
      { q: ['An analyst changes only the selling price, keeping everything else at the base case, and records the NPV.'], a: 'Sensitivity analysis' },
      { q: ['NPV is calculated for a "recession", "normal" and "boom" world, each with different prices, volumes and costs.'], a: 'Scenario analysis' },
      { q: ['A firm borrows €50m only to buy back shares.'], a: 'Recapitalization' },
      { q: ['A computer draws 10,000 random combinations of inputs to get a distribution of NPVs.'], a: 'Simulation' }
    ],
    tf: [
      { s: 'The book uses MARKET value weights in the WACC; the course seminars use BOOK values from the balance sheet.', t: true, why: 'On the exam follow the course method (book weights, r_d = interest / LT debt) unless told otherwise.' },
      { s: 'Leverage raises shareholders\' EPS whenever the return on assets is above the cost of debt.', t: true, why: 'Shareholders earn the positive spread on borrowed money; below the cost of debt the spread is negative.' },
      { s: 'More debt always raises the share price because expected EPS rises.', t: false, why: 'Risk rises too, so shareholders want a higher return; M&M show that in perfect markets the effects cancel.' },
      { s: 'The closer sales are to the operating break-even point, the higher the DOL.', t: true, why: 'Small EBIT base → large % changes.' },
      { s: 'A firm should use its own WACC to judge buying a company in a much less risky industry.', t: false, why: 'Use a hurdle rate that fits the risk of the investment (e.g. the target\'s WACC).' },
      { s: 'Break-even analysis on its own fully measures project risk.', t: false, why: 'It is static; it says nothing about the range of outcomes around break-even.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
