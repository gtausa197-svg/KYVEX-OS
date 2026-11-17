'use strict';
document.querySelector('#pages').insertAdjacentHTML('beforeend',`
<section class="page" id="software" hidden aria-labelledby="software-title">
 <div class="heading"><div><h1 id="software-title">Package <span>sources</span></h1><p>Browse Arch, AUR, Ryoku, Flathub, Kali and Parrot.</p></div><button class="secondary" id="repo-refresh">Оновити джерело ↻</button></div>
 <div id="repositories" class="repo-grid"></div>
 <div class="hub-toolbar"><label class="search"><span>⌕</span><input id="package-search" type="search" placeholder="Назва або опис програми…" aria-label="Пошук пакунків"></label><label class="sets-filter"><input id="package-sets" type="checkbox"> Набори інструментів</label></div>
 <div id="repo-message" class="repo-message"></div><div class="section-heading"><h2 id="package-heading">Каталог</h2><span id="package-count"></span></div>
 <div id="package-grid" class="package-grid"></div><button id="more-packages" class="secondary more-button" hidden>Показати ще</button>
 <div class="panel ecosystem-note"><span data-icon="shield"></span><p>Kali та Parrot встановлюють програми у власні середовища з офіційних репозиторіїв. Для Wi-Fi monitor mode, модулів ядра та прямих апаратних операцій обирайте сумісні нативні інструменти Arch.</p></div>
</section>
<section class="page" id="kernels" hidden aria-labelledby="kernels-title">
 <div class="eyebrow">SYSTEM CORE / KERNELS</div><div class="heading"><div><h1 id="kernels-title">Основа вашого <span>ритму.</span></h1><p>LTS, Standard, Zen та Hardened. Обирайте під своє завдання.</p></div></div>
 <div class="panel kernel-current"><span class="live-dot"></span><div><small>ЗАРАЗ ПРАЦЮЄ</small><h2 id="running-kernel">Зчитуємо ядро…</h2></div><span class="badge neutral" id="kernel-session">LINUX</span></div>
 <p class="quiet" id="kernel-notice">Після зміни ядра потрібне перезавантаження. Поточне та останнє встановлене ядро захищені від видалення.</p>
 <div class="kernel-grid" id="kernel-grid"></div>
</section>
<section class="page" id="drivers" hidden aria-labelledby="drivers-title">
 <div class="eyebrow">HARDWARE / DRIVERS</div><div class="heading"><div><h1 id="drivers-title">Знайомі з вашим <span>залізом.</span></h1><p>Виявлені пристрої, активні модулі та профілі драйверів.</p></div><button class="secondary" id="rescan-hardware">Перевірити знову ↻</button></div>
 <div class="panel hardware-detected" id="hardware-detected"></div><div class="driver-grid" id="driver-grid"></div>
 <details class="panel technical"><summary>Докладна інформація про PCI-пристрої</summary><pre id="pci-details"></pre></details>
 <div class="two-grid"><button class="action-card panel" data-launch="settings"><span data-icon="settings"></span><h3>Пристрої та дисплеї</h3><p>Налаштування Plasma ↗</p></button><button class="action-card panel" data-launch="discover"><span data-icon="refresh"></span><h3>Оновлення прошивок</h3><p>Discover та fwupd · доступність залежить від пристрою ↗</p></button></div>
</section>
<section class="page" id="apps" hidden aria-labelledby="apps-title">
 <div class="eyebrow">EVERYDAY / APPLICATIONS</div><div class="heading"><div><h1 id="apps-title">Усе для <span>щодня.</span></h1><p>Встановлюйте застосунки й керуйте своїм простором.</p></div><button class="secondary" id="enable-flathub">Підключити Flathub</button></div>
 <div class="market-hero panel"><div><h2>Flathub</h2><p>Bazaar та Discover відкривають каталог Flathub.</p><button class="primary" data-launch="bazaar">Відкрити Bazaar ↗</button> <button class="secondary" data-launch="package-sources">All package sources</button></div><div class="market-graphic" aria-hidden="true">✦</div></div>
 <div id="everyday-apps" class="tool-grid"></div>
</section>
<section class="page" id="install" hidden aria-labelledby="install-title">
 <div class="eyebrow">WELCOME / INSTALLATION</div><div class="heading"><div><h1 id="install-title">Залиште KYVEX <span>із собою.</span></h1><p>Повноцінне графічне встановлення через Calamares.</p></div></div>
 <div class="panel installation-hero"><img src="assets/kyvex.svg" alt=""><span class="tag">CALAMARES 3.4.3</span><h2>Ваш новий робочий простір.</h2><p>Мова, розкладка, часовий пояс, розділи, користувач і завантажувач GRUB — в одному майстрі. Працює з образом Live без завантаження базової системи з мережі.</p><button class="primary" data-launch="installer">Встановити KYVEX OS ↗</button><small>Майстер покаже заплановані зміни та попросить підтвердження перед записом на диск.</small></div>
 <div class="two-grid"><article class="panel install-feature"><span>01</span><h3>Гнучке розбиття</h3><p>Автоматичний або ручний вибір розділів. За бажанням — шифрування LUKS2 з окремим незашифрованим /boot.</p></article><article class="panel install-feature"><span>02</span><h3>Готовність після входу</h3><p>Standard, LTS та Zen, базові програми, фаєрвол і головний центр KYVEX зберігаються після встановлення.</p></article></div>
</section>
`);
document.body.insertAdjacentHTML('beforeend',`<dialog id="package-dialog"><div class="dialog-head"><div><span class="eyebrow" id="detail-provider"></span><h2 id="detail-title"></h2></div><button id="detail-close" class="close-button" aria-label="Закрити">×</button></div><p id="detail-description"></p><details class="technical"><summary>Відомості про пакунок</summary><pre id="detail-text"></pre></details><div class="dialog-actions"><button class="secondary" id="detail-remove" hidden>Видалити</button><button class="primary" id="detail-install">Встановити</button></div></dialog><aside id="job-dock" hidden><div class="job-dock-head"><span class="live-dot"></span><strong id="job-summary">Черга операцій</strong><button id="toggle-jobs" aria-label="Згорнути журнал">⌄</button></div><div id="job-list"></div></aside>`);
