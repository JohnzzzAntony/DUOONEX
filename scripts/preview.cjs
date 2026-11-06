'use strict';
const path=require('node:path');
const crypto=require('node:crypto');
const {createServer}=require('../server');
// Local review uses isolated storage and never connects to the production database.
createServer({secret:crypto.randomBytes(32).toString('hex'),dataDir:path.resolve(__dirname,'../release/preview-data'),production:false,siteUrl:'http://127.0.0.1:4180',resendKey:''}).listen(4180,'127.0.0.1',()=>console.log('NexPixels preview: http://127.0.0.1:4180'));
