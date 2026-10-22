/* The official FSM formula sheet (as handed out for the exam) */
(function (root) {
  var FSM = root.FSM = root.FSM || {};
  FSM.FORMULAS = [
    { group: 'Ratios', items: [
      ['Current ratio', 'Current assets ÷ Current liabilities'],
      ['Quick ratio', '(Current assets − Inventory) ÷ Current liabilities'],
      ['Inventory turnover', 'Cost of goods sold ÷ Average inventory'],
      ['Average age of inventory', '365 ÷ Inventory turnover'],
      ['Average collection period', 'Average accounts receivable ÷ Average credit sales per day'],
      ['Average payment period', 'Average accounts payable ÷ Average credit purchases per day'],
      ['Total asset turnover', 'Sales ÷ Total assets'],
      ['Debt ratio', 'Total liabilities ÷ Total assets'],
      ['Debt-to-equity ratio', 'Total liabilities ÷ Common stock equity'],
      ['Times interest earned', 'EBIT ÷ Interest'],
      ['Gross profit margin', 'Gross profit ÷ Sales'],
      ['Operating profit margin', 'Operating profit ÷ Sales'],
      ['Net profit margin', 'Earnings available for common stockholders ÷ Sales'],
      ['Earnings per share', 'Earnings available for common stockholders ÷ Number of common shares outstanding'],
      ['Return on assets', 'Earnings available for common stockholders ÷ Total assets'],
      ['Return on equity', 'Earnings available for common stockholders ÷ Common stock equity'],
      ['Price/earnings ratio', 'Market price per common share ÷ Earnings per share'],
      ['Book value per share', 'Common stock equity ÷ Number of common shares outstanding'],
      ['Market-to-book ratio', 'Market price per common share ÷ Book value per common share']
    ] },
    { group: 'Markets', items: [
      ['Effective transaction cost', '(Number of shares) × ½ × Bid-ask spread + Brokerage commission']
    ] },
    { group: 'Working capital', items: [
      ['Cash conversion cycle', 'CCC = AAI + ACP − APP'],
      ['Resources needed to support CCC', 'Avg inventory + Avg receivables − Avg payables = (AAI/365)×COGS + (ACP/365)×Credit sales − (APP/365)×Credit purchases']
    ] },
    { group: 'Short-term funding', items: [
      ['Approximate cost of giving up discount', 'CD ÷ (100% − CD) × 365 ÷ N'],
      ['Exact cost of giving up discount', '(1 + CD ÷ (100% − CD))^(365/N) − 1'],
      ['Effective annual rate', 'EAR = (1 + r_p)^n − 1'],
      ['Where', 'CD = cash discount in %; N = full credit period − discount period; r_p = rate per period; n = periods per year']
    ] },
    { group: 'Leverage & cost of capital', items: [
      ['Degree of total leverage', 'DTL = DOL × DFL'],
      ['Degree of operating leverage', 'DOL = %ΔEBIT ÷ %ΔSales = CM ÷ EBIT'],
      ['Degree of financial leverage', 'DFL = %ΔEPS ÷ %ΔEBIT = EBIT ÷ (EBT − PD ÷ (1 − T))'],
      ['WACC', '(w_d × r_d)(1 − T) + (w_p × r_p) + (w_s × r_s)'],
      ['Cost of debt', 'r_d = Interest expense on long-term liabilities ÷ Long-term liabilities']
    ] }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
