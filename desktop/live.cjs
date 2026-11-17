'use strict';
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const exec=promisify(execFile);
async function status(){
  try {return JSON.parse((await exec('/usr/lib/kyvex/kyvex-live',['status'],{timeout:4000,maxBuffer:16384})).stdout);}
  catch {return {live:false,installerAvailable:false,image:null,reason:'probe-unavailable'};}
}
module.exports={status};
