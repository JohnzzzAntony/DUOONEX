'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createServer}=require('../server');
let server,base,persisted=0;
const state={pages:{},media:[],inquiries:[]};
before(async()=>{
 server=createServer({secret:crypto.randomBytes(32).toString('hex'),production:false,resendKey:'',storage:{async open(){return {state,async persist(){persisted++;}};},async close(){}}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
});
after(async()=>new Promise(resolve=>server.close(resolve)));
test('redesigned homepage and split script/font assets are served by the existing CMS',async()=>{
 const response=await fetch(base+'/');assert.equal(response.status,200);
 const html=await response.text();assert.match(html,/studio-home/);assert.match(html,/s-enquiry-form/);assert.doesNotMatch(html,/Relay Labs/);
 for(const file of ['/assets/css/studio.css','/assets/css/podie.css','/assets/js/studio/app.js','/assets/js/studio/LICENSES.txt','/assets/css/fonts/manrope-latin-wght-normal.woff2'])assert.equal((await fetch(base+file)).status,200,file);
 assert.match(await (await fetch(base+'/assets/js/studio/LICENSES.txt')).text(),/Copyright \(c\) 2026 StaticMania/);
});

test('optimized AVIF artwork and social images are served through the public media allowlist',async()=>{
 const imageServer=createServer({secret:crypto.randomBytes(32).toString('hex'),production:false,dataDir:require('node:path').resolve('release/test-image-data')});
 await new Promise(resolve=>imageServer.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+imageServer.address().port;
 try{
  for(const [file,type] of [['custom-web-development-800.avif','image/avif'],['custom-web-development-social.jpg','image/jpeg']]){
   const response=await fetch(origin+'/assets/images/studio/'+file);assert.equal(response.status,200,file);assert.match(response.headers.get('content-type'),new RegExp(type));assert((await response.arrayBuffer()).byteLength>1000);
  }
  assert.equal((await fetch(origin+'/assets/images/studio/private-unlisted.png')).status,404);
 }finally{await new Promise(resolve=>imageServer.close(resolve));}
});
test('invalid enquiries are rejected and a valid brief is persisted once',async()=>{
 const send=data=>fetch(base+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await send({name:'Test',email:'invalid',message:'Brief'})).status,400);
 assert.equal(state.inquiries.length,0);
 assert.equal((await send({name:'Preview tester',email:'preview@example.com',message:'A test brief',source:'local verification'})).status,201);
 assert.equal(state.inquiries.length,1);assert.equal(persisted,1);assert.equal(state.inquiries[0].message,'A test brief');
});
test('private CMS endpoints remain authenticated',async()=>{
 assert.equal((await fetch(base+'/api/backup')).status,401);
 assert.deepEqual(await (await fetch(base+'/api/health')).json(),{ok:true});
});
test('cloud mode serves new bundled portfolio images with an older media registry',async()=>{
 const requested=[];
 const cloud=createServer({secret:crypto.randomBytes(32).toString('hex'),production:false,publicMedia:['nexpixels-mark-new.png'],storage:{
  async open(){return {state,async persist(){}};},
  async serveMedia(url,req,res){requested.push(url);if(url==='/media/stored.webp'){res.writeHead(200,{'Content-Type':'image/webp'});res.end('stored-image');return true;}return false;},
  async close(){}
 }});
 await new Promise(resolve=>cloud.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+cloud.address().port;
 try{
  for(const project of Object.values(require('../data/website-projects.json')).flat()){
   const response=await fetch(origin+project.image);assert.equal(response.status,200,project.image);
   assert.match(response.headers.get('content-type'),/image\/webp/);
   const actual=Buffer.from(await response.arrayBuffer()),expected=require('node:fs').readFileSync('.'+project.image);
   assert.deepEqual(actual,expected,'cloud fallback returns the actual bundled screenshot');
   const head=await fetch(origin+project.image,{method:'HEAD'});assert.equal(head.status,200);assert.equal(Number(head.headers.get('content-length')),expected.length);assert.equal((await head.arrayBuffer()).byteLength,0);
  }
  assert.equal(await (await fetch(origin+'/media/stored.webp')).text(),'stored-image','existing cloud uploads still use storage');
  assert.equal((await fetch(origin+'/media/unknown.webp')).status,404);
  assert.equal((await fetch(origin+'/assets/images/studio/private-unlisted.png')).status,404);
  assert(!requested.includes('/assets/images/studio/private-unlisted.png'),'unlisted files never reach storage');
 }finally{await new Promise(resolve=>cloud.close(resolve));}
});
