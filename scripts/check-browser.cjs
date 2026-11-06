const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const output=path.resolve(__dirname,'../release');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],reports=[];
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport});
   await context.addInitScript(()=>{sessionStorage.setItem('studio-intro-seen','true');});
   const page=await context.newPage();
   page.on('pageerror',error=>errors.push(error.message));
   page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('googletagmanager')&&!msg.text().includes('net::ERR')&&!msg.text().includes('503 (Service Unavailable)'))errors.push(msg.text());});
   await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});await page.mouse.move(2,2);await page.waitForFunction(()=>document.documentElement.dataset.referenceMotion==='ready');await delay(700);
   const tag=viewport.width>800?'desktop':'mobile';
   assert(await page.locator('.n-hero-artwork img').evaluate(el=>el.complete&&el.naturalWidth>0),'generated hero artwork loads');
   await page.screenshot({path:path.join(output,`after-${tag}.png`)});
   const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(overflow.document<=overflow.viewport,`${tag}: no horizontal overflow`);
   const slider=page.locator('#project-budget');await slider.scrollIntoViewIfNeeded();await slider.focus();await slider.press('ArrowRight');
   assert.equal(await page.locator('[data-budget-output]').textContent(),'AED 30k+');
   assert.match(await page.locator('[data-budget-link]').getAttribute('href'),/budget=/);
   if(tag==='mobile'){
    const button=page.locator('.s-menu-toggle');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');
    assert(await button.evaluate(el=>document.activeElement===el));
   }
   await page.locator('.s-enquiry-form input[name=name]').fill('Local preview tester');
   await page.locator('.s-enquiry-form input[name=email]').fill('preview@example.com');
   await page.locator('.s-enquiry-form textarea').fill('A local browser verification brief.');
   await page.route('**/api/inquiries',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Please try again in a moment.'})}));
   await page.getByRole('button',{name:'Send your brief'}).click();
   await page.locator('.s-form-status.is-error').waitFor();assert.match(await page.locator('.s-form-status').textContent(),/try again/);
   await page.unroute('**/api/inquiries');
   await page.getByRole('button',{name:'Send your brief'}).click();
   await page.waitForFunction(()=>document.querySelector('.s-form-status').textContent.includes('Your brief is with us'));
   // Reveal each section, including content below the scroll-pinned plate.
   await page.evaluate(()=>window.scrollTo(0,0));
   for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650){await page.evaluate(y=>window.scrollTo(0,y),y);await delay(90);}
   await delay(1500);await page.locator('.s-motion-toggle').click();await page.evaluate(()=>window.scrollTo(0,0));await delay(200);await page.screenshot({path:path.join(output,`after-${tag}-full.png`),fullPage:true});
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   fs.writeFileSync(path.join(output,`axe-${tag}.json`),JSON.stringify(axe.violations,null,2));
   reports.push({viewport:tag,overflow,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),referenceMotion:true});
   await context.close();
  }
  const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await reduced.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.pin-spacer').count(),0,'reduced motion disables pinning');
  assert.equal(await page.locator('.s-preloader').isVisible(),false,'reduced motion skips intro');
  assert(await page.locator('.s-reveal').first().evaluate(el=>Number(getComputedStyle(el).opacity)===1));
  await page.screenshot({path:path.join(output,'reduced-motion.png')});
  const representative=['/about/','/services/ui-ux-design/','/case-studies/finora/','/contact/'];
  for(const route of representative){await page.goto('http://127.0.0.1:4180'+route,{waitUntil:'networkidle'});assert((await page.title()).length>0);await page.screenshot({path:path.join(output,route.split('/').filter(Boolean).join('-')+'.png')});const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();reports.push({route,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});}
  await reduced.close();
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({reports,errors},null,2));
  console.log(JSON.stringify({reports,errors}));
  assert.equal(errors.length,0,'browser errors');
  assert.equal(reports.reduce((sum,report)=>sum+report.violations.length,0),0,'accessibility violations');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
