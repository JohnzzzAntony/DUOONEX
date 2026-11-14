'use strict';
// Real homepage captures only. No generated imagery or device mockups.
const fs=require('node:fs');
const {chromium}=require('playwright');
const sharp=require('sharp');
const sites=[
 ['karji','https://karjistore.com/'],
 ['atelier-perfumery','https://atelierperfumery.com/'],
 ['daima','https://daima.ae/'],
 ['touch-of-oud','https://touchofoud.com/'],
 ['saleel-parfums','https://saleelparfums.com/'],
 ['juvenis-paris','https://juvenisparis.com/'],
 ['flower-district','https://flowerdistrict.ae/'],
 ['elmoretto','https://elmoretto-production.up.railway.app/'],
 ['torque','https://torque-production-51b4.up.railway.app/'],
 ['ecommerce','https://ecommerce-production-f437.up.railway.app/']
];
(async()=>{
 fs.mkdirSync('assets/images/websites',{recursive:true});
 fs.mkdirSync('release/website-projects',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try{
  for(let i=0;i<sites.length;i+=3)await Promise.all(sites.slice(i,i+3).map(async([id,url])=>{
   const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,ignoreHTTPSErrors:true});
   const page=await context.newPage();
   try{
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForLoadState('networkidle',{timeout:12000}).catch(()=>{});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(2000);
    const title=await page.title(),text=(await page.locator('body').innerText()).slice(0,1300);
    if(!response?.ok()||/application failed|service unavailable|verify you are human|just a moment|access denied/i.test(title+' '+text.slice(0,300)))throw new Error('Not a usable homepage: '+response?.status()+' '+title);
    const screenshot=await page.screenshot({animations:'disabled'});
    await sharp(screenshot).resize(1200).webp({quality:85}).toFile(`assets/images/websites/${id}.webp`);
    const images=await page.locator('img').evaluateAll(nodes=>nodes.slice(0,12).map(img=>({src:img.currentSrc||img.src,alt:img.alt})));
    const result={id,url,finalUrl:page.url(),title,text,images,image:`/assets/images/websites/${id}.webp`,capturedAt:new Date().toISOString(),method:'Actual homepage screenshot, 1440 × 1000 viewport'};
    results.push(result);console.log(JSON.stringify({id,title,status:response.status(),text:text.slice(0,350)}));
   }catch(error){results.push({id,url,error:error.message});console.log(JSON.stringify({id,error:error.message}));}
   finally{await context.close();}
  }));
 }finally{await browser.close();}
 fs.writeFileSync('release/website-projects/sources.json',JSON.stringify(results,null,2)+'\n');
 fs.writeFileSync('data/website-project-sources.json',JSON.stringify(results.map(({id,url,finalUrl,title,image,capturedAt,method,error})=>({id,url,finalUrl,title,image,capturedAt,method,error})),null,2)+'\n');
 if(results.some(result=>result.error))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
