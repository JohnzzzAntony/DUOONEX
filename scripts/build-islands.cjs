'use strict';
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
async function buildIslands(){
 fs.mkdirSync(path.resolve('release/podie'),{recursive:true});
 await esbuild.build({entryPoints:['frontend/islands/server.tsx'],bundle:true,platform:'node',format:'cjs',target:'node22',outfile:'release/podie/render.cjs',external:['react','react-dom/server'],jsx:'automatic',logLevel:'warning'});
 const {renderIsland}=require(path.resolve('release/podie/render.cjs'));
 return renderIsland;
}
module.exports={buildIslands};
