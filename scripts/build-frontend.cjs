'use strict';
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const {execFileSync}=require('node:child_process');
const esbuild=require('esbuild');
async function build(){
 const root=path.resolve(__dirname,'..');process.chdir(root);
 execFileSync(process.execPath,['scripts/register-images.cjs'],{stdio:'inherit'});
 const renderIsland=await require('./build-islands.cjs').buildIslands();
 fs.writeFileSync('release/podie/island-markup.json',JSON.stringify(Object.fromEntries(['circuit','how','projects','delivery','vertical','sticky'].map(name=>[name,renderIsland(name,'podie-'+name)]))));
 execFileSync(process.execPath,['scripts/sync-layout.cjs'],{stdio:'inherit'});
 const fontDir='assets/css/fonts';fs.mkdirSync(fontDir,{recursive:true});
 for(const [family,name] of [['inter','inter-latin-400-normal'],['inter','inter-latin-500-normal'],['inter','inter-latin-600-normal'],['instrument-serif','instrument-serif-latin-400-italic'],['jetbrains-mono','jetbrains-mono-latin-400-normal']])fs.copyFileSync(`node_modules/@fontsource/${family}/files/${name}.woff2`,`${fontDir}/${name}.woff2`);
 for(const family of ['inter','instrument-serif','jetbrains-mono'])fs.copyFileSync(`node_modules/@fontsource/${family}/LICENSE`,`${fontDir}/${family}-LICENSE.txt`);
 fs.copyFileSync('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',`${fontDir}/manrope-latin-wght-normal.woff2`);
 fs.copyFileSync('node_modules/@fontsource-variable/manrope/LICENSE',`${fontDir}/manrope-LICENSE.txt`);
 const outdir='assets/js/studio';fs.mkdirSync(outdir,{recursive:true});
 for(const file of fs.readdirSync(outdir))if(file.endsWith('.js')||file.endsWith('.txt'))fs.unlinkSync(path.join(outdir,file));
 const result=await esbuild.build({entryPoints:['frontend/studio.js'],bundle:true,splitting:true,format:'esm',target:'es2020',outdir,entryNames:'app',chunkNames:'[name]-[hash]',minify:true,legalComments:'external',metafile:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
 await esbuild.build({entryPoints:['frontend/site.css'],bundle:true,outfile:'assets/css/studio.css',minify:true,target:['chrome110','safari16','firefox110'],external:['/assets/*']});
 execFileSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','frontend/podie.css','-o','assets/css/podie.css','--minify'],{stdio:'inherit'});
 const assets=Object.keys(result.metafile.outputs).filter(file=>file.endsWith('.js')).map(file=>({file,bytes:fs.statSync(file).size,gzip:zlib.gzipSync(fs.readFileSync(file)).length}));
 fs.writeFileSync(path.join(outdir,'LICENSES.txt'),['cult--circuit-board','chamaac--how-it-works','tween-ui--process-card-reveal','uselayouts--vertical-tabs'].map(name=>fs.readFileSync('licenses/'+name+'.txt','utf8')).join('\n\n'));
 const entry=assets.find(file=>file.file.endsWith('/app.js'));
 if(entry.gzip>100*1024)throw new Error('Initial script exceeded its 100 KiB gzip budget');
 console.log(JSON.stringify({build:'passed',javascript:assets,cssBytes:fs.statSync('assets/css/studio.css').size,fonts:'self-hosted, latin subsets'}));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
