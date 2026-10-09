'use strict';
const {Pool}=require('pg');
const {S3Client,PutObjectCommand,GetObjectCommand,HeadObjectCommand}=require('@aws-sdk/client-s3');
const crypto=require('node:crypto'),{pipeline}=require('node:stream/promises');
const contentTypes={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt'};
function clients({direct=false}={}) {
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  if(!process.env.AWS_ENDPOINT_URL_S3||!process.env.AWS_REGION||!process.env.AWS_ACCESS_KEY_ID||!process.env.AWS_SECRET_ACCESS_KEY)throw new Error('Object storage configuration is incomplete');
  const endpoint=new URL(process.env.AWS_ENDPOINT_URL_S3);if(endpoint.protocol!=='https:')throw new Error('Object storage requires HTTPS');
  const connection=new URL(direct?(process.env.DIRECT_URL||process.env.DATABASE_URL):process.env.DATABASE_URL);connection.searchParams.set('sslmode','verify-full');
  return {pool:new Pool({connectionString:connection.toString(),enableChannelBinding:true,max:5,connectionTimeoutMillis:20000,idleTimeoutMillis:30000}),s3:new S3Client({endpoint:endpoint.origin,region:process.env.AWS_REGION,forcePathStyle:true,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED',maxAttempts:3})};
}
// One-time: databases created before the rebrand hold the schema under its old name.
async function renameLegacySchema(pool){
  try {await pool.query("DO $$ BEGIN IF EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='duoonex_site') AND NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='nexpixels_site') THEN ALTER SCHEMA duoonex_site RENAME TO nexpixels_site; END IF; END $$");}
  catch(error) {console.error('Schema rename skipped:',error.message);}
}
const schema=`
CREATE SCHEMA IF NOT EXISTS nexpixels_site;
CREATE TABLE IF NOT EXISTS nexpixels_site.pages (file text PRIMARY KEY, html text NOT NULL, title text NOT NULL, fingerprint text NOT NULL, fields jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS nexpixels_site.settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS nexpixels_site.cms (id integer PRIMARY KEY CHECK(id=1), state jsonb NOT NULL, revision bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS nexpixels_site.media (url text PRIMARY KEY, bucket text NOT NULL, object_key text NOT NULL, content_type text NOT NULL, bytes bigint NOT NULL, sha256 text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
`;
async function putMedia(s3,bucket,url,bytes,type){
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');
  const key='nexpixels/media/'+hash+'/'+url.split('/').pop();
  await s3.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:bytes,ContentType:type,Metadata:{sha256:hash},CacheControl:'public, max-age=31536000, immutable'}));
  const head=await s3.send(new HeadObjectCommand({Bucket:bucket,Key:key}));
  if(Number(head.ContentLength)!==bytes.length||head.Metadata?.sha256!==hash)throw new Error('Object verification failed');
  return {url,bucket,key,type,bytes:bytes.length,hash};
}
async function saveMedia(client,item){return client.query(`INSERT INTO nexpixels_site.media(url,bucket,object_key,content_type,bytes,sha256) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(url) DO UPDATE SET bucket=excluded.bucket,object_key=excluded.object_key,content_type=excluded.content_type,bytes=excluded.bytes,sha256=excluded.sha256,updated_at=now()`,[item.url,item.bucket,item.key,item.type,item.bytes,item.hash]);}
async function createCloudStorage(){
  const {pool,s3}=clients();
  await renameLegacySchema(pool);
  try {
    const [pages,settings]=await Promise.all([pool.query('SELECT file,html FROM nexpixels_site.pages ORDER BY file'),pool.query('SELECT key,value FROM nexpixels_site.settings')]);
    const config=Object.fromEntries(settings.rows.map(r=>[r.key,r.value]));
    if(!pages.rowCount||!config.projects||!config.publicMedia||!config.bucket)throw new Error('Run the content migration before starting cloud mode');
    const storage={config,pages:pages.rows,
      async open(write=false){
        const client=await pool.connect();let active=false,released=false;
        const close=async()=>{if(released)return;try{if(active)await client.query('ROLLBACK');}finally{released=true;client.release();}};
        try {if(write){await client.query('BEGIN');active=true;await client.query("SET LOCAL lock_timeout='15s'");}const row=(await client.query('SELECT state FROM nexpixels_site.cms WHERE id=1'+(write?' FOR UPDATE':''))).rows[0];if(!row)throw new Error('CMS content missing');
          if(!write){client.release();released=true;}
          return {state:row.state,close,
            async persist(){if(!write||!active)throw new Error('No active write transaction');await client.query('UPDATE nexpixels_site.cms SET state=$1,revision=revision+1,updated_at=now() WHERE id=1',[JSON.stringify(this.state)]);await client.query('COMMIT');active=false;},
            async upload(name,bytes,type){const item=await putMedia(s3,config.bucket,'/media/'+name,bytes,type);await saveMedia(client,item);}
          };
        }catch(e){await close();throw e;}
      },
      async serveMedia(url,req,res){
        const item=(await pool.query('SELECT * FROM nexpixels_site.media WHERE url=$1',[url])).rows[0];if(!item)return false;
        const input={Bucket:item.bucket,Key:item.object_key};if(req.headers.range)input.Range=req.headers.range;
        let object;try{object=await s3.send(req.method==='HEAD'?new HeadObjectCommand(input):new GetObjectCommand(input));}catch(e){if(e.$metadata?.httpStatusCode===416){res.writeHead(416,{'Content-Range':'bytes */'+item.bytes});res.end();return true;}throw e;}
        const headers={'Content-Type':item.content_type,'Content-Length':object.ContentLength,'Accept-Ranges':'bytes','Cache-Control':'public, max-age=3600'};if(object.ContentRange)headers['Content-Range']=object.ContentRange;if(object.ETag)headers.ETag=object.ETag;
        res.writeHead(object.ContentRange?206:200,headers);
        if(req.method==='HEAD')res.end();else await pipeline(object.Body,res);
        return true;
      },
      async health(){await pool.query('SELECT 1');},
      async close(){s3.destroy();await pool.end();}
    };return storage;
  }catch(e){s3.destroy();await pool.end();throw e;}
}
module.exports={renameLegacySchema,clients,schema,putMedia,saveMedia,createCloudStorage,contentTypes};
