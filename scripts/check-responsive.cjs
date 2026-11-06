const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:4180';
const routes=require('../lib/pages').files.map(file=>'/'+file.replace(/index\.html$/,''));
const representative=['/','/services/','/products/','/about/','/contact/','/case-studies/','/approach/','/pricing/','/services/ui-ux-design/','/case-studies/finora/'];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],failures=[],heights=[],checks=[];
 try{
  const context=await browser.newContext({viewport:{width:375,height:844},reducedMotion:'reduce'});
  // All templates at the smallest common phone size; extra widths on each major layout.
  for(const width of [375,320,768,1024,1440]){
   const paths=width===375?routes:representative;
   let cursor=0;
   await Promise.all(Array.from({length:3},async()=>{
    const page=await context.newPage();await page.setViewportSize({width,height:900});
    page.on('pageerror',e=>errors.push({url:page.url(),error:e.message}));
    while(cursor<paths.length){const route=paths[cursor++];
     const response=await page.goto(origin+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
     const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,height:document.body.scrollHeight,container:[...document.querySelectorAll('main>.s-container,main>section>.container')].map(el=>({x:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right}))}));
     if(response.status()!==200||layout.overflow||layout.container.some(r=>r.x< -1||r.right>width+1))failures.push({route,width,status:response.status(),...layout});
     if(width===375&&representative.includes(route))heights.push({route,height:layout.height});
    }await page.close();
   }));console.log(`Checked ${paths.length} pages at ${width}px`);
  }
  const page=await context.newPage();await page.setViewportSize({width:390,height:844});
  for(const route of ['/','/products/','/services/']){
   await page.goto(origin+route,{waitUntil:'networkidle'});
   for(const island of await page.locator('[data-pd-island]').all()){await island.scrollIntoViewIfNeeded();await island.locator('[data-pd-ready]').waitFor();}
   for(const rail of await page.locator('.n-carousel[data-carousel-ready]').all()){
    const controls=rail.locator('xpath=following-sibling::*[1]');
    if(!await controls.isVisible())continue;
    await rail.scrollIntoViewIfNeeded();await rail.focus();await rail.press('ArrowRight');
    await page.waitForTimeout(100);
    const moved=await rail.evaluate(el=>el.scrollLeft>0);assert(moved,route+': keyboard advances '+await rail.getAttribute('id'));
    await controls.getByRole('button',{name:'Previous card'}).click();await page.waitForTimeout(100);
    assert(await rail.evaluate(el=>el.scrollLeft<2),'previous button returns to first card');
    await controls.getByRole('button',{name:'Next card'}).click();await page.waitForTimeout(100);
    assert(await rail.evaluate(el=>el.scrollLeft>0),'next button advances');
    checks.push({route,carousel:await rail.getAttribute('id'),position:await controls.locator('[aria-live]').textContent()});
   }
   if(route==='/'){
    await page.screenshot({path:'release/ux-home-mobile.png',fullPage:true});
    await page.locator('#the-process').scrollIntoViewIfNeeded();await page.screenshot({path:'release/ux-process-mobile.png'});
   }
  }
  await context.close();
  fs.writeFileSync('release/ux-responsive-results.json',JSON.stringify({failures,errors,heights,carousels:checks},null,2));
  assert.deepEqual(failures,[],'responsive template failures');assert.deepEqual(errors,[],'browser runtime errors');
  console.log(JSON.stringify({responsive:true,widths:[320,375,768,1024,1440],templates:routes.length,carousels:checks.length,heights}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
