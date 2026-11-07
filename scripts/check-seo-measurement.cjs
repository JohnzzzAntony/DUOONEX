const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const route of ['/','/contact/']){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.route('**/www.googletagmanager.com/**',r=>r.abort());
 await page.goto('http://127.0.0.1:4180'+route,{waitUntil:'networkidle'});
 await page.evaluate(()=>{window.measured=[];window.gtag=(...args)=>window.measured.push(args);});
 const form=page.locator(route==='/'?'.s-enquiry-form':'[data-contact-form]');
 for(const result of [{status:503,body:{error:'Test rejection'}},{status:201,body:{ok:true}},{status:201,body:{ok:true,accepted:true}}]){
  await page.route('**/api/inquiries',r=>r.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)}));
  await form.locator('[name=name]').fill('Preview test');await form.locator('[name=email]').fill('preview@example.com');await form.locator('[name=message]').fill('Local mocked enquiry.');
  await form.locator('[type=submit]').click();await page.waitForTimeout(150);
 }
 assert.equal(await page.evaluate(()=>window.measured.filter(e=>e[1]==='generate_lead').length),1,route+': accepted success only');
 await page.locator('.s-footer a[href^="https://wa.me/"]').evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
 await page.locator('.s-footer a[href^="https://wa.me/"]').click();
 assert.equal(await page.evaluate(()=>window.measured.filter(e=>e[1]==='whatsapp_click').length),1,'one WhatsApp event');
 assert(!JSON.stringify(await page.evaluate(()=>window.measured)).includes('preview@example.com'),'no submitted email in event parameters');
 await page.close();
}console.log('Measurement passed: both forms count accepted success only; WhatsApp once; no submitted PII.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
