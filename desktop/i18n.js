'use strict';
(()=>{
 const data=window.KYVEX_TRANSLATIONS;
 Object.assign(data.english,{
   'Ідея KYVEX OS та адаптація дизайну —':'KYVEX OS concept and design adaptation by',
   'Назва або опис програми…':'Package name or description…',
   'Пошук пакунків':'Search packages',
   'Драйвери · ':'Drivers · '
 });
 Object.assign(data.uk,{
   Package:'Пакунки',sources:'і джерела',
   'Package sources':'Джерела пакунків',
   'All package sources':'Усі джерела пакунків',
   'Browse Arch, AUR, Ryoku, Flathub, Kali and Parrot.':'Каталог Arch, AUR, Ryoku, Flathub, Kali та Parrot.',
   'Loading package sources…':'Завантажуємо джерела пакунків…',
   'Connect this source to search its packages.':'Підключіть джерело, щоб шукати його пакунки.',
   'Search for a Flatpak application by name or ID.':'Шукайте застосунок Flatpak за назвою або ідентифікатором.',
   'Searching catalogue…':'Шукаємо в каталозі…',
   'Signed packages installed with pacman.':'Підписані пакунки встановлюються через pacman.',
   'Offline AUR catalogue. Installation needs a network connection and a PKGBUILD review.':'Офлайн-каталог AUR. Для встановлення потрібне з’єднання з мережею та перегляд PKGBUILD.',
   'Live AUR search. Review the PKGBUILD before building.':'Пошук в AUR. Перегляньте PKGBUILD перед збиранням.',
   'Applications installed from Flathub.':'Застосунки з каталогу Flathub.',
   'Packages are installed in the selected Distrobox environment.':'Пакунки встановлюються у вибране середовище Distrobox.',
   'Review and install':'Переглянути й встановити',
   'Review and install from AUR':'Переглянути й встановити з AUR',
   'Available after installation':'Доступно після встановлення',
   'Select driver':'Вибрати драйвер',
   'Selected for next boot':'Вибрано для наступного завантаження',
   'Matching hardware':'Сумісне обладнання',
   'Matching GPU not detected':'Сумісну відеокарту не знайдено',
   'GPU outside this branch':'Ця гілка не підтримує виявлену відеокарту',
   'Ryoku Settings':'Налаштування Ryoku',
   'Customize the Ryoku desktop, panels and shortcuts.':'Налаштуйте робочий стіл Ryoku, панелі та комбінації клавіш.',
   'Manage Windows applications and Proton runners.':'Керуйте програмами Windows і версіями Proton.',
   'PortProton settings':'Налаштування PortProton',
   'For older NVIDIA GPUs, choose Nouveau in GRUB. Use Graphics compatibility for display artifacts on a supported NVIDIA GPU.':'Для старіших NVIDIA оберіть Nouveau в GRUB. При артефактах на підтримуваній NVIDIA оберіть Graphics compatibility.'
 });
 const reverse={...Object.fromEntries(Object.entries(data.english).map(([uk,en])=>[en,uk])),...data.uk};
 let language=localStorage.getItem('kyvex-language')||'en';if(!['en','uk','pl','de'].includes(language))language='en';
 const source=new WeakMap(),keys=Object.keys(data.english).sort((a,b)=>b.length-a.length);
 function english(text){const trimmed=text.trim();if(data.english[trimmed])return text.replace(trimmed,data.english[trimmed]);if(data.english[text])return data.english[text];let result=text;for(const key of keys){if(key.length>8&&result.includes(key))result=result.replaceAll(key,data.english[key]);}return result.replaceAll('МГц','MHz').replaceAll('МіБ','MiB').replaceAll('ГіБ','GiB');}
 function translate(text){const en=english(text);if(language==='en')return en;if(language==='uk')return reverse[en.trim()]?en.replace(en.trim(),reverse[en.trim()]):(/[А-Яа-яІіЇїЄєҐґ]/.test(text)?text:en);return data[language][en.trim()]?en.replace(en.trim(),data[language][en.trim()]):en;}
 function apply(){observer.disconnect();document.documentElement.lang=language;document.title=language==='uk'?'KYVEX OS — Центр керування':'KYVEX OS — Control Center';const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(['SCRIPT','STYLE','CODE','PRE','OPTION'].includes(node.parentElement?.tagName))continue;const prior=source.get(node);const original=prior&&prior.last===node.nodeValue?prior.original:node.nodeValue;const value=translate(original);source.set(node,{original,last:value});if(node.nodeValue!==value)node.nodeValue=value;}
 for(const e of document.querySelectorAll('[placeholder],[aria-label]'))for(const a of ['placeholder','aria-label']){if(!e.hasAttribute(a))continue;const k='data-original-'+a;if(!e.hasAttribute(k))e.setAttribute(k,e.getAttribute(a));e.setAttribute(a,translate(e.getAttribute(k)));}
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});}
 const observer=new MutationObserver(apply);
 const box=document.createElement('div');box.className='panel info-card';const label=document.createElement('label');label.textContent='Language / Мова ';const select=document.createElement('select');select.id='kyvex-language';for(const [id,name] of [['en','English'],['uk','Українська'],['pl','Polski — partial, English fallback'],['de','Deutsch — partial, English fallback']]){const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);}select.value=language;select.onchange=()=>{language=select.value;localStorage.setItem('kyvex-language',language);apply();};label.append(select);box.append(label);document.querySelector('#appearance').append(box);apply();
 window.kyvexLanguage={set:code=>{if(['en','uk','pl','de'].includes(code)){language=code;select.value=code;localStorage.setItem('kyvex-language',code);apply();}},translate};
})();
