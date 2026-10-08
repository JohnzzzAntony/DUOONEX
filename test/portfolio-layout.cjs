const {chromium}=require('C:/Users/johns/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../server');
const crypto=require('crypto');
const assert=require('node:assert/strict');
(async()=>{
 const server=createServer({secret:crypto.randomBytes(32).toString('hex'),dataDir:'test-output/layout-data'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try {
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'});
  for(const width of [1440,768,390]) {
   await page.setViewportSize({width,height:950});
   for(const project of require('../data/projects.json')) {
    await page.goto('http://127.0.0.1:'+server.address().port+'/case-studies/'+project.slug+'/');
    await page.locator('.project-screens summary').click();
    assert.equal(await page.locator('.project-screens details').getAttribute('open'),'');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),project.slug+' overflow at '+width);
    await page.locator('[data-gallery-next]').click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-gallery-position]').innerText(),'2 / '+project.media.length);
   }
  }
  console.log('All '+require('../data/projects.json').length+' expanded screen galleries and carousel controls pass at desktop, tablet and mobile widths.');
 } finally {if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
