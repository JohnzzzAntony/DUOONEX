'use strict';
const assert=require('assert/strict'),fs=require('fs'),crypto=require('crypto');
const {createConfiguredServer}=require('../server');
const {clients}=require('../lib/cloud');
const {DeleteObjectCommand}=require('@aws-sdk/client-s3');
async function main(){
  const {pool,s3}=clients();let server,uploaded,originalPage,inquiryId;const secret=crypto.randomBytes(32).toString('hex');
  const report={pages:0,media:0,checks:[]};
  try {
    originalPage=(await pool.query('SELECT state FROM duoonex_site.cms WHERE id=1')).rows[0].state.pages['index.html'];
    server=await createConfiguredServer({secret,production:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
    let cookie='';const request=(url,method='GET',data)=>fetch(base+url,{method,headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},body:data===undefined?undefined:JSON.stringify(data)});
    const files=require('../lib/pages').files;for(let i=0;i<files.length;i+=4){await Promise.all(files.slice(i,i+4).map(async f=>{const r=await request('/'+f.replace(/index\.html$/,''));assert.equal(r.status,200,f);assert.match(await r.text(),/<h1\b/);report.pages++;}));}
    for(const m of require('../data/public-media.json')){const r=await fetch(base+'/assets/images/'+m,{method:'HEAD'});assert.equal(r.status,200,m);assert.ok(Number(r.headers.get('content-length'))>0);report.media++;}
    const video=await fetch(base+'/assets/images/projects/invitara.mp4',{headers:{Range:'bytes=0-63'}});assert.equal(video.status,206);assert.equal((await video.arrayBuffer()).byteLength,64);report.checks.push('Object-storage video byte ranges');
    assert.equal((await request('/api/pages')).status,401);
    const login=await request('/api/login','POST',{password:secret});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
    const doc=await (await request('/api/page?file=index.html')).json();const values=originalPage.draft;
    const saves=await Promise.all([request('/api/page?file=index.html','PUT',{version:doc.version,values}),request('/api/page?file=index.html','PUT',{version:doc.version,values})]);assert.deepEqual(saves.map(r=>r.status).sort(),[200,409]);
    const current=await (await request('/api/page?file=index.html')).json();assert.equal((await request('/api/publish','POST',{file:'index.html',version:current.version})).status,200);report.checks.push('PostgreSQL draft/publish and concurrent-edit conflict');
    const image=fs.readFileSync('assets/images/nexpixel-icon-512.png');const upload=await request('/api/media','POST',{name:'NexPixels logo storage verification',base64:image.toString('base64')});assert.equal(upload.status,201);uploaded=await upload.json();
    assert.equal(crypto.createHash('sha256').update(Buffer.from(await (await request(uploaded.url)).arrayBuffer())).digest('hex'),crypto.createHash('sha256').update(image).digest('hex'));report.checks.push('CMS upload stored and served through object storage');
    const email='cloud-verification-'+crypto.randomUUID()+'@example.invalid';assert.equal((await request('/api/inquiries','POST',{name:'Temporary storage verification',email,message:'Removed automatically after migration verification.'})).status,201);
    const inbox=await (await request('/api/inquiries')).json();inquiryId=inbox.find(x=>x.email===email)?.id;assert.ok(inquiryId);assert.equal((await request('/api/inquiries','DELETE',{id:inquiryId})).status,200);report.checks.push('Enquiry written to PostgreSQL and removed after verification');
    await new Promise(r=>{server.closeAllConnections();server.close(r);});server=null;
    server=await createConfiguredServer({secret,production:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const restarted='http://127.0.0.1:'+server.address().port;assert.equal((await fetch(restarted+uploaded.url)).status,200);assert.equal((await fetch(restarted+'/')).status,200);report.checks.push('Database content and uploaded media survive application restart');
  }finally {
    if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}
    const client=await pool.connect();try{await client.query('BEGIN');const row=(await client.query('SELECT state FROM duoonex_site.cms WHERE id=1 FOR UPDATE')).rows[0];if(row){const state=row.state;if(originalPage&&state.pages['index.html'].version===originalPage.version+2)state.pages['index.html']=originalPage;if(uploaded)state.media=state.media.filter(m=>m.url!==uploaded.url);if(inquiryId)state.inquiries=state.inquiries.filter(i=>i.id!==inquiryId);await client.query('UPDATE duoonex_site.cms SET state=$1 WHERE id=1',[JSON.stringify(state)]);}if(uploaded){const media=(await client.query('DELETE FROM duoonex_site.media WHERE url=$1 RETURNING bucket,object_key',[uploaded.url])).rows[0];if(media)await s3.send(new DeleteObjectCommand({Bucket:media.bucket,Key:media.object_key}));}await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();s3.destroy();}
  }
  report.completedAt=new Date().toISOString();report.temporaryDataRemoved=true;fs.writeFileSync('docs/cloud-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error('Cloud verification failed: '+(e.code||e.name)+' '+(e instanceof assert.AssertionError?e.message:'See the failing check; credentials are not logged.'));process.exitCode=1;});
