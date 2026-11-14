'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const websites=require('../data/website-projects.json');
const {createServer}=require('../server');
(async()=>{
 fs.mkdirSync('release/website-projects',{recursive:true});
 const server=createServer({secret:require('node:crypto').randomBytes(32).toString('hex'),dataDir:require('node:path').resolve('release/website-projects/preview-data'),production:false,siteUrl:'http://127.0.0.1',resendKey:''});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],report={};
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/hydration|PODIE component|PODIE enhancement/.test(message.text()))errors.push(message.text());});
  await page.goto(base+'/products/',{waitUntil:'networkidle'});
  await page.locator('#podie-vertical').scrollIntoViewIfNeeded();
  await page.waitForSelector('.np-product-scroll[data-enhanced=true]');
  const metrics=await page.locator('.np-product-scroll').evaluate(track=>({top:track.getBoundingClientRect().top+scrollY,distance:track.offsetHeight-track.querySelector('.np-product-stage').offsetHeight}));
  const visit=async(index)=>{
   await page.evaluate(({top,distance,index})=>window.scrollTo({top:top-120+distance*index/9,behavior:'instant'}),{...metrics,index});
   await page.waitForFunction(index=>document.querySelector('.np-product-scroll').dataset.activeProduct===String(index),index);
   await page.waitForTimeout(700);
   assert.equal(await page.locator('.np-product-panel:not([aria-hidden=true])').count(),1,'one exposed product');
   assert.equal(await page.locator('.np-product-panel[data-active] h3').count(),1);
   const fits=await page.locator('.np-product-panel[data-active]').evaluate(panel=>{const box=panel.getBoundingClientRect();return [...panel.querySelectorAll('h3,p,a,figure')].every(el=>{const r=el.getBoundingClientRect();return r.top>=box.top-1&&r.bottom<=box.bottom+1;});});
   assert(fits,'active copy and image fit the stage at step '+index);
   const color=await page.locator('.np-product-panel[data-active] h3').evaluate(el=>getComputedStyle(el).color);assert.equal(color,'rgb(255, 255, 255)');
  };
  for(let index=0;index<10;index++)await visit(index);
  await page.screenshot({path:'release/website-projects/products-desktop.png'});
  for(const index of [8,4,0])await visit(index);
  await page.getByRole('button',{name:'Next product',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.np-product-scroll').dataset.activeProduct==='1');
  await page.getByRole('button',{name:'Show El Moretto',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.np-product-scroll').dataset.activeProduct==='7');
  await page.waitForTimeout(1000);await page.screenshot({path:'release/website-projects/elmoretto-desktop.png'});
  await page.locator('#ecommerce-experience').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));await page.waitForTimeout(700);
  await page.screenshot({path:'release/website-projects/commerce-desktop.png'});
  const axe=await new AxeBuilder({page}).include('.np-product-scroll').include('#ecommerce-experience').include('.np-live-products').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.accessibility=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
  assert.deepEqual(report.accessibility,[],'portfolio accessibility');
  await page.locator('.s-motion-toggle').click();await page.waitForSelector('.np-product-scroll:not([data-enhanced])');
  assert.equal(await page.locator('.np-product-panel[aria-hidden=true]').count(),0,'pause exposes the entire product list');
  await context.close();
  report.sizes=[];
  for(const [width,height,reduced] of [[390,844,false],[768,900,false],[320,700,false],[1024,900,false],[1440,650,false],[390,844,true]]){
   const mobile=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'}),tab=await mobile.newPage();tab.on('pageerror',error=>errors.push(error.message));
   await tab.goto(base+'/products/',{waitUntil:'networkidle'});await tab.locator('#podie-vertical').scrollIntoViewIfNeeded();await tab.waitForSelector('#podie-vertical [data-pd-ready]');await tab.waitForTimeout(500);
   assert.equal(await tab.evaluate(()=>document.documentElement.scrollWidth),width,'no overflow at '+width);
   const enhanced=await tab.locator('.np-product-scroll').getAttribute('data-enhanced');
   assert.equal(enhanced==='true',(height>=800||(width>=768&&height>=700))&&!reduced,'motion mode at '+width+'x'+height);
   if(enhanced){
    for(const index of [5,8]){
     await tab.locator('.np-product-dots button').nth(index).click();await tab.waitForFunction(index=>document.querySelector('.np-product-scroll').dataset.activeProduct===String(index),index);await tab.waitForTimeout(900);
     const fits=await tab.locator('.np-product-panel[data-active]').evaluate(panel=>{const stage=panel.getBoundingClientRect();return [...panel.querySelectorAll('h3,p,a,figure')].every(el=>{const r=el.getBoundingClientRect();return r.left>=stage.left&&r.right<=stage.right&&r.bottom<=stage.bottom;});});assert(fits,'longest mobile contents fit '+width+' step '+index);
    }
   }else assert.equal(await tab.locator('.np-product-panel[aria-hidden=true]').count(),0);
   if(width===390&&!reduced){await tab.screenshot({path:'release/website-projects/products-mobile.png'});await tab.locator('#ecommerce-experience').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));await tab.waitForTimeout(700);await tab.screenshot({path:'release/website-projects/commerce-mobile.png'});}
   report.sizes.push({width,height,reduced,enhanced:!!enhanced});await mobile.close();
  }
  const plain=await browser.newContext({javaScriptEnabled:false}),tab=await plain.newPage();
  for(const path of ['/','/case-studies/','/products/']){
   await tab.goto(base+path,{waitUntil:'domcontentloaded'});assert.equal(await tab.locator('#ecommerce-experience .np-commerce-card').count(),7);
   for(const project of websites.ecommerce)assert.equal(await tab.locator('#ecommerce-experience a.np-commerce-link[href="'+project.href+'"]').count(),1);
   assert.match(await tab.locator('.np-commerce-note').innerText(),/not as NexPixels client commissions/);
   if(path==='/products/'){assert.equal(await tab.locator('.np-product-panel').count(),10);assert.equal(await tab.locator('.np-live-products .np-commerce-card').count(),3);}
   const broken=await tab.locator('.np-commerce-card img,.np-product-panel img').evaluateAll(images=>images.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src));assert.deepEqual(broken,[]);
  }
  await plain.close();assert.deepEqual(errors,[]);
  Object.assign(report,{scrollForward:10,scrollReverse:true,buttons:true,pause:true,noJavaScript:true,commerceSites:7,liveDemos:3,errors});
  fs.writeFileSync('release/website-projects/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
