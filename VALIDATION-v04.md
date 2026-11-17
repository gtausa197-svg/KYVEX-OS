# KYVEX 0.4 validation — 2026-11-02

This is an Alpha. Tests exercise the listed paths, not all applications or
physical hardware. Screenshots and selected logs accompany the release.

## Automated checks

- 35 Python tests pass: installer/live guards, graphics selection,
  performance ownership/recovery, executable/APK validation and CPU bounds.
- 12 Node tests pass: fixed launch/action arguments, IPC and process identity.
- Electron smoke test passes: English default, Ukrainian switching, performance
  without a countdown, App Bridge and hardware controls. This harness uses
  hardware fixtures; it does not validate physical clock changes.
- Fresh Meson staging of the pinned Waydroid Helper succeeds. Linux launcher
  line endings and root-only D-Bus mount policy are retained.

## Live and installation

The 0.4 candidate was booted as USB media with copytoram in QEMU/KVM, 8 GiB RAM,
4 CPUs, virtio display. Live detection and Calamares succeeded after removal of
the original boot mount. Calamares completed an offline UEFI installation onto
an explicitly disposable 32 GiB virtual disk; no host physical disks were used.

That test exposed missing shadow entries for system accounts after overlay
refresh. Running pwconv restored SDDM and Plasma login; the installed VM then
booted normally with root locked and no failed system units. The fix is now in
image refresh, Live setup and installer preparation.

The final ISO (SHA256 afc846d54ff428e150395570063633852f31a41517debe51d67ef5b296e410e5,
5,158,221,824 bytes) then passed cold BIOS boot and UEFI USB boot. English Live
and the center opened. The UEFI USB probe found the actual copytoram squashfs
and reported installerAvailable=true after the boot mount was gone. Calamares
opened from the center. pwck -r passed and no failed system units were listed.
The final Live image also rendered its normal SDDM greeter after test-only
autologin removal. No final ISO was altered by those runtime checks.

## Performance

On the installed VM, a desktop profile stayed active after its launcher exited.
Its deadline was null. Manual hardware changes were rejected while the profile
was active. Manual stop restored state with recovery_pending=false.
No physical render speed-up or NVIDIA/AMD clock change was measured.

## Windows example

The actual Wine 11.21 32-bit Notepad PE launched through kyvex-windows,
accepted text and saved Desktop/wine-test.txt. The saved content was verified.
EXE/MSI MIME handlers and MZ binfmt userspace dispatch were inspected.
This does not establish compatibility with arbitrary Windows software,
Windows drivers, anti-cheat or DRM. MSI installation, Bottles runners,
DXVK/VKD3D gaming and commercial applications were not end-to-end tested.

## Android and ARM examples

Official Vanilla Android 13 images were downloaded by the setup action.
Binder, container networking and Plasma Wayland were exercised on the installed
VM. Mesa on this non-3D virtio display did not finish booting; the documented
SwiftShader fallback reached sys.boot_completed=1 and showed Android windows.
The setup now selects that fallback when no AMD/Intel render device exists.

libndk R125, commit faece8cc787a520193545116501cad40534063fc, archive SHA256
235b31e75cd62fe18a6d11f4772df096c767d0d0252ef7eb7a2aeb56448ba915,
was installed through the checksum/overlay path. Android reported ARM32/ARM64.
VLC 3.6.5 was separately installed and launched with each official ABI APK:

| APK | SHA256 | Observed result |
| --- | --- | --- |
| arm64-v8a | 420b1f531d8ff051e089dd32fbd99ae26dcc61ce06dacef91834ba8567bde02d | Separate window, test-video decoding, ARM64 libvlc and lib64/libndk_translation mapped |
| armeabi-v7a | ce1c025ed804a6ae87ebbc2bf1cfc61f1a7d0ddfdddfb2ce6ac9bfbbf13925c4 | Separate window, test-video decoding, ARM libvlc and lib/libndk_translation mapped |

After the R125 runs, Android's crash buffer was empty. This is a short functional
test with software rendering, not a gaming benchmark or long stability test.
Video source: local synthetic 30-second 320x180 MPEG-4 test pattern, not a user file.
APK source: https://download.videolan.org/pub/videolan/vlc-android/3.6.5/ .

The initially evaluated R136 bridge aborted in TranslationCache while playing
ARM64 VLC; it is not the selected release pin. Termux 0.118.3 ARM64 installed
and opened but its bootstrap failed; it is not claimed compatible. No commercial
Android game, Google Play/Integrity, DRM or ARM Linux executable was validated.

After approving the local ADB key in Android's standard dialog, Waydroid Helper
opened the key-mapping overlay; F1 toggled editing/mapping and the widget menu
offered single/repeated tap, direction pad, aim, fire and macro controls. A touch
widget was created. Full gameplay bindings were not tested. Source is included.

## Limits

RTX 5070 and Radeon 860M were not physically attached to the VM. NVIDIA support
and previous Live fixes are preserved, but this test does not establish that the
reported physical display artifacts are gone. Hardware clock controls depend on
what each driver exposes. GPU buffer placement remains driver-managed; there
is no universal forced VRAM-to-RAM eviction service or Windows NT kernel here.

English is the default. Ukrainian is included; German and Polish use English
fallback for untranslated labels. Android images and optional ARM binaries are
not bundled in the ISO and require internet after installation.
