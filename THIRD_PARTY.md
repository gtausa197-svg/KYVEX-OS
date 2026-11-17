# Attribution and licensing

KYVEX OS concept and design adaptation by gtausa197-svg.
https://github.com/gtausa197-svg

The Aurora boot menu takes layout inspiration from Aarambh's full-screen
panels. Its artwork and GRUB configuration are maintained by KYVEX.
https://github.com/NarkAgni/aarambh

KYVEX 0.8 bundles Yay 13.1.0 (GPL-3.0), Ryoku Settings and Ryoku
Shell from revision 08ff3280c9c0b702250c82ac6a7047862c0d72a0 (GPL-3.0 and
component licenses), and PortProton 1.7.5 from Flathub. The initial
PortProton profile includes PortWINE revision bc3e52e4ce71be2c62f3ec819dc1f5f8f917b090,
and upstream Proton LG, Wine LG, plugins, DXVK and VKD3D-Proton.

Sources: https://github.com/Jguer/yay/tree/v13.1.0 ,
https://github.com/Ryoku-dev/ryoku/tree/08ff3280c9c0b702250c82ac6a7047862c0d72a0 ,
https://github.com/Castro-Fidel/PortWINE/tree/bc3e52e4ce71be2c62f3ec819dc1f5f8f917b090 ,
https://github.com/Castro-Fidel/wine_builds/releases ,
https://github.com/Castro-Fidel/vulkan/releases .

KYVEX Control Center incorporates the following source from DuoDesk:

- `desktop/vendor/base.css` copied from `linux/app.css`.
- `desktop/vendor/aurora.css` copied from `shared/aurora.css`.
- `desktop/vendor/fonts/*` copied from `shared/fonts/*`.
- Sidebar, cards, motion curves and Aurora visual language adapted for KYVEX.

Upstream: https://github.com/0xCodez/DuoDesk
Exact source revision: `50125ca0c4f73ab3253e739dd8a6ec9cf1a8444b`.
DuoDesk by 0xCodez, based on TwinDesk, Copyright (C) 2026 inukaasith.
CSS and derived control center: GNU GPL version 3; full text in `LICENSE`.
Geist and Geist Mono: SIL Open Font License, in `desktop/vendor/fonts/OFL.txt`.
KYVEX modifications, artwork and build scripts: GPL-3.0.

KYVEX 0.3 includes Calamares 3.4.3 built from the official Codeberg source,
revision `af2eaf829b7c60ae5b69b9fe68f9158dc98d3331`:
https://codeberg.org/Calamares/calamares . Calamares has per-file SPDX licenses,
including GPL-3.0-or-later, BSD-2-Clause and CC0; these are retained in the
Calamares source and `/usr/share/licenses/calamares-kyvex`.
KYVEX Calamares configuration uses upstream documented interfaces and schemas.

The NVIDIA compatibility files contain functional product/PCI identifiers
from NVIDIA's current and legacy product documentation. Their source URLs
and SHA256 values are embedded in the JSON. The live image includes the
official Arch NVIDIA Open packages and Nouveau. Optional legacy packages
are built through AUR and retain the upstream driver notices.
GRUB's KYVEX font is generated from DejaVu Sans; font licenses are supplied
by the installed `ttf-dejavu` package.

The ISO includes corresponding KYVEX source under `/usr/share/kyvex/source`.
Other packages retain their own licenses under `/usr/share/licenses` and source
availability through official Arch package metadata and upstream projects.
For redistribution of an ISO, provide corresponding source for all GPL components
in compliance with their licenses; this KYVEX source archive alone is not the
complete corresponding source for the entire distribution.

KYVEX OS is an independent project; it is not an official Arch Linux release,
KDE product, or DuoDesk release. The Linux kernel comes from the Arch `linux`
package. No new kernel has been authored for this alpha.

The keyboard preview uses the unmodified `ckbcomp` script from Debian
console-setup 1.249 (Anton Zinoviev, GPL-2.0-or-later). Source archive:
https://deb.debian.org/debian/pool/main/c/console-setup/console-setup_1.249.tar.xz
SHA256: `2042e268b085ad900f2f9863715d67fadb95b8994554f10d407fc14f224b73ae`.
The script source and copyright are included in the KYVEX source tree;
license files are installed at `/usr/share/licenses/ckbcomp`.

