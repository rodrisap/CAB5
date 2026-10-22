/* Known answers from the seminar slides / Excel files. Each entry: function(near, ok) */
(function (root) {
  var FSM = root.FSM, C = FSM.calc;
  var K = FSM.known = {};
  K.forrester = function (near) {
    var x = C.credit({ P: 30, VC: 20, u0: 250000, u1: 300000, acp0: 70, acp1: 70, rrr: 0.12, b0: 0.05, b1: 0.075 });
    near(x.dCM, 500000, 1e-6, 'Forrester ΔCM'); near(x.dOther, 300000, 1e-6, 'Forrester Δbad debts');
    near(x.dAR, 287671.23, 1e-5, 'Forrester ΔAR'); near(x.costAR, 34520.55, 1e-5, 'Forrester AR cost'); near(x.net, 165479.45, 1e-5, 'Forrester net');
  };
  K.greenleaf = function (near) {
    var x = C.credit({ P: 500, VC: 350, u0: 10000, u1: 12000, acp0: 30, acp1: 30, rrr: 0, b0: 0.02, b1: 0.04 });
    near(x.cm0 - x.bad0, 1400000, 1e-6, 'GreenLeaf now'); near(x.cm1 - x.bad1, 1560000, 1e-6, 'GreenLeaf new');
  };
  K.klein = function (near) {
    var x = C.minACP({ P: 40, VC: 29, u0: 35000, u1: 37000, d: 0.02, p: 0.8, acp0: 65, rrr: 0.15 });
    near(x.dCM, 22000, 1e-6, 'Klein ΔCM'); near(x.disc, 23680, 1e-6, 'Klein discount'); near(x.need, 11200, 1e-6, 'Klein ΔAR needed');
    near(x.acp, 59.68, 0.001, 'Klein min ACP');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, C = FSM.calc, K = FSM.known;
  K.dreamCakes = function (near) { var x = C.discountCost(2.5, 5, 30); near(x.approx, 0.37436, 0.001, 'Dream Cakes approx'); near(x.exact, 0.4472, 0.001, 'Dream Cakes exact'); };
  K.jasmine = function (near) { near(C.discountLoan(8), 0.08696, 0.001, 'Jasmine discount loan'); near(C.discountLoan(6), 0.06383, 0.001, 'Discount loan 6%'); };
  K.metal = function (near) { var x = C.resourcesCCC(90, 90, 60, 9.5e6, 14e6, 5e6); near(x.oc, 180, 0, 'Metal OC'); near(x.ccc, 120, 0, 'Metal CCC'); near(x.total, 4.97e6, 0.002, 'Metal resources'); };
  K.quickmart = function (near) { var x = C.resourcesCCC(20, 0, 45, 36e6, 0, 36e6); near(x.ccc, -25, 0, 'QuickMart CCC'); near(x.total, -2.4658e6, 0.001, 'QuickMart resources'); };
  K.noordzeeRates = function (near) {
    near(C.ear(C.discountLoan(6), 150), 0.1625, 0.002, 'Harborview EAR');
    near(C.ear(C.simpleLoan(9, 65), 65), 0.0934, 0.002, 'Crestline EAR');
    near(Math.pow(1 + 0.096 / 12, 12) - 1, 0.1003, 0.002, 'Nordbank EAR');
    near(C.discountCost(3.4, 25, 125).exact, 0.1346, 0.002, 'FuelMaster EAR');
    near(C.discountCost(3.4, 10, 30).exact, 0.880, 0.002, 'RoutePro EAR');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, C = FSM.calc, K = FSM.known;
  K.choco = function (near) { var L = C.leverage({ cm: 360000, fc: 104000, interest: 60000, tax: 43120, pd: 14000, shares: 28000 });
    near(L.dol, 1.40625, 1e-6, 'Choco DOL'); near(L.T, 0.22, 1e-6, 'Choco T'); near(L.dfl, 1.4378, 0.0005, 'Choco DFL'); near(L.dtl, 2.0219, 0.0005, 'Choco DTL'); near(L.eacs, 138880, 1e-6, 'Choco EACS'); };
  K.diane = function (near) { var cmu = 24.5 - 9.5; near(3825 / cmu, 255, 0, 'Diane BE'); near(300 * cmu - 3825, 675, 0, 'Diane EBIT'); near(300 * cmu / (300 * cmu - 3825), 6.667, 0.001, 'Diane DOL'); };
  K.plastic = function (near) { var L = C.leverage({ cm: 75000, fc: 0, interest: 22500, T: 0.4, pd: 0, shares: 3500 }); near(L.eps, 9, 1e-6, 'Plastic EPS1'); near(L.dfl, 1.4286, 0.001, 'Plastic DFL');
    var L2 = C.leverage({ cm: 99500, fc: 0, interest: 22500, T: 0.4, pd: 0, shares: 3500 }); near(L2.eps, 13.2, 1e-6, 'Plastic EPS2'); };
  K.firmsAB = function (near) { near((12 - 4.2) * 0.75 / 30, 0.195, 1e-6, 'Firm A ROE'); near((12 - 1.5) * 0.75 / 70, 0.1125, 1e-6, 'Firm B ROE'); };
  K.brightsolar = function (near) { var x = C.wacc({ d: 23.3, p: 10, s: 50, rd: 0.06, rp: 0.08, rs: 0.12, T: 0.3 }); near(x.wacc, 0.0934, 0.001, 'BrightSolar WACC'); };
  K.noordzeeLev = function (near) {
    var a = C.leverage({ cm: 4312000, fc: 2450000, interest: 180000, tax: 420500, pd: 60000 });
    near(a.dol, 2.316, 0.001, 'NZ DOL 2025'); near(a.dfl, 1.162, 0.001, 'NZ DFL 2025'); near(a.dtl, 2.692, 0.001, 'NZ DTL 2025');
    var b = C.leverage({ cm: 5040000, fc: 2700000, interest: 260000, tax: 520000, pd: 60000 });
    near(b.dol, 2.154, 0.001, 'NZ DOL 2026'); near(b.dfl, 1.170, 0.001, 'NZ DFL 2026'); near(b.dtl, 2.520, 0.001, 'NZ DTL 2026');
    near(C.wacc({ d: 1200000, p: 500000, s: 2530000, rd: 0.065, rp: 0.09, rs: 0.105, T: 0.25 }).wacc, 0.08727, 0.001, 'NZ WACC 2025');
    near(C.wacc({ d: 1800000, p: 500000, s: 2920000, rd: 121200 / 1800000, rp: 0.095, rs: 0.115, T: 0.25 }).wacc, 0.09084, 0.001, 'NZ WACC 2026');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, C = FSM.calc, K = FSM.known;
  K.raiffeisen = function (near) { near(C.dividendTax(3400000, 600000, 0.25, false).net, 2550000, 1e-6, 'Raiffeisen no agreement'); near(C.dividendTax(3400000, 600000, 0.25, true).net, 3150000, 1e-6, 'Raiffeisen agreement'); };
  K.iberica = function (near) {
    near(C.dividendTax(600000, 300000, 0.2, false).net, 480000, 1e-6, 'Iberica dividend');
    var P = { ca: 72e6, ppe: 13.5e6, ip: 4.5e6, cl: 4.5e6, ncl: 13.5e6, cs: 18e6, re: 54e6 };
    var S = { ca: 5e6, bld: 2.5e6, ip: 2.5e6, cl: 1.5e6, ncl: 1.5e6, cs: 0.5e6, re: 6.5e6 };
    var x = C.consolidate(P, S, 10.5e6, 'debt', 1);
    near(x.cons.ta, 103.5e6, 1e-9, 'Iberica TA'); near(x.goodwill, 3.5e6, 1e-9, 'Iberica goodwill'); near(x.cons.ncl, 25.5e6, 1e-9, 'Iberica NCL'); near(x.cons.tle, 103.5e6, 1e-9, 'Iberica balances');
  };
  K.goldIron = function (near) {
    var P = { ca: 113000, ppe: 150000, cl: 203000, ncl: 0, cs: 100000, re: 50000 };
    // Gold already holds the investment, paid from cash earlier: model as cash-financed from a parent with 90,000 more CA
    var Pb = { ca: 113000 + 90000, ppe: 150000, cl: 203000, ncl: 0, cs: 100000, re: 50000 };
    var S = { ca: 65000, ppe: 80000, cl: 70000, ncl: 0, cs: 40000, re: 35000 };
    var x = C.consolidate(Pb, S, 90000, 'cash', 1);
    near(x.cons.ta, 423000, 1e-9, 'Gold/Iron TA'); near(x.goodwill, 15000, 1e-9, 'Gold/Iron goodwill');
    var y = C.consolidate(Pb, S, 90000, 'cash', 90000 / 80000);
    near(y.cons.ppe, 240000, 1e-9, 'Gold/Iron PPE after uplift'); near(y.goodwill, 5000, 1e-9, 'Gold/Iron goodwill after uplift');
  };
  K.powers = function (near) {
    var Pb = { ca: 50000 + 200000, ppe: 325000, cl: 100000, ncl: 0, cs: 300000, re: 175000 };
    var S = { ca: 80000, ppe: 145000, cl: 75000, ncl: 0, cs: 100000, re: 50000 };
    var x = C.consolidate(Pb, S, 200000, 'cash', 155000 / 145000);
    near(x.cons.ta, 650000, 1e-9, 'Powers TA'); near(x.goodwill, 40000, 1e-9, 'Powers goodwill');
  };
  K.velotrans = function (near) {
    var P = { ca: 3750000, ppe: 3050000, ip: 120000, cl: 1700000, ncl: 1800000, cs: 1500000, re: 1920000 };
    var S = { ca: 385000, ppe: 440000, cl: 220000, ncl: 250000, cs: 355000, re: 0 };
    // 600k new loan + 300k cash: model loan part by raising parent NCL and CA by 600k first, then pay 900k cash
    var Pl = Object.assign({}, P, { ca: P.ca + 600000, ncl: P.ncl + 600000 });
    var x = C.consolidate(Pl, S, 900000, 'cash', 1);
    near(x.goodwill, 545000, 1e-9, 'VeloTrans goodwill'); near(x.cons.ta, 7990000, 1e-9, 'VeloTrans TA'); near(x.cons.ncl, 2650000, 1e-9, 'VeloTrans NCL');
    var y = C.consolidate(Pl, S, 900000, 'cash', 840000 / 440000);
    near(y.goodwill, 145000, 1e-9, 'VeloTrans goodwill after uplift');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, C = FSM.calc, K = FSM.known;
  K.asml = function (near) { var x = C.tradeCost(600, 645.5, 645.6, 6); near(x.dealerCost, 36, 1e-6, 'ASML dealer'); near(x.brokerCost, 6, 1e-6, 'ASML broker'); near(x.spread, 0.1, 1e-6, 'ASML spread'); };
  K.maria = function (near) { var x = C.taxForms(100000, 50000, 0.2, 0.3, 0.25, 0.15); near(x.sole, 25000, 1e-9, 'Maria sole'); near(x.corp, 36250, 1e-9, 'Maria corp'); };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, K = FSM.known;
  K.noordzeeCase = function (near) {
    var y = FSM.noordzee.derive(JSON.parse(JSON.stringify(FSM.noordzee.BASE)));
    near(y[0].cr, 2.3077, 0.001, 'NZ current 2025'); near(y[1].cr, 2.2059, 0.001, 'NZ current 2026');
    near(y[0].invTurn, 4.6667, 0.001, 'NZ inv turnover 2025'); near(y[1].invTurn, 4.2527, 0.001, 'NZ inv turnover 2026');
    near(y[0].de, 0.9881, 0.001, 'NZ D/E 2025'); near(y[1].de, 1.1986, 0.001, 'NZ D/E 2026');
    near(y[0].roe, 0.4749, 0.001, 'NZ ROE 2025'); near(y[1].roe, 0.5137, 0.001, 'NZ ROE 2026');
    near(y[0].eps, 2.403, 0.001, 'NZ EPS 2025'); near(y[1].eps, 3.0, 0.001, 'NZ EPS 2026');
    near(y[0].pe, 3.537, 0.001, 'NZ P/E 2025'); near(y[1].pe, 3.4, 0.001, 'NZ P/E 2026');
    near(y[0].ni, 1261500, 1e-9, 'NZ NI 2025'); near(y[1].ni, 1560000, 1e-9, 'NZ NI 2026');
    near(y[0].re, 1530000, 1e-9, 'NZ RE 2025 plug'); near(y[1].re, 1920000, 1e-9, 'NZ RE 2026 plug');
    near(y[0].aai, 78.21, 0.001, 'NZ AAI 2025'); near(y[1].aai, 85.83, 0.001, 'NZ AAI 2026');
    near(y[0].acp, 58.66, 0.001, 'NZ ACP 2025'); near(y[1].acp, 40.56, 0.001, 'NZ ACP 2026');
    near(y[0].app, 50.84, 0.001, 'NZ APP 2025'); near(y[1].app, 53.45, 0.001, 'NZ APP 2026');
    near(y[0].w.wacc, 0.08727, 0.001, 'NZ WACC 2025 (case)'); near(y[1].w.wacc, 0.09084, 0.001, 'NZ WACC 2026 (case)');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, K = FSM.known;
  K.tlc = function (near) { var t = FSM.calc.tlc; near(t(10000, 4000, 1000, 0.076).total, 16140, 1e-9, 'TLC China'); near(t(8000, 6000, 1500, 0.076).total, 16678, 1e-9, 'TLC Vietnam'); near(t(12000, 1200, 0, 0.076).total, 14203.2, 1e-9, 'TLC EU'); };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, K = FSM.known;
  K.semper = function (near) { var x = FSM.calc.fundingStrategy({ perm: 135000, avgSeasonal: 101250, peakSeasonal: 990000, rS: 0.0625, rL: 0.08, rInvest: 0.05 }); near(x.aggr, 17128.13, 1e-5, 'Semper aggressive'); near(x.cons, 45562.5, 1e-6, 'Semper conservative'); };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  var FSM = root.FSM, K = FSM.known, C = FSM.calc;
  K.ch16 = function (near) {
    near(C.compBalance(1e6, 0.08, 0.2, 0).rate, 0.10, 1e-9, 'Estrada comp balance'); near(C.compBalance(1e6, 0.08, 0.2, 100000).rate, 0.0889, 0.001, 'Estrada with 100k balance');
    near(C.revolver(2e6, 1.5e6, 0.005, 112500).rate, 0.0767, 0.001, 'REH revolver'); near(C.cp(1e6, 995000, 90).ear, 0.02054, 0.002, 'Bertram CP EAR');
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) { var K = root.FSM.known, C = root.FSM.calc;
  K.ch19 = function (near) { near(C.ppp(1.2, 0, 0.1), 1.0909, 0.0005, 'Rolex PPP'); near(C.irp(0.69444, 0.005, 0.01), 0.691, 0.0005, 'Australia IRP'); };
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) { var K = root.FSM.known, C = root.FSM.calc;
  K.ch12_13 = function (near) { var x = C.recap({ value: 180e6, shares: 1e6, debt: 90e6, rd: 0.07, nop: [9e6, 18e6, 27e6] });
    near(x.eps1[1], 23.40, 1e-6, 'EMC EPS normal'); near(x.eps1[0], 5.40, 1e-6, 'EMC EPS recession'); near(x.indiff, 12.6e6, 1e-9, 'EMC indifference'); near(C.beCF(10000, 0.10, 15), 1314.74, 1e-4, 'break-even CF'); };
})(typeof window !== 'undefined' ? window : globalThis);
