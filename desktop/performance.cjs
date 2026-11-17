'use strict';
const fs=require('node:fs/promises');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const exec=promisify(execFile);
const previous=new Map();
const reserved=new Set(['systemd','kwin_wayland','kwin_x11','plasmashell','pipewire','wireplumber','dbus-daemon','dbus-broker','kded6']);
async function processInfo(pid){
  try{
    const base='/proc/'+pid;const [stat,status]=await Promise.all([fs.readFile(base+'/stat','utf8'),fs.readFile(base+'/status','utf8')]);
    const tail=stat.slice(stat.lastIndexOf(')')+2).split(' ');const uids=status.match(/^Uid:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/m);
    if(!uids||new Set(uids.slice(1)).size!==1||Number(uids[1])!==process.getuid())return null;
    const name=stat.slice(stat.indexOf('(')+1,stat.lastIndexOf(')'));if(reserved.has(name))return null;
    const ticks=Number(tail[11])+Number(tail[12]);const at=Date.now();const key=pid+':'+tail[19];const old=previous.get(key);previous.set(key,{ticks,at});
    return {pid:Number(pid),start:tail[19],name,nice:Number(tail[16]),threads:Number(status.match(/^Threads:\s+(\d+)/m)?.[1]||1),memoryMiB:Math.round(Number(status.match(/^VmRSS:\s+(\d+)/m)?.[1]||0)/1024),cpu:old?Math.max(0,Math.round((ticks-old.ticks)*1000/(at-old.at))):null};
  }catch{return null;}
}
async function processes(){
  if(process.platform!=='linux')return [];
  const ids=(await fs.readdir('/proc')).filter(id=>/^\d+$/.test(id));
  const list=(await Promise.all(ids.map(processInfo))).filter(Boolean);
  if(previous.size>10000){const fresh=new Set(list.map(p=>p.pid+':'+p.start));for(const key of previous.keys())if(!fresh.has(key))previous.delete(key);}
  return list.sort((a,b)=>(b.cpu||0)-(a.cpu||0)||b.memoryMiB-a.memoryMiB).slice(0,300);
}
async function status(){
  const {stdout}=await exec('/usr/lib/kyvex/kyvex-performance',['status'],{timeout:6500,maxBuffer:256*1024});
  return JSON.parse(stdout);
}
async function target(payload){
  if(!['render','desktop'].includes(payload.mode))throw new Error('Невідомий профіль продуктивності');
  const pid=payload.mode==='desktop'?process.pid:payload.pid;
  if(!Number.isSafeInteger(pid)||pid<2)throw new Error('Оберіть програму зі списку');
  const info=await processInfo(String(pid));
  if(!info||(payload.mode==='render'&&info.start!==payload.start))throw new Error('Програма завершилася. Оновіть список.');
  return payload.mode+':'+info.pid+':'+info.start;
}
module.exports={status,processes,target,processInfo};
