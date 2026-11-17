'use strict';
const hub={provider:'arch',repos:[],packages:[],visible:48,request:0,timer:null,detail:null,jobSignature:''};
function errorText(e){return e.message.replace(/^Error invoking remote method.*?: Error: /,'');}
async function action(name,payload={}){try{if(!window.kyvex?.startAction)throw new Error('Ця дія доступна у KYVEX OS');await window.kyvex.startAction(name,payload);toast('Додано до черги операцій');await updateJobs();}catch(e){toast(errorText(e));}}
function repoLabel(){return hub.repos.find(r=>r.id===hub.provider)?.name||hub.provider;}
async function loadRepositories(){if(!window.kyvex?.repositories)return;try{hub.repos=await window.kyvex.repositories();renderRepositories();}catch(e){$('#repo-message').textContent=errorText(e);}}
function renderRepositories(){
  const marks={arch:'A',aur:'AU',ryoku:'R',flathub:'F',kali:'K',parrot:'P'};
  const labels={native:'PACMAN',community:'AUR',flatpak:'FLATPAK',distrobox:'DISTROBOX'};
  const root=$('#repositories');
  root.replaceChildren();
  for(const repo of hub.repos){
    const selected=hub.provider===repo.id;
    const card=el('article','repo-card panel'+(selected?' selected':''));
    const button=el('button','repo-selector');
    button.dataset.provider=repo.id;
    button.setAttribute('aria-pressed',String(selected));
    button.onclick=()=>{
      hub.provider=repo.id;
      renderRepositories();
      root.querySelector('[aria-pressed=true]')?.focus();
      searchPackages();
    };
    const copy=el('span');
    copy.append(el('strong','',repo.name),el('small','',repo.description));
    button.append(el('span','repo-mark '+repo.id,marks[repo.id]),copy);
    const footer=el('div','repo-bottom');
    footer.append(el('span','repo-kind',labels[repo.kind]));
    if(!repo.ready){
      const connect=el('button','secondary','Підключити');
      connect.onclick=()=>action('initialize',{provider:repo.id});
      footer.append(connect);
    }else{
      footer.append(el('span','badge good','Підключено'));
    }
    card.append(button,footer,el('span','repo-url',repo.url));
    root.append(card);
  }
  const repo=hub.repos.find(r=>r.id===hub.provider);
  $('#package-sets').disabled=repo?.kind!=='distrobox'||!repo.ready;
  $('#package-sets').closest('label').hidden=repo?.kind!=='distrobox';
  $('#repo-refresh').textContent=repo?.kind==='native'?'Оновити систему ↻':'Оновити індекс ↻';
  $('#repo-refresh').disabled=!repo?.ready;
}
async function searchPackages(){
  const seq=++hub.request;
  const repo=hub.repos.find(r=>r.id===hub.provider);
  $('#package-grid').replaceChildren();
  $('#more-packages').hidden=true;
  $('#package-count').textContent='';
  $('#package-heading').textContent='Пакунки · '+repoLabel();
  const message=$('#repo-message');
  if(!repo?.ready){
    message.textContent=repo?'Connect this source to search its packages.':'Loading package sources…';
    return;
  }
  const query=$('#package-search').value;
  if(repo.id==='flathub'&&!query.trim()){
    message.textContent='Search for a Flatpak application by name or ID.';
    return;
  }
  message.textContent='Searching catalogue…';
  try{
    const result=await window.kyvex.searchPackages(repo.id,query,$('#package-sets').checked);
    if(seq!==hub.request)return;
    hub.packages=result.packages;
    hub.visible=48;
    const sourceCopy={
      native:'Signed packages installed with pacman.',
      community:result.source==='snapshot'?'Offline AUR catalogue. Installation needs a network connection and a PKGBUILD review.':'Live AUR search. Review the PKGBUILD before building.',
      flatpak:'Applications installed from Flathub.',
      distrobox:'Packages are installed in the selected Distrobox environment.'
    };
    message.textContent=sourceCopy[repo.kind];
    const locale=document.documentElement.lang||'en';
    const total=result.total.toLocaleString(locale);
    const sample=result.packages.length.toLocaleString(locale);
    $('#package-count').textContent=result.total>result.packages.length?sample+' / '+total:total;
    renderPackages();
  }catch(e){
    if(seq===hub.request)message.textContent=errorText(e);
  }
}
function renderPackages(){const grid=$('#package-grid');grid.replaceChildren();for(const p of hub.packages.slice(0,hub.visible)){const card=el('article','panel package-card');const top=el('div','package-card-top');const mark=el('span','package-glyph',p.name.startsWith('kali-')||p.name.startsWith('parrot-tools')?'◈':'⌘');top.append(mark,el('span','repo-kind',repoLabel()));card.append(top,el('h3','',p.name),el('p','',p.description));const bottom=el('div','package-card-bottom');bottom.append(el('span','',p.installed===true?'Встановлено':p.version||''));const details=el('button','secondary','Докладніше ↗');details.onclick=()=>showPackage(p);bottom.append(details);card.append(bottom);grid.append(card);}$('#more-packages').hidden=hub.visible>=hub.packages.length;if(!hub.packages.length)grid.append(el('p','quiet','Нічого не знайдено. Спробуйте іншу назву.'));}
async function showPackage(p){
  const detail={provider:hub.provider,name:p.name};
  hub.detail=detail;
  $('#detail-title').textContent=p.name;
  $('#detail-provider').textContent=repoLabel();
  $('#detail-description').textContent=p.description;
  $('#detail-text').textContent='Завантажуємо відомості…';
  $('#detail-remove').hidden=true;
  $('#detail-install').textContent=detail.provider==='aur'?'Review and install':'Встановити · '+repoLabel();
  $('#package-dialog').showModal();
  try{
    const d=await window.kyvex.packageDetails(detail.provider,p.name);
    if(hub.detail!==detail)return;
    $('#detail-text').textContent=d.text;
    $('#detail-remove').hidden=['arch','ryoku'].includes(detail.provider)||!d.installed;
  }catch(e){
    if(hub.detail===detail)$('#detail-text').textContent=errorText(e);
  }
}
$('#detail-close').onclick=()=>$('#package-dialog').close();
$('#detail-install').onclick=()=>{if(hub.detail)action('install',hub.detail);$('#package-dialog').close();};
$('#detail-remove').onclick=()=>{if(hub.detail)action('remove',hub.detail);$('#package-dialog').close();};
$('#package-search').oninput=()=>{clearTimeout(hub.timer);hub.timer=setTimeout(searchPackages,450);};
$('#package-sets').onchange=searchPackages;
$('#more-packages').onclick=()=>{hub.visible+=48;renderPackages();};
$('#repo-refresh').onclick=()=>action('refresh',{provider:hub.provider});
async function loadKernels(){if(!window.kyvex?.kernels)return;try{const data=await window.kyvex.kernels();$('#running-kernel').textContent=data.running;$('#kernel-session').textContent=data.live?'LIVE-СЕСІЯ':'ВСТАНОВЛЕНО';if(data.live)$('#kernel-notice').textContent='У Live-сесії можна завантажити ядро з меню GRUB. Встановлення, оновлення та вибір типового ядра доступні після встановлення KYVEX на диск.';const grid=$('#kernel-grid');grid.replaceChildren();for(const k of data.kernels){const card=el('article','panel kernel-card'+(data.current===k.id?' current':''));const top=el('div','kernel-card-top');top.append(el('span','chip-icon','⌘'),el('span','tag',k.badge));card.append(top,el('h2','',k.name),el('p','',k.description),el('code','kernel-version',k.version||'Ще не встановлено'));const badges=el('div','kernel-badges');if(data.current===k.id)badges.append(el('span','badge good','Працює зараз'));if(data.preferred===k.id)badges.append(el('span','badge neutral','Типове'));card.append(badges);const controls=el('div','kernel-actions');const install=el('button',k.version?'secondary':'primary',k.version?'Оновити':'Встановити');install.disabled=data.live;install.onclick=()=>action('kernel-install',{id:k.id});controls.append(install);if(k.version){const choose=el('button','secondary','Зробити типовим');choose.disabled=data.live||data.preferred===k.id;choose.onclick=()=>action('kernel-default',{id:k.id});controls.append(choose);const remove=el('button','text-button','Видалити');remove.disabled=data.live||data.current===k.id||data.kernels.filter(x=>x.version).length<2;remove.onclick=()=>{if(confirm('Видалити '+k.name+'? Поточне ядро буде збережене.'))action('kernel-remove',{id:k.id});};controls.append(remove);}card.append(controls);grid.append(card);}}catch(e){$('#running-kernel').textContent=errorText(e);}}
async function loadHardware(){
  if(!window.kyvex?.hardware)return;
  const root=$('#hardware-detected');
  try{
    const data=await window.kyvex.hardware();
    root.replaceChildren(el('span','eyebrow','ВИЯВЛЕНО ПРИСТРОЇВ: '+data.devices.length));
    for(const device of data.devices){
      const row=el('div','hardware-row');
      const brand={'8086':'Intel','1002':'AMD','10de':'NVIDIA','1af4':'Virtio'}[device.vendor]||'PCI';
      row.append(el('h3','',brand+' · '+(device.kind||'GPU')+' · '+device.vendor+':'+device.device),
        el('span','badge neutral',device.driver||'Без активного модуля'));
      root.append(row);
    }
    if(data.live)root.append(el('p','quiet','For older NVIDIA GPUs, choose Nouveau in GRUB. Use Graphics compatibility for display artifacts on a supported NVIDIA GPU.'));
    $('#pci-details').textContent=data.pci||'Відомості недоступні';
    const graphics=el('article','panel');
    graphics.append(el('h3','','Сумісність графіки'),
      el('p','',data.graphics?.compatibility?'Активний режим сумісності.':'Звичайне апаратне малювання.'));
    const mode=el('button','secondary',data.graphics?.preferred?'Повернути звичайний режим':'Увімкнути сумісність після перезавантаження');
    mode.disabled=data.live||!!data.graphics?.forced;
    mode.onclick=()=>action('graphics-mode',{enabled:!data.graphics?.preferred});
    graphics.append(mode);
    root.append(graphics);

    const grid=$('#driver-grid');
    grid.replaceChildren();
    for(const driver of data.profiles){
      const isNvidia=driver.vendors.includes('10de');
      const card=el('article','panel driver-card');
      card.append(el('span','driver-chip',isNvidia?'NVIDIA':driver.id.toUpperCase()),
        el('h2','',driver.name),el('p','',driver.description));
      if(driver.selected)card.append(el('span','badge good','Selected for next boot'));
      if(driver.detected)card.append(el('span','badge '+(driver.compatible?'good':'neutral'),
        driver.compatible?'Matching hardware':'GPU outside this branch'));
      else if(driver.vendors.length)card.append(el('span','badge neutral','Matching GPU not detected'));
      if(driver.installed)card.append(el('span','badge neutral','Встановлено'));
      const label=data.live?'Available after installation':driver.legacy?'Review and install from AUR':
        driver.id==='nvidia-nouveau'||driver.installed&&isNvidia?'Select driver':driver.installed?'Оновити профіль':'Встановити профіль';
      const button=el('button','secondary',label);
      button.disabled=data.live||(driver.vendors.length>0&&!driver.compatible);
      button.onclick=()=>{
        if(!isNvidia||confirm('Select '+driver.name+'? Reboot after the operation finishes.')){
          action('driver-install',{id:driver.id});
        }
      };
      card.append(button);
      grid.append(card);
    }
  }catch(e){
    root.textContent=errorText(e);
  }
}
$('#rescan-hardware').onclick=loadHardware;
$('#enable-flathub').onclick=()=>action('flathub',{});
const everyday=[['package-sources','Package sources','Browse Arch, AUR, Ryoku, Flathub, Kali and Parrot.','apps'],['ryoku','Ryoku Settings','Customize the Ryoku desktop, panels and shortcuts.','appearance'],['portproton','PortProton','Manage Windows applications and Proton runners.','apps'],['bazaar','Bazaar','Сучасний магазин застосунків Flathub.','apps'],['discover','Discover','Програми Flatpak та оновлення прошивок.','refresh'],['monitor','Монітор системи','Процеси, ресурси, мережа та навантаження.','activity'],['editor','Kate','Редактор текстів, конфігурацій і коду.','terminal'],['archive','Ark','Архіви та стиснені файли.','files'],['images','Gwenview','Перегляд зображень і знімків екрана.','appearance']];
for(const [id,name,description,ico] of everyday){const card=el('article','tool-card panel');const mark=el('span','icon-box');mark.append(icon(ico));const b=el('button','secondary','Відкрити ↗');b.onclick=()=>launch(id);card.append(mark,el('h3','',name),el('p','',description),b);$('#everyday-apps').append(card);}
$('#toggle-jobs').onclick=()=>$('#job-dock').classList.toggle('collapsed');
async function updateJobs(){if(!window.kyvex?.jobs)return;try{const jobs=await window.kyvex.jobs();if(!jobs.length)return;const signature=JSON.stringify(jobs.map(j=>[j.id,j.state,j.updated]));if(signature===hub.jobSignature)return;const hadRunning=hub.jobSignature&&$('#job-dock').dataset.running==='true';hub.jobSignature=signature;$('#job-dock').hidden=false;const active=jobs.filter(j=>j.state==='running'||j.state==='queued').length;$('#job-dock').dataset.running=String(active>0);$('#job-summary').textContent=active?'Операцій у черзі: '+active:'Останні операції';const list=$('#job-list');list.replaceChildren();for(const j of jobs.slice(0,4)){const row=el('details','job '+j.state);const summary=el('summary');summary.append(el('strong','',j.title),el('span','',({queued:'У черзі',running:'Виконується…',done:'Завершено',failed:'Не завершено'})[j.state]));row.append(summary,el('pre','',j.log||'Очікуємо…'));list.append(row);}if(hadRunning&&!active){await loadRepositories();loadKernels();loadHardware();searchPackages();}}catch{}}
async function initializeHub(){await loadRepositories();searchPackages();await Promise.allSettled([loadKernels(),loadHardware()]);updateJobs();setInterval(updateJobs,1800);}
initializeHub();
