'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const url='http://127.0.0.1:4180';
(async()=>{
 fs.mkdirSync('release/podie/screenshots',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),errors=[],reports=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&!/googletagmanager|net::ERR|503 \(Service Unavailable\)/.test(message.text()))errors.push(message.text());});
  await page.goto(url,{waitUntil:'networkidle'});await page.mouse.move(5,5);await page.waitForFunction(()=>document.documentElement.dataset.referenceMotion==='ready');
  async function reveal(name){
   await page.locator('#podie-'+name).scrollIntoViewIfNeeded();await page.waitForFunction(name=>document.querySelector('#podie-'+name+' [data-pd-ready]'),name);
   await page.evaluate(name=>window.scrollTo(0,document.querySelector('#podie-'+name).getBoundingClientRect().top+scrollY-140),name);await page.waitForTimeout(600);
  }
  await reveal('circuit');
  assert.equal(await page.locator('#podie-circuit svg[role=img] animateTransform').count()>0,true,'original SVG gradient animation is installed');
  const time=await page.locator('#podie-circuit svg[role=img]').evaluate(svg=>svg.getCurrentTime());await page.waitForTimeout(500);
  assert(await page.locator('#podie-circuit svg[role=img]').evaluate((svg,time)=>svg.getCurrentTime()>time,time),'SVG animation clock advances');
  await page.screenshot({path:'release/podie/screenshots/circuit-desktop.png'});
  await reveal('how');assert.equal(await page.locator('#podie-how [data-how-card]').count(),4);
  const dash=page.locator('#podie-how path[stroke-dasharray]').first(),start=await dash.evaluate(el=>getComputedStyle(el).strokeDashoffset);await page.waitForTimeout(500);assert.notEqual(await dash.evaluate(el=>getComputedStyle(el).strokeDashoffset),start,'original dashed connector animates');
  await page.screenshot({path:'release/podie/screenshots/how-desktop.png'});
  await reveal('projects');const deck=page.locator('#podie-projects [data-process-card-reveal]');
  const initial=await deck.getAttribute('data-active-step');await page.waitForFunction(initial=>document.querySelector('#podie-projects [data-process-card-reveal]').dataset.activeStep!==initial,initial,{timeout:12000});
  await page.waitForTimeout(1600);await page.screenshot({path:'release/podie/screenshots/projects-desktop.png'});
  const link=page.locator('#podie-projects [data-process-card][aria-hidden=false] .pd-project-link');assert(await link.isVisible());assert.match(await link.getAttribute('href'),/^\/case-studies\//);
  await page.locator('.s-motion-toggle').click();await reveal('projects');const paused=await deck.getAttribute('data-active-step');await page.waitForTimeout(2600);assert.equal(await deck.getAttribute('data-active-step'),paused,'global pause stops autoplay');
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();reports.push({viewport:1440,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  for(const [name,path] of [['Our work','/case-studies/'],['What we do','/services/'],['Our approach','/approach/'],['The studio','/about/']]){
   await page.locator('.s-desktop-nav').getByRole('link',{name,exact:true}).click();await page.waitForURL(url+path);assert.equal(await page.locator('.s-desktop-nav a[aria-current=page]').getAttribute('href'),path);
  }
  await context.close();
  const animatedMobile=await browser.newContext({viewport:{width:390,height:900}}),moving=await animatedMobile.newPage();moving.on('pageerror',error=>errors.push(error.message));
  await moving.goto(url,{waitUntil:'networkidle'});await moving.locator('#podie-projects').scrollIntoViewIfNeeded();await moving.waitForFunction(()=>document.querySelector('#podie-projects [data-pd-ready]'));
  const mobileDeck=moving.locator('#podie-projects [data-process-card-reveal]'),firstMobile=await mobileDeck.getAttribute('data-active-step');
  await moving.waitForFunction(index=>document.querySelector('#podie-projects [data-process-card-reveal]').dataset.activeStep!==index,firstMobile,{timeout:12000});
  await moving.waitForTimeout(1600);await moving.locator('#podie-projects').getByRole('button',{name:'Pause playback',exact:true}).click();
  const held=await mobileDeck.getAttribute('data-active-step');await moving.waitForTimeout(2600);assert.equal(await mobileDeck.getAttribute('data-active-step'),held,'mobile local pause stops autoplay');
  await moving.locator('#podie-projects').getByRole('button',{name:'Resume playback',exact:true}).click();await moving.waitForFunction(index=>document.querySelector('#podie-projects [data-process-card-reveal]').dataset.activeStep!==index,held,{timeout:12000});
  await animatedMobile.close();
  for(const width of [320,360,390,768,1024]){
   const mobile=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),tab=await mobile.newPage();tab.on('pageerror',e=>errors.push(e.message));
   await tab.goto(url,{waitUntil:'networkidle'});
   for(const name of ['circuit','how','projects']){await tab.locator('#podie-'+name).scrollIntoViewIfNeeded();await tab.waitForFunction(name=>document.querySelector('#podie-'+name+' [data-pd-ready]'),name);}
   assert.equal(await tab.evaluate(()=>document.documentElement.scrollWidth),width,'no horizontal overflow at '+width);
   const project=tab.locator('#podie-projects [data-process-card-reveal]');
   await tab.locator(`#podie-projects [data-process-timeline=${width<768?'horizontal':'vertical'}] button`).nth(1).click();
   await tab.waitForFunction(()=>document.querySelector('#podie-projects [data-process-card-reveal]').dataset.activeStep==='1');
   const selected=await project.getAttribute('data-active-step');await tab.waitForTimeout(2500);assert.equal(await project.getAttribute('data-active-step'),selected,'reduced motion has no autoplay');
   if(width===390){await tab.screenshot({path:'release/podie/screenshots/projects-mobile.png'});const result=await new AxeBuilder({page:tab}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();reports.push({viewport:width,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
   if(width<992){await tab.locator('.s-menu-toggle').click();await tab.locator('.s-mobile-nav').getByRole('link',{name:'What we do',exact:true}).click();await tab.waitForURL(url+'/services/');}
   if(width===320||width===768){
    await tab.goto(url+'/approach/',{waitUntil:'networkidle'});await tab.locator('#podie-delivery').scrollIntoViewIfNeeded();await tab.waitForFunction(()=>document.querySelector('#podie-delivery [data-pd-ready]'));
    await tab.locator(`#podie-delivery [data-process-timeline=${width<768?'horizontal':'vertical'}] button`).nth(3).click();
    await tab.waitForFunction(()=>document.querySelector('#podie-delivery [data-process-card-reveal]').dataset.activeStep==='3');
    assert.equal(await tab.evaluate(()=>document.documentElement.scrollWidth),width,'delivery timeline fits '+width);
    const fits=await tab.locator('#podie-delivery [data-process-card][aria-hidden=false] [data-process-copy]').evaluate(el=>el.getBoundingClientRect().bottom<=el.closest('[data-process-stage]').getBoundingClientRect().bottom+2);
    assert(fits,'delivery copy is not clipped at '+width);
   }
   await mobile.close();
  }
  const animations={originalSvg:true,dashedConnectors:true,desktopAndMobileAutoplay:true,localAndGlobalPause:true,reducedMotionManualSelection:true,nativePageLinks:true};
  fs.writeFileSync('release/podie/browser-results.json',JSON.stringify({animations,reports,errors},null,2));console.log(JSON.stringify({animations,reports,errors}));assert.deepEqual(errors,[]);assert.equal(reports.flatMap(report=>report.violations).length,0,'automated accessibility checks');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
