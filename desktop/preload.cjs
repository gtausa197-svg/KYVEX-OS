'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('kyvex',Object.freeze({
  power:()=>ipcRenderer.invoke('kyvex:power'),
  runtimes:()=>ipcRenderer.invoke('kyvex:runtimes'),
  status:()=>ipcRenderer.invoke('kyvex:status'),
  tools:()=>ipcRenderer.invoke('kyvex:tools'),
  launch:id=>ipcRenderer.invoke('kyvex:launch',id),
  onOpenPackages:callback=>ipcRenderer.on('kyvex:open-packages',()=>callback()),
  motion:reduced=>ipcRenderer.invoke('kyvex:motion',reduced),
  preferences:()=>ipcRenderer.invoke('kyvex:preferences'),
  repositories:()=>ipcRenderer.invoke('kyvex:repositories'),
  searchPackages:(provider,query,sets)=>ipcRenderer.invoke('kyvex:search-packages',provider,query,sets),
  packageDetails:(provider,name)=>ipcRenderer.invoke('kyvex:package-details',provider,name),
  startAction:(action,payload)=>ipcRenderer.invoke('kyvex:start-action',action,payload),
  jobs:()=>ipcRenderer.invoke('kyvex:jobs'),
  hardware:()=>ipcRenderer.invoke('kyvex:hardware'),
  kernels:()=>ipcRenderer.invoke('kyvex:kernels'),
  performance:()=>ipcRenderer.invoke('kyvex:performance'),
  processes:()=>ipcRenderer.invoke('kyvex:processes')
}));
