'use strict';
const {app,BrowserWindow,ipcMain,nativeTheme,session,screen} = require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const system=require('./system.cjs');
const manager=require('./manager.cjs');
const performance=require('./performance.cjs');
const run=promisify(execFile);
let window;
const requestedPage=argv=>argv.includes('--page=software')?'software':'overview';
if(process.env.KYVEX_SOFTWARE_RENDERING==='1')app.disableHardwareAcceleration();
if(!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance',(_event,argv)=>{
    window?.show();
    window?.focus();
    if(requestedPage(argv)==='software')window?.webContents.send('kyvex:open-packages');
  });
  app.whenReady().then(()=>{
    nativeTheme.themeSource='dark';
    session.defaultSession.setPermissionRequestHandler((_w,_p,cb)=>cb(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    const area=screen.getPrimaryDisplay().workAreaSize;
    window=new BrowserWindow({width:Math.min(1320,area.width-32),height:Math.min(860,area.height-32),minWidth:900,minHeight:620,show:false,backgroundColor:'#0a0a0c',title:'KYVEX OS',icon:path.join(__dirname,'assets/kyvex.svg'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
    window.setMenuBarVisibility(false);
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',e=>e.preventDefault());
    window.once('ready-to-show',()=>window.show());
    const trusted=e=>{if(e.sender!==window.webContents||e.senderFrame!==window.webContents.mainFrame) throw new Error('Untrusted sender');};
    ipcMain.handle('kyvex:status',e=>{trusted(e);return system.status();});
    ipcMain.handle('kyvex:tools',e=>{trusted(e);return system.tools();});
    ipcMain.handle('kyvex:repositories',e=>{trusted(e);return manager.repositories();});
    ipcMain.handle('kyvex:search-packages',(e,provider,query,sets)=>{trusted(e);if(typeof sets!=='boolean')throw new Error('Invalid filter');return manager.search(provider,query,sets);});
    ipcMain.handle('kyvex:package-details',(e,provider,name)=>{trusted(e);return manager.packageDetails(provider,name);});
    ipcMain.handle('kyvex:start-action',async(e,action,payload)=>{trusted(e);if(typeof action!=='string'||!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('Invalid request');if(action==='performance-start')payload={ticket:await performance.target(payload)};return manager.start(action,payload);});
    ipcMain.handle('kyvex:power',async e=>{trusted(e);return JSON.parse((await run('/usr/bin/python',['/usr/lib/kyvex/power.py','status'],{timeout:15000,maxBuffer:256*1024})).stdout);});
    ipcMain.handle('kyvex:runtimes',async e=>{trusted(e);return JSON.parse((await run('/usr/local/bin/kyvex-app-bridge',['status'],{timeout:20000,maxBuffer:256*1024})).stdout);});
    ipcMain.handle('kyvex:performance',e=>{trusted(e);return performance.status();});
    ipcMain.handle('kyvex:processes',e=>{trusted(e);return performance.processes();});
    ipcMain.handle('kyvex:jobs',e=>{trusted(e);return manager.listJobs();});
    ipcMain.handle('kyvex:hardware',e=>{trusted(e);return manager.hardware();});
    ipcMain.handle('kyvex:kernels',e=>{trusted(e);return manager.kernels();});
    ipcMain.handle('kyvex:launch',(e,id)=>{trusted(e);if(typeof id!=='string') throw new Error('Invalid app');return system.launch(id);});
    ipcMain.handle('kyvex:motion',async(e,reduced)=>{
      trusted(e);if(typeof reduced!=='boolean') throw new Error('Invalid motion');
      await fs.writeFile(path.join(app.getPath('userData'),'preferences.json'),JSON.stringify({...await fs.readFile(path.join(app.getPath('userData'),'preferences.json'),'utf8').then(JSON.parse).catch(()=>({})),reduced}));
      if(process.platform==='linux') {
        await run('/usr/bin/kwriteconfig6',['--file','kdeglobals','--group','KDE','--key','AnimationDurationFactor',reduced?'0':'0.85']);
        await run('/usr/bin/qdbus6',['org.kde.KWin','/KWin','reconfigure']).catch(()=>{});
      }
      return true;
    });
    ipcMain.handle('kyvex:preferences',async e=>{
      trusted(e);try{return JSON.parse(await fs.readFile(path.join(app.getPath('userData'),'preferences.json'),'utf8'));}catch{return {reduced:false};}
    });
    window.loadFile(path.join(__dirname,'index.html'),{hash:requestedPage(process.argv)});
  });
  app.on('window-all-closed',()=>app.quit());
}
