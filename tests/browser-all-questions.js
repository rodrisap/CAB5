const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const pg = await b.newPage(); pg.on('pageerror', e => errs.push(e.message));
 await pg.goto('http://localhost:8765/practice/index.html'); const ids = await pg.evaluate(()=>FSM_MOCK.TYPES.map(t=>t.id));
 let missing=0;
 for (const id of ids) for (let k=0;k<3;k++) {
  await pg.goto('about:blank'); await pg.goto('http://localhost:8765/practice/index.html#q='+id); await pg.waitForTimeout(120);
  await pg.click('#checkBtn'); const n = await pg.locator('.xpart').count(), m = await pg.locator('details.model').count();
  if (n!==m) { missing++; console.log(id, n, m); }
 }
 console.log('types', ids.length, 'missing models', missing, errs.slice(0,3)); await b.close(); })();