The performance layer is KYVEX GPL-3.0 source. Its small Python NVML adapter
declares functional public API names and the three-field PowerMizer structure
documented by NVIDIA; the NVIDIA header and driver are not copied into it.
Reference: https://github.com/NVIDIA/go-nvml/blob/main/pkg/nvml/nvml.h .
Monitoring and performance packages retain their upstream licenses in the ISO:
btop, nvtop, lm_sensors, cpupower, powertop, power-profiles-daemon,
zram-generator and FFmpeg. Package versions are supplied in the release manifest.

KYVEX 0.7 retains Wine, Wine Mono/Gecko, Winetricks and Lutris as official
Arch packages with their upstream licenses. https://www.winehq.org/ .
Windows PE dispatch runs Wine in userspace.

Rift Engine / Studio is original GPL-3.0 KYVEX source. Qt 6 is dynamically
linked through official Arch packages. Rust dependency versions and checksums
are in rift/Cargo.lock; license metadata is in rift/DEPENDENCIES.json.
Waydroid, its helper, the libndk installer and scrcpy control adapter were
removed from current source and ISO inputs. Historical reports retain their
attribution and do not describe the current execution backend.

The DEX interpreter follows AOSP's documented formats:
https://source.android.com/docs/core/runtime/dex-format and
https://source.android.com/docs/core/runtime/dalvik-bytecode .
JNI table indexes/signatures follow the public JNI specification:
https://docs.oracle.com/javase/8/docs/technotes/guides/jni/spec/functions.html .
APS2 and RELR are implemented in original Rust against the published formats:
https://android.googlesource.com/platform/bionic/+/refs/heads/main/linker/linker_reloc_iterators.h
and https://gabi.xinuos.com/elf/08-dynamic.html . No Bionic implementation
was copied. User-supplied APKs in D:/apk are local test inputs and are not
included in the ISO or source archive.

KYVEX 0.7 / Rift Native 0.3 includes Dynarmic 6.7.0, commit
a41c380246d3d9f9874f0f792d234dc0cc17c180 from
https://github.com/lioncash/dynarmic (0BSD), under vendor/dynarmic.
Upstream supplies the ARM CPU dynamic recompiler; KYVEX supplies the Rust
ELF/DEX loaders, guest memory, JNI boundary, limited Android UI API, worker
containment, supervisor and Qt presentation. This is not a claim to have
written Dynarmic. The upstream repository is archived; the runtime is an
experimental prototype, not a security-audited sandbox.

Dynarmic's bundled dependencies retain their original license files within
vendor/dynarmic/externals: fmt, mcl, oaknut, biscuit, robin-map, xbyak,
zydis, zycore and Catch. Only build dependencies selected by CMake are linked.
The complete vendored source, including those licenses, is in the source
archive and /usr/share/kyvex/source on the ISO. A copy of Dynarmic's license
and its dependency license inventory is also installed in
/usr/share/licenses/kyvex-rift-native.

The Native VM embeds an unmodified `org.json` module from Android libcore
`android-9.0.0_r61` (Apache-2.0). Rift executes its DEX inside the isolated
guest process. The original Java sources and license are in
`rift/crates/rift-native/support/aosp-json`. Revision and SHA-256 pins are in
`rift/crates/rift-native/support/android-json.json`. The image staging script
installs the license and pins under `/usr/share/licenses/kyvex-rift-native/aosp-json`.

The bundled first-party demo and advanced APKs, Java code, ARM assembly / C and build scripts
and compile-only Android signature stubs are original GPL-3.0 KYVEX source.
Google's unmodified D8/R8 9.5.29 is a build tool, not included in the ISO:
https://developer.android.com/tools/d8 . Its pinned artifact digest and URL
are recorded in rift/samples/TOOLCHAIN.json. The APK contains no SDK stub
implementations and no third-party games or private signing key.

Rift Native 0.3 dynamically links ICU for Unicode regex, case conversion and
number formatting, and HarfBuzz for glyph coverage and shaping. The Arch
packages retain the upstream licenses under /usr/share/licenses. Rift uses
installed Noto Sans, Noto Color Emoji and DejaVu Sans font faces.
API references are available at https://unicode-org.github.io/icu-docs/ and
https://harfbuzz.github.io/ .
The original scalar JNI ABI adapter follows Arm AAPCS32/64 and Android's softfp
calling convention: https://github.com/ARM-software/abi-aa and
https://developer.android.com/ndk/guides/abis .
