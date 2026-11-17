'use strict';
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {spawn,execFile}=require('node:child_process');
const {promisify}=require('node:util');
const exec=promisify(execFile);
const liveSession=require('./live.cjs');
const community=require('./community.cjs');
const HOST_REPOSITORIES=new Set(['core','extra','multilib']);
const PROVIDERS=Object.freeze({
  arch:{name:'Arch Linux',description:'Official core, extra and multilib packages',url:'https://geo.mirror.pkgbuild.com',kind:'native'},
  aur:{name:'Arch User Repository',description:'Community packages with build-file review',url:'https://aur.archlinux.org',kind:'community'},
  ryoku:{name:'Ryoku',description:'Signed packages from the Ryoku stable repository',url:'https://repo.ryoku.dev/stable/x86_64',kind:'native'},
  flathub:{name:'Flathub',description:'Flatpak applications and runtimes',url:'https://flathub.org',kind:'flatpak'},
  kali:{name:'Kali Linux',description:'Офіційний kali-rolling',url:'https://http.kali.org/kali',image:'docker.io/kalilinux/kali-rolling:latest',container:'kyvex-kali',kind:'distrobox'},
  parrot:{name:'Parrot OS',description:'Офіційні репозиторії образу Parrot',url:'https://deb.parrot.sh/parrot',image:'docker.io/parrotsec/core:latest',container:'kyvex-parrot',kind:'distrobox'}
});
const KERNELS=Object.freeze([
  {id:'linux',name:'Linux Standard',description:'Поточне ядро Arch. Типовий вибір KYVEX.',badge:'STANDARD'},
  {id:'linux-lts',name:'Linux LTS',description:'Тривала підтримка та консервативні зміни.',badge:'LONG TERM'},
  {id:'linux-zen',name:'Linux Zen',description:'Налаштування для чутливого інтерактивного робочого столу. Результат залежить від обладнання.',badge:'DESKTOP'},
  {id:'linux-hardened',name:'Linux Hardened',description:'Додаткові налаштування захисту; можливі обмеження сумісності.',badge:'SECURITY'}
]);
const DRIVERS=Object.freeze([
  {id:'mesa',name:'Mesa',description:'Open graphics stack with software rendering support.',vendors:[],package:'mesa'},
  {id:'intel',name:'Intel Graphics',description:'Mesa, Vulkan Intel and VA-API for supported GPUs.',vendors:['8086'],package:'vulkan-intel'},
  {id:'amd',name:'AMD Radeon',description:'Mesa and RADV Vulkan for supported GPUs.',vendors:['1002'],package:'vulkan-radeon'},
  {id:'firmware',name:'Firmware · Wi-Fi · Audio',description:'Linux firmware, wireless regulatory database and SOF audio.',vendors:[],package:'linux-firmware'},
  {id:'nvidia-open',name:'NVIDIA Open DKMS',description:'Bundled for supported Turing and newer GPUs.',vendors:['10de'],package:'nvidia-open-dkms'},
  {id:'nvidia-nouveau',name:'Nouveau',description:'Bundled open driver for older NVIDIA GPUs and recovery. Choose it from GRUB in Live.',vendors:['10de']},
  ...Object.entries({580:'Maxwell, Pascal and Volta',470:'Kepler',390:'Fermi',340:'GeForce 8, 9, 100, 200 and related GPUs'}).map(([branch,generation])=>({
    id:'nvidia-'+branch,name:'NVIDIA '+branch+'.xx',description:generation+' · AUR and DKMS. Use Xfce (X11) for drivers that require it.',
    vendors:['10de'],package:'nvidia-'+branch+'xx-dkms',legacy:branch
  }))
]);
const jobs=[];let running=false;
const env=()=>({...process.env,LC_ALL:'C',TERM:'dumb',DBX_CONTAINER_MANAGER:'podman',DBX_NON_INTERACTIVE:'1',DEBIAN_FRONTEND:'noninteractive'});
function provider(id){if(typeof id!=='string'||!Object.hasOwn(PROVIDERS,id))throw new Error('Невідоме джерело');return PROVIDERS[id];}
function packageName(name){if(typeof name!=='string'||!/^[a-z0-9@_][a-z0-9@_+.-]{0,100}$/.test(name))throw new Error('Некоректна назва пакунка');return name;}
function flatpakName(name){
  if(typeof name!=='string'||name.length>180||!/^[A-Za-z_][\w-]*(?:\.[A-Za-z_0-9][\w-]*){2,}$/.test(name))throw new Error('Invalid Flatpak application ID');
  return name;
}
function terminal(bin,args){return {bin:'/usr/bin/konsole',args:['--hold','-e',bin,...args]};}
async function run(bin,args,options={}){try{return (await exec(bin,args,{env:env(),timeout:30000,maxBuffer:32*1024*1024,...options})).stdout;}catch(e){throw new Error((e.stderr||e.message).slice(-1800));}}
async function exists(bin){try{await fs.access(bin,1);return true;}catch{return false;}}
function containerCommand(id,args){const p=provider(id);if(p.kind!=='distrobox')throw new Error('Це нативне джерело');return {bin:'/usr/bin/distrobox-enter',args:['--name',p.container,'--','/usr/bin/env','LC_ALL=C','DEBIAN_FRONTEND=noninteractive',...args]};}
function resolveAction(action,payload={}){
  if(action==='power'){
    if(!payload||typeof payload!=='object'||JSON.stringify(payload).length>4096||!['cpu','gpu','profile','reset'].includes(payload.kind))throw new Error('Invalid power request');
    return {title:'Hardware power controls',steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin','power',JSON.stringify(payload)]}]};
  }
  if(action==='bottles')return {title:'Install Bottles from Flathub',steps:[{bin:'/usr/bin/flatpak',args:['remote-add','--user','--if-not-exists','flathub','/usr/share/kyvex/flathub.flatpakrepo']},{bin:'/usr/bin/flatpak',args:['install','--user','--noninteractive','flathub','com.usebottles.bottles']}]};
  if(action==='graphics-mode'){
    if(typeof payload.enabled!=='boolean')throw new Error('Некоректний режим графіки');
    return {title:'Режим сумісності графіки · після перезавантаження',steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin','graphics-mode',payload.enabled?'compat':'normal']}]};
  }
  if(action==='performance-start'){
    if(typeof payload.ticket!=='string'||!/^(render|desktop):[1-9][0-9]{0,8}:[0-9]{1,20}$/.test(payload.ticket))throw new Error('Некоректна програма для профілю');
    return {title:'Увімкнення профілю продуктивності',steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin','performance-start',payload.ticket]}]};
  }
  if(action==='performance-stop')return {title:'Відновлення звичайного режиму',steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin','performance-stop']}]};
  const id=payload.provider;
  if(action==='initialize'){
    const p=provider(id);if(p.kind!=='distrobox')throw new Error('This source is already configured');
    return {title:'Підключення '+p.name,readyProvider:id,steps:[
      {bin:'/usr/bin/distrobox-create',args:['--yes','--name',p.container,'--image',p.image,'--home',path.join(os.homedir(),'.local/share/kyvex/environments',id),'--additional-packages','python3 ca-certificates'],skipIfContainer:id},
      containerCommand(id,['sudo','-n','apt-get','update'])]};
  }
  if(action==='refresh'){
    const p=provider(id);
    if(id==='aur')return {title:'Refresh AUR catalogue',steps:[],refreshAur:true};
    if(id==='flathub')return {title:'Refresh Flathub catalogue',steps:[{bin:'/usr/bin/flatpak',args:['update','--user','--appstream','flathub']}]};
    if(p.kind==='native')return {title:'Update the system',steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin','sync']}]};
    return {title:'Оновлення індексу '+p.name,steps:[{...containerCommand(id,['sudo','-n','apt-get','update']),requireReady:id}]};
  }
  if(action==='install'||action==='remove'){
    const p=provider(id);
    if(id==='flathub'){
      const name=flatpakName(payload.name);
      return {title:action+' '+name+' · Flathub',steps:[
        {bin:'/usr/bin/flatpak',args: action==='install' ?
          ['install','--user','--noninteractive','flathub',name] : ['uninstall','--user','--noninteractive',name]}]};
    }
    const name=packageName(payload.name);
    if(id==='aur')return {title:action+' '+name+' · AUR',steps:[
      terminal('/usr/local/bin/kyvex-aur-install',[action==='install'?'aur':'remove',name])]};
    if(action==='remove'&&['apt','bash','sudo','passwd','coreutils','base-files','systemd','distrobox','podman'].includes(name))throw new Error('Системний компонент не можна видалити тут');
    if(p.kind==='native'){
      if(action==='remove')throw new Error('Видалення нативних пакунків доступне через системний менеджер');
      return {title:'Install '+name+' · '+p.name,steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin',id==='ryoku'?'package-ryoku':'package',name]}]};
    }
    return {title:(action==='install'?'Встановлення ':'Видалення ')+name+' · '+p.name,steps:[{...containerCommand(id,['sudo','-n','apt-get',action==='install'?'install':'remove','-y','--',name]),requireReady:id,...(action==='install'?{spaceCheck:{provider:id,name}}:{})}]};
  }
  if(['kernel-install','kernel-default','kernel-remove'].includes(action)){
    if(!KERNELS.some(k=>k.id===payload.id))throw new Error('Невідоме ядро');
    return {title:{'kernel-install':'Встановлення ядра ','kernel-default':'Ядро за замовчуванням ','kernel-remove':'Видалення ядра '}[action]+payload.id,steps:[{bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin',action,payload.id]}]};
  }
  if(action==='driver-install'){
    const driver=DRIVERS.find(d=>d.id===payload.id);
    if(!driver)throw new Error('Невідомий профіль драйверів');
    const step=driver.legacy?terminal('/usr/local/bin/kyvex-nvidia-legacy',[driver.legacy]):
      {bin:'/usr/bin/pkexec',args:['/usr/lib/kyvex/kyvex-admin',action,driver.id]};
    return {title:'Drivers · '+driver.name,steps:[step]};
  }
  if(action==='flathub')return {title:'Підключення Flathub',steps:[{bin:'/usr/bin/flatpak',args:['remote-add','--user','--if-not-exists','flathub','/usr/share/kyvex/flathub.flatpakrepo']}]};
  throw new Error('Невідома дія');
}
async function containerExists(id){const p=provider(id);if(p.kind!=='distrobox')return true;try{await exec('/usr/bin/podman',['container','exists',p.container],{env:env(),timeout:6000});return true;}catch{return false;}}
const readyPath=id=>path.join(os.homedir(),'.local/share/kyvex/repositories',id+'.ready');
async function containerReady(id){if(provider(id).kind!=='distrobox')return true;try{await fs.access(readyPath(id));return await containerExists(id);}catch{return false;}}
function append(job,text){job.log=(job.log+text).slice(-65536);job.updated=Date.now();}
async function executeStep(job,step){
  if(step.requireReady&&!await containerReady(step.requireReady))throw new Error('Спершу підключіть це джерело та дочекайтеся успішного завершення налаштування.');
  if(step.skipIfContainer&&await containerExists(step.skipIfContainer)){append(job,'Середовище вже створене.\n');return;}
  if(step.spaceCheck)await ensureSpace(step.spaceCheck.provider,step.spaceCheck.name,job);
  await new Promise((resolve,reject)=>{
    const p=spawn(step.bin,step.args,{env:env(),shell:false,stdio:['ignore','pipe','pipe']});
    p.stdout.on('data',d=>append(job,d.toString()));p.stderr.on('data',d=>append(job,d.toString()));
    p.on('error',reject);p.on('close',code=>code===0?resolve():reject(new Error(code===126?'Авторизацію скасовано':'Процес завершився з кодом '+code)));
  });
}
function planBytes(text){
  const match=text.match(/(?:After this operation,|Space needed:)\s*([\d,.]+)\s*(kB|MB|GB|TB)/i);
  if(!match)return null;
  return Number(match[1].replaceAll(',',''))*({kb:1e3,mb:1e6,gb:1e9,tb:1e12})[match[2].toLowerCase()];
}
async function ensureSpace(id,name,job){
  const c=containerCommand(id,['sudo','-n','apt-get','--assume-no','install','--',name]);
  let text='';
  try{text=(await exec(c.bin,c.args,{env:env(),timeout:90000,maxBuffer:32*1024*1024})).stdout;}catch(e){if(e.code!==1)throw new Error((e.stderr||e.message).slice(-1800));text=e.stdout||'';}
  const needed=planBytes(text);const stat=await fs.statfs(os.homedir());const available=stat.bavail*stat.bsize;
  append(job,'Перевірка місця на диску…\n'+text.slice(-15000)+'\n');
  if(needed!==null&&needed*1.25+512*1024**2>available)throw new Error('Недостатньо вільного місця для цього набору та його залежностей. У Live-сесії сховище тимчасове; встановіть KYVEX на диск або оберіть менший набір.');
  if(needed===null&&/^(kali-linux-(everything|large|default)|parrot-tools-full)$/.test(name)&&available<30*1024**3)throw new Error('Великий набір потребує десятків гігабайтів. Оберіть встановлену систему з достатнім вільним місцем.');
}
async function drain(){if(running)return;running=true;try{for(const job of jobs.filter(x=>x.state==='queued')){job.state='running';job.updated=Date.now();try{if(job.refreshAur)community.clearCache();for(const step of job.steps)await executeStep(job,step);if(job.readyProvider){await fs.mkdir(path.dirname(readyPath(job.readyProvider)),{recursive:true});await fs.writeFile(readyPath(job.readyProvider),JSON.stringify({provider:job.readyProvider,initialized:Date.now()}));}job.state='done';append(job,'\nГотово.\n');}catch(e){job.state='failed';append(job,'\n'+e.message+'\n');}job.updated=Date.now();}}finally{running=false;if(jobs.some(x=>x.state==='queued'))drain();}}
function start(action,payload){const plan=resolveAction(action,payload);if(jobs.filter(j=>['queued','running'].includes(j.state)).length>=10)throw new Error('Черга заповнена');const job={id:crypto.randomUUID(),title:plan.title,state:'queued',log:'',created:Date.now(),updated:Date.now(),steps:plan.steps,readyProvider:plan.readyProvider,refreshAur:plan.refreshAur};jobs.push(job);while(jobs.length>30&&!['queued','running'].includes(jobs[0].state))jobs.shift();drain();return job.id;}
function listJobs(){return jobs.map(({steps,readyProvider,...j})=>({...j})).reverse();}
async function repositories(){return Promise.all(Object.entries(PROVIDERS).map(async([id,p])=>({id,name:p.name,description:p.description,url:p.url,kind:p.kind,ready:await containerReady(id)})));}
const regexEscape=q=>q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function filterPackageSets(packages,query){const q=query.trim().toLowerCase();return q?packages.filter(p=>(p.name+' '+p.description).toLowerCase().includes(q)):packages;}
async function installedPackages(){
  const names=await run('/usr/bin/pacman',['-Qq']).catch(()=>'');
  return new Set(names.split('\n'));
}
async function installedFlatpaks(scope){
  const names=await run('/usr/bin/flatpak',['list',scope,'--app','--columns=application']).catch(()=>'');
  return new Set(names.trim().split('\n'));
}
async function flatpakSearch(query){
  if(!query.trim())return {packages:[],ready:true,total:0};
  const [text,user,system]=await Promise.all([
    run('/usr/bin/flatpak',['search','--columns=application,name,description,version,remotes','--',query.trim()]),
    installedFlatpaks('--user'),installedFlatpaks('--system')
  ]);
  const packages=text.trim().split('\n').flatMap(line=>{
    const [name,label,description,version,remotes]=line.split('\t');
    if(!remotes?.split(',').map(r=>r.trim()).includes('flathub'))return [];
    try{flatpakName(name);}catch{return [];}
    return [{name,version,description:label+' · '+description,installed:user.has(name)||system.has(name)}];
  });
  return {packages,total:packages.length,ready:true};
}
async function search(id,query='',sets=false){
  const p=provider(id);if(typeof query!=='string'||query.length>100)throw new Error('Запит надто довгий');
  if(!await containerReady(id))return {packages:[],ready:false,total:0};
  if(id==='aur')return community.search(query,await installedPackages());
  if(id==='flathub')return flatpakSearch(query);
  sets=sets&&p.kind==='distrobox';
  const pattern=sets?(id==='kali'?'^kali-(tools|linux)-':'^parrot-tools'):regexEscape(query.trim())||'.';
  let data;
  if(p.kind==='native'){
    let text='';try{text=await run('/usr/bin/pacman',['-Ss','--color','never','--',pattern]);}catch(e){if(!e.message.includes('Command failed:'))throw e;}
    const lines=text.split('\n');data=[];
    for(let i=0;i<lines.length;i++){
      const m=lines[i].match(/^(\w+)\/([^ ]+) ([^ ]+)(.*)$/);
      if(m&&(id==='ryoku'?m[1]==='ryoku':HOST_REPOSITORIES.has(m[1]))){
        data.push({name:m[2],version:m[3],description:(lines[i+1]||'').trim(),installed:m[4].includes('[installed')});i++;
      }
    }
  }else{
    const c=containerCommand(id,['apt-cache','search',...(sets?['--names-only']:[]),'--',pattern]);
    const text=await run(c.bin,c.args,{timeout:60000});
    data=text.split('\n').flatMap(line=>{const m=line.match(/^([a-z0-9][a-z0-9+.-]*) - (.*)$/);return m?[{name:m[1],description:m[2],installed:null}]:[];});
  }
  if(sets)data=filterPackageSets(data,query);
  return {packages:data.sort((a,b)=>a.name.localeCompare(b.name)),ready:true,total:data.length};
}
async function packageDetails(id,name){
  const p=provider(id);
  if(id==='flathub'){
    flatpakName(name);
    const [text,installed]=await Promise.all([run('/usr/bin/flatpak',['remote-info','flathub',name]),installedFlatpaks('--user')]);
    return {text:text.slice(0,16000),installed:installed.has(name)};
  }
  packageName(name);
  if(!await containerReady(id))throw new Error('Спершу підключіть це джерело.');
  if(id==='aur')return community.details(name,await installedPackages());
  if(id==='arch')return {text:await run('/usr/bin/pacman',['-Si','--',name])};
  if(p.kind==='native')return {text:await run('/usr/bin/pacman',['-Si','--','ryoku/'+name])};
  const c=containerCommand(id,['apt-cache','show','--no-all-versions','--',name]);
  const text=await run(c.bin,c.args);
  const status=containerCommand(id,['dpkg-query','-W','-f=${db:Status-Status}',name]);
  let installed=false;try{installed=(await run(status.bin,status.args)).trim()==='installed';}catch{}
  return {text:text.slice(0,16000),installed};
}
async function hardware(){
  let pci='';try{pci=await run('/usr/bin/lspci',['-nnk']);}catch{}
  const devices=[];try{for(const dir of await fs.readdir('/sys/bus/pci/devices')){
    const base='/sys/bus/pci/devices/'+dir;
    const klass=(await fs.readFile(base+'/class','utf8')).trim();
    if(!['0x03','0x02','0x04'].some(prefix=>klass.startsWith(prefix)))continue;
    const vendor=(await fs.readFile(base+'/vendor','utf8')).trim().replace('0x','');
    const device=(await fs.readFile(base+'/device','utf8')).trim().replace('0x','');
    let driver='';try{driver=path.basename(await fs.readlink(base+'/driver'));}catch{}
    devices.push({address:dir,vendor,device,driver,kind:klass.startsWith('0x03')?'GPU':klass.startsWith('0x02')?'Мережа':'Аудіо'});
  }}catch{}
  const [installed,compatible,driverMode]=await Promise.all([
    installedPackages(),
    run('/usr/bin/python',['/usr/lib/kyvex/nvidia_support.py']).then(JSON.parse).catch(()=>({})),
    fs.readFile('/etc/kyvex/nvidia-driver','utf8').then(v=>v.trim()).catch(()=>'open')
  ]);
  let graphics={compatibility:false,forced:false};try{graphics=JSON.parse(await fs.readFile('/run/kyvex/graphics.json','utf8'));}catch{}
  graphics.preferred=(await fs.readFile('/etc/kyvex/graphics-compat','utf8').catch(()=>'' )).trim()==='1';
  return {devices,pci:pci.slice(0,20000),live:(await liveSession.status()).live,graphics,profiles:DRIVERS.map(d=>{
    const detected=d.vendors.some(v=>devices.some(x=>x.vendor===v&&x.kind==='GPU'));
    const nvidia=d.vendors.includes('10de');
    return {...d,detected,compatible:nvidia?!!compatible[d.id]:!d.vendors.length||detected,
      installed:d.package?installed.has(d.package):true,
      selected:d.id==='nvidia-nouveau'?driverMode==='nouveau':d.id==='nvidia-open'?driverMode==='open'&&!!compatible[d.id]:!!d.legacy&&driverMode==='legacy'&&installed.has(d.package)};
  })};
}
async function kernels(){
  let installed='';try{installed=await run('/usr/bin/pacman',['-Q']);}catch{}
  let current='';try{current=(await fs.readFile('/usr/lib/modules/'+os.release()+'/pkgbase','utf8')).trim();}catch{}
  let preferred='linux';try{const s=await fs.readFile('/etc/default/grub.d/50-kyvex-kernel.cfg','utf8');preferred=s.match(/vmlinuz-(linux(?:-lts|-zen|-hardened)?)/)?.[1]||preferred;}catch{}
  const live=(await liveSession.status()).live;
  return {running:os.release(),current,preferred,live,kernels:KERNELS.map(k=>({...k,version:installed.split('\n').find(s=>s.startsWith(k.id+' '))?.split(' ')[1]||null}))};
}
module.exports={PROVIDERS,KERNELS,DRIVERS,resolveAction,packageName,containerCommand,repositories,search,packageDetails,start,listJobs,hardware,kernels,regexEscape,planBytes,filterPackageSets};
