# KYVEX 0.7 / Rift Native 0.3 validation

Current candidate source checks: 40 Rust tests, 40 Python OS tests,
12 Node Control Center tests and 14 actual release-process tests (106 total).
The release process suite exercises the unprivileged worker, not a mocked CPU.
Both ARM ABIs run the original APK and the advanced multidex/registered-JNI APK.
The advanced sample executes 31 Java checks and four native ABI checks for numeric/array/string/collection/
cast/monitor/switch/exception behavior and repeated real JNI button events.
Packed relocations execute; malformed packed data, invalid APKs, unsupported
opcodes, infinite bytecode and excessive protocol requests fail with bounded errors.
Containment tests deny open/network/exec and inherited descriptors. Daemon
ownership, generation changes, child reaping and legacy profile migration pass.

Clippy and final-image tests are recorded in the release evidence. Qt offscreen
loading of the advanced sample passed. The corpus runner records actual Native
attempts against five local user APKs, including SHA256, first blocker and RSS.
The corpus APKs are not redistributed and successful application compatibility
is not inferred from successful metadata parsing.

Final release cold-boot QA passed in QEMU/KVM with UEFI firmware, a read-only
USB ISO, 4096 MiB RAM, four virtual CPUs and no target disk. The Light GRUB
entry uses copytoram=n. English is the default; Studio labels temporary Live
data correctly. Networking was disabled before the native interaction checks.
The advanced APK displays Core checks: 42 and Registered JNI / ARM64, then
ARM32 after selecting and saving armeabi-v7a in Studio. Actual mouse clicks
produce 7 -> 14 -> 21 on both ABIs. Closing the window reaps the worker.
The original one-DEX APK also passes both ABIs in the release-process suite.

The ARM64 worker used about 32 MiB RSS; ARM32 about 17 MiB. Studio itself
used roughly 325-340 MiB, plus the desktop and OS. These are measurements of
the small first-party fixture, not memory promises for large user APKs.
There was no swap use. Worker uid 1000, Seccomp 2 and NoNewPrivs 1 were verified.
Guest hashes for the worker, daemon, Studio, CPU library and both samples match
the staged release. Waydroid binary, Helper, package, service and Android system
image are absent. Root permissions and sudo are correct; APK association opens
Studio. Installer detection finds the actual mounted squashfs payload.

The desktop Install KYVEX launcher opened the Calamares 0.7 welcome screen
after normal graphical authentication. The test VM has no install target disk,
so the expected no-drive/minimum-space requirements block disk installation.
This verifies opening and payload detection, not completion of installation.

Five actual user APKs (Mobile Legends, Reddit, Subway Surfers, Telegram and
TikTok) all fail with a bounded unsupported-API report before initial UI:
0/5 initial UI, 0/5 fully compatible. First blockers are SharedPreferences,
ConcurrentHashMap, Activity.getIntent, WeakHashMap and CopyOnWriteArrayList,
respectively. Worker hash, APK hashes, full errors and RSS are in the separate
compatibility JSON. The worker binary is identical to the Live-tested one.
No fallback was used. Corpus timings overlap the ISO build and are not a
performance benchmark. User APKs are excluded from distributed artifacts.

This final validation document and evidence were supplemented after ISO QA;
the ISO's embedded pre-boot validation note refers to this release evidence.
No physical NVIDIA/AMD/Intel GPU, full Android CTS/application certification,
long-session audit, arbitrary commercial gameplay or new full Calamares disk
installation is claimed. Historical results from older backends remain separate.
