// KYVEX OS — GPL-3.0. Commands are fixed; renderer input never becomes a shell command.
'use strict';
module.exports = Object.freeze([
  {id:'windows',name:'Open Windows file',description:'Open an EXE or MSI in PortProton.',group:'Apps',icon:'apps',bin:'/usr/local/bin/kyvex-windows',args:[]},
  {id:'android-apk',name:'KYVEX Rift Studio',description:'Android library, game control editor and Live runtime.',group:'Apps',icon:'apps',bin:'/usr/bin/kyvex-rift-studio',args:[]},
  {id:'portproton',name:'PortProton',description:'Windows games, runners and application settings.',group:'Apps',icon:'apps',bin:'/usr/local/bin/kyvex-app-bridge',args:['portproton']},
  {id:'ryoku',name:'Ryoku Hub',description:'Ryoku appearance, shortcuts and session settings.',group:'System',icon:'appearance',bin:'/usr/local/bin/kyvex-ryoku',args:['hub']},
  {id:'ryoku-themes',name:'RyoStore Themes',description:'Browse and apply desktop color schemes.',group:'System',icon:'appearance',bin:'/usr/local/bin/kyvex-ryoku',args:['themes']},
  {id:'displays',name:'Display Settings',description:'Arrange screens, change scale and select a refresh rate.',group:'System',icon:'settings',bin:'/usr/local/bin/kyvex-ryoku',args:['displays']},
  {id:'package-sources',name:'Package sources',description:'Browse Arch, AUR, Ryoku, Flathub, Kali and Parrot.',group:'Apps',icon:'apps',bin:'/usr/local/bin/kyvex-packages',args:[]},
  {id:'aur-terminal',name:'AUR terminal',description:'Search, review and build AUR packages with yay.',group:'Apps',icon:'terminal',bin:'/usr/bin/yay',args:['--help'],terminal:true},
  {id:'creator',name:'gtausa197-svg on GitHub',description:'KYVEX OS concept and design adaptation.',group:'System',icon:'globe',bin:'/usr/bin/xdg-open',args:['https://github.com/gtausa197-svg']},
  {id:'lutris',name:'Lutris',description:'Manage game runners and Windows game environments.',group:'Apps',icon:'apps',bin:'/usr/bin/lutris',args:[]},
  {id:'bottles-open',name:'Bottles',description:'Managed Windows environments and DirectX runners.',group:'Apps',icon:'apps',bin:'/usr/bin/flatpak',args:['run','com.usebottles.bottles']},

  {id:'btop',name:'btop',group:'Продуктивність',icon:'activity',description:'Ресурси, процеси, навантаження CPU та пам’ять.',bin:'/usr/bin/btop',args:[],terminal:true},
  {id:'nvtop',name:'nvtop',group:'Продуктивність',icon:'scan',description:'Монітор GPU та його процесів для підтримуваних драйверів.',bin:'/usr/bin/nvtop',args:[],terminal:true},
  {id:'sensors',name:'Датчики температур',group:'Продуктивність',icon:'activity',description:'Зчитати доступні температури, вентилятори й напруги.',bin:'/usr/bin/sensors',args:[],terminal:true},
  {id:'cpu-info',name:'CPU Power',group:'Продуктивність',icon:'settings',description:'Поточний драйвер CPU, частоти та режими живлення.',bin:'/usr/bin/cpupower',args:['frequency-info'],terminal:true},
  {id:'powertop',name:'PowerTOP',group:'Продуктивність',icon:'activity',description:'Аналіз споживання енергії. Попросить пароль адміністратора.',bin:'/usr/bin/sudo',args:['/usr/bin/powertop'],terminal:true},
  {id:'benchmark',name:'Тест рендеру KYVEX',group:'Продуктивність',icon:'radar',description:'Порівняти два однакові проходи FFmpeg з профілем і без нього. Потрібна авторизація.',bin:'/usr/bin/python',args:['/usr/lib/kyvex/benchmark.py'],terminal:true},
  {id:'terminal',name:'Konsole',group:'Система',icon:'terminal',description:'Термінал вашого робочого середовища.',bin:'/usr/bin/konsole',args:[]},
  {id:'files',name:'Dolphin',group:'Система',icon:'files',description:'Файли, носії та робочі матеріали.',bin:'/usr/bin/dolphin',args:[]},
  {id:'browser',name:'Firefox',group:'Система',icon:'globe',description:'Браузер для досліджень і щоденної роботи.',bin:'/usr/bin/firefox',args:[]},
  {id:'settings',name:'Налаштування',group:'Система',icon:'settings',description:'Пристрої, мережі, живлення та робочий стіл.',bin:'/usr/bin/systemsettings',args:[]},
  {id:'nmap',name:'Nmap',group:'Мережа',icon:'radar',description:'Інвентаризація та аудит власної мережі. Відкриває довідку.',bin:'/usr/bin/nmap',args:['--help'],terminal:true},
  {id:'wireshark',name:'Wireshark',group:'Мережа',icon:'activity',description:'Аналіз мережевих пакетів. Захоплення потребує окремих прав.',bin:'/usr/bin/wireshark',args:[]},
  {id:'tcpdump',name:'tcpdump',group:'Мережа',icon:'network',description:'Консольний аналіз трафіку. Відкриває довідку.',bin:'/usr/bin/tcpdump',args:['--help'],terminal:true},
  {id:'openssl',name:'OpenSSL',group:'Криптографія',icon:'key',description:'Сертифікати, хеші та криптографічні операції.',bin:'/usr/bin/openssl',args:['help'],terminal:true},
  {id:'gpg',name:'GnuPG',group:'Криптографія',icon:'shield',description:'Шифрування файлів і перевірка цифрових підписів.',bin:'/usr/bin/gpg',args:['--help'],terminal:true},
  {id:'yara',name:'YARA',group:'Аналіз',icon:'scan',description:'Пошук шаблонів у файлах за власними правилами.',bin:'/usr/bin/yara',args:['--help'],terminal:true},
  {id:'sleuthkit',name:'Sleuth Kit',group:'Аналіз',icon:'files',description:'Криміналістичний аналіз файлових систем. Довідка mmls.',bin:'/usr/bin/mmls',args:['-V'],terminal:true},
  {id:'journal',name:'Журнал системи',group:'Аналіз',icon:'activity',description:'Системні події поточного завантаження.',bin:'/usr/bin/journalctl',args:['-b','--no-pager','-n','150'],terminal:true},
  {id:'updates',name:'Оновлення системи',group:'Система',icon:'refresh',description:'Оновити підписані пакунки Arch через pacman.',bin:'/usr/bin/sudo',args:['/usr/bin/pacman','-Syu'],terminal:true}
  ,{id:'installer',name:'Встановити KYVEX',group:'Система',icon:'drive',description:'Графічний інсталятор Calamares з вибором розділів, LUKS2 та GRUB.',bin:'/usr/local/bin/kyvex-install',args:[]}
  ,{id:'monitor',name:'Монітор системи',group:'Система',icon:'activity',description:'Процеси, пам’ять, мережа та навантаження.',bin:'/usr/bin/plasma-systemmonitor',args:[]}
  ,{id:'bazaar',name:'Bazaar',group:'Застосунки',icon:'apps',description:'Графічний магазин застосунків Flathub.',bin:'/usr/bin/bazaar',args:[]}
  ,{id:'discover',name:'Discover',group:'Застосунки',icon:'apps',description:'Застосунки Flatpak та підтримувані оновлення прошивок.',bin:'/usr/bin/plasma-discover',args:[]}
  ,{id:'editor',name:'Kate',group:'Застосунки',icon:'terminal',description:'Редактор текстів та коду.',bin:'/usr/bin/kate',args:[]}
  ,{id:'archive',name:'Ark',group:'Застосунки',icon:'files',description:'Робота з архівами.',bin:'/usr/bin/ark',args:[]}
  ,{id:'images',name:'Gwenview',group:'Застосунки',icon:'photo',description:'Перегляд зображень.',bin:'/usr/bin/gwenview',args:[]}
  ,{id:'kali-shell',name:'Kali Terminal',group:'Середовища',icon:'terminal',description:'Термінал створеного середовища Kali Linux.',bin:'/usr/bin/distrobox-enter',args:['--name','kyvex-kali'],terminal:true}
  ,{id:'parrot-shell',name:'Parrot Terminal',group:'Середовища',icon:'terminal',description:'Термінал створеного середовища Parrot OS.',bin:'/usr/bin/distrobox-enter',args:['--name','kyvex-parrot'],terminal:true}
  ,{id:'graphics-diagnostics',name:'Діагностика графіки',group:'Система',icon:'scan',description:'Локальний звіт GPU, драйверів і стану Live-носія.',bin:'/usr/local/bin/kyvex-diagnostics',args:[],terminal:true}
]);
