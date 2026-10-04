'use strict';
function invalid(message){const error=new Error(message);error.name='StartupConfigurationError';throw error;}
function validateStartupEnvironment(env){
  const required=['CMS_ADMIN_TOKEN'];
  if(env.DATABASE_URL||env.RAILWAY_ENVIRONMENT_ID||env.RAILWAY_PROJECT_ID)required.push('DATABASE_URL','AWS_ENDPOINT_URL_S3','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_REGION');
  const missing=required.filter(key=>!env[key]?.trim());
  if(missing.length)invalid('Missing Railway variables: '+missing.join(', ')+'. Add them to this service, then deploy the variable changes.');
  if(env.CMS_ADMIN_TOKEN.length<32)invalid('CMS_ADMIN_TOKEN must contain at least 32 characters. Use the private admin secret from .env.railway.');
  for(const [key,protocols]of [['DATABASE_URL',['postgres:','postgresql:']],['AWS_ENDPOINT_URL_S3',['https:']],['SITE_URL',['http:','https:']]]){
    if(!env[key])continue;let value;try{value=new URL(env[key]);}catch{invalid(key+' is not a valid URL. Paste its complete value without surrounding quotes.');}
    if(!protocols.includes(value.protocol))invalid(key+' uses an unsupported URL protocol.');
    if(key==='SITE_URL'&&(value.username||value.password||value.pathname!=='/'||value.search||value.hash))invalid('SITE_URL must be the public site origin, such as https://duoonex.com, without a path or credentials.');
  }
  if(env.PORT&&(!/^\d+$/.test(env.PORT)||Number(env.PORT)<1||Number(env.PORT)>65535))invalid('PORT must be a number between 1 and 65535. Normally Railway supplies it automatically.');
}
function startupDiagnostic(error){
  if(error?.name==='StartupConfigurationError')return '[startup] CONFIGURATION_ERROR: '+error.message;
  const raw=error?.code||error?.cause?.code||error?.name||'UNKNOWN';const code=/^[A-Za-z0-9_]+$/.test(raw)?raw:'UNKNOWN';
  const hints={
    '28P01':'PostgreSQL rejected the credentials. Check DATABASE_URL on this Railway service.',
    '28000':'PostgreSQL authentication was rejected. Check the database role and connection settings.',
    '3D000':'The configured PostgreSQL database does not exist. Check DATABASE_URL.',
    '42P01':'The site tables are missing from this database. Point DATABASE_URL at the already migrated Neon database; do not reset it.',
    '42501':'The database role cannot read the site schema. Check the database role permissions.',
    ENOTFOUND:'A configured service hostname could not be resolved. Check DATABASE_URL and AWS_ENDPOINT_URL_S3.',
    EAI_AGAIN:'DNS resolution temporarily failed. Retry and check the service network.',
    ECONNREFUSED:'The database connection was refused. Check the database endpoint and availability.',
    ETIMEDOUT:'The database connection timed out. Check the endpoint and network availability.',
    ECONNRESET:'The database connection was reset. Check the provider status and connection endpoint.',
    EACCES:'The process cannot access a required file or directory. If using local-file mode, check /data ownership.',
    EADDRINUSE:'The configured listening port is already in use.',
    UNABLE_TO_VERIFY_LEAF_SIGNATURE:'Database TLS certificate verification failed. Check the endpoint and trusted certificate chain.',
    SELF_SIGNED_CERT_IN_CHAIN:'Database TLS certificate verification failed. Check the trusted certificate chain; keep verification enabled.',
    CERT_HAS_EXPIRED:'A service TLS certificate has expired. Check the configured endpoint.',
    ERR_INVALID_URL:'A configured URL is malformed. Check DATABASE_URL, AWS_ENDPOINT_URL_S3 and SITE_URL.'
  };
  const message=String(error?.message||'');
  const hint=hints[code]||(/Run the content migration/.test(message)?'The selected database lacks the migrated site pages/settings. Check DATABASE_URL against the private Railway variables file.':/timeout/i.test(message)?'A startup connection timed out. Check Neon availability and Railway network access.':'Unexpected startup failure. Share this error code and the deployed commit ID for diagnosis.');
  return '[startup] '+code+': '+hint;
}
module.exports={validateStartupEnvironment,startupDiagnostic};
