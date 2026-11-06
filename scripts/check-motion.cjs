'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.mouse.move(5,5);
  await page.waitForFunction(()=>document.documentElement.dataset.referenceMotion==='ready');
  const initial=await page.locator('.s-workflow-wrap').boundingBox();
  await page.mouse.wheel(0,750);await page.waitForTimeout(1800);
  const expanded=await page.locator('.s-workflow-wrap').boundingBox();assert(expanded.width>initial.width*1.4,'hero media expands');
  await page.screenshot({path:'release/brand-seo/expanded-hero.png'});
  const reached=[];
  for(const [name,path] of [['What we do','/services/'],['Our work','/case-studies/'],['Our approach','/approach/']]){
   await page.locator('.s-desktop-nav').getByRole('link',{name,exact:true}).click();
   await page.waitForURL('http://127.0.0.1:4180'+path);
   await page.waitForSelector(`.s-desktop-nav a[href="${path}"][aria-current=page]`);
   assert.equal(await page.locator(`.s-desktop-nav a[href="${path}"]`).getAttribute('aria-current'),'page');reached.push(path);
  }
  await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});await page.mouse.move(6,6);await page.waitForFunction(()=>document.documentElement.dataset.referenceMotion==='ready');
  // Let the previous link scroll settle before the test moves to a distant scene.
  await page.waitForTimeout(1800);
  await page.locator('.r-scope-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.mouse.wheel(0,650);await page.waitForTimeout(1800);
  const railX=await page.locator('.s-scope-grid').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41);
  if(railX>=-5){await page.screenshot({path:'release/brand-seo/rail-debug.png'});console.log(await page.locator('.r-scope-stage').evaluate(el=>({scrollY,top:el.getBoundingClientRect().top,height:el.offsetHeight,rail:getComputedStyle(el.firstElementChild).transform})));}
  assert(railX< -5,'horizontal service rail moves');
  await page.screenshot({path:'release/brand-seo/horizontal-services.png'});
  assert.equal(await page.locator('#podie-how [data-how-card]').count(),4,'original How It Works renders delivery stages');
  await page.locator('.s-motion-toggle').click();assert.equal(await page.locator('.pin-spacer').count(),0);
  for(const width of [1024,768,360]){
   await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,'responsive overflow at '+width);
  }
  await page.setViewportSize({width:1440,height:900});
  await page.goto('http://127.0.0.1:4180/services/shopify-development/',{waitUntil:'networkidle'});
  await page.locator('.s-desktop-nav').getByRole('link',{name:'Our work',exact:true}).click();await page.waitForURL('http://127.0.0.1:4180/case-studies/');
  const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),mobile=await reduced.newPage();
  await mobile.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});await mobile.locator('.s-menu-toggle').click();await mobile.locator('.s-mobile-nav').getByRole('link',{name:'Our work',exact:true}).click();
  await mobile.waitForURL('http://127.0.0.1:4180/case-studies/');assert.equal(await mobile.locator('.s-menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await mobile.locator('.pin-spacer').count(),0);
  await reduced.close();assert.deepEqual(errors,[]);
  const report={hero:{initial:initial.width,expanded:expanded.width},nativePageNavigation:reached,horizontalRailX:railX,podieDeliveryStages:4,pauseRestoresFlow:true,responsiveWidths:[1440,1024,768,390,360],reducedMotion:true,errors};
  fs.writeFileSync('release/brand-seo/motion-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
