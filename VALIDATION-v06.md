# KYVEX 0.6 / Rift Native 0.2 — validation record

Automated checks performed on the x86-64 Arch Linux WSL builder:

- Rust workspace: 32 tests, including actual ARM32/Thumb/ARM64 execution,
  memory permissions, ELF/DEX validation and a real Java/D8 APK with ARM JNI.
- The APK integration test executes 300 Java → JNI → ARM button events on
  each ABI and checks collection of temporary Java objects between events.
- Native release-process suite: 12 tests. Covers ARM Linux ELF syscalls,
  ARM32/ARM64 NEON SIMD, native APK clicks, memory stability, root refusal,
  host file/network/exec denial, closed inherited FDs, oversized input,
  malformed APKs, unsupported opcodes, infinite DEX and session ownership.
- Additional real shared-library fixtures exercise ARM32 REL and ARM64 RELA
  relative/PLT relocation, a guest Bionic strlen import and unknown-import
  rejection. Packed Android relocations are explicitly rejected.
- Replaced/closed worker processes are killed and reaped; the desktop daemon
  remains alive after rejection of invalid client/session operations.
- Existing Python suite: 45 pass. Existing Node suite: 12 pass.
- Qt Studio compiles from source against Qt 6. No Android image, Houdini or
  libndk was involved in any Native execution result.

Builder measurement, first-party demo, light profile: ARM64 worker about
30 MiB peak RSS; ARM32 about 15 MiB. After 200 events the Java heap estimate
changed from 1,145 to 1,169 bytes, guest pages remained 98,304 bytes and worker
RSS remained within the 8 MiB permitted regression band. These small-demo
measurements do not describe whole-system RAM or predict complex app speed.

The candidate ISO booted from read-only UEFI USB media with 4 GiB guest RAM:
the desktop opened Studio automatically, and real mouse clicks in the Native
APK window changed 7 → 28 on ARM64 and 7 → 21 on ARM32. The GUI ABI selector
persisted ARM32 into the profile. No Android image or Electron welcome process
was present. Worker seccomp=2, no_new_privs=1, uid=1000; password sudo and root
directory permissions passed. Closing the native window removed the worker.
Observed available RAM was about 2.5 GiB; swap use was zero. Studio itself
used about 326–362 MiB RSS, in addition to the separately measured worker.

The packaged APK manifest/launcher was validated with Google's AAPT2
9.5.0-16666295, and its v1 JAR signature with jarsigner. This checks its format;
it is not a full Android device compatibility result.

Final ISO boot and GUI checks are recorded separately in the release evidence
and release-0.6.json after the image is built. The embedded source record
describes the automated build-time checks. No unperformed hardware/game test
is counted as a Native pass.

Not certified: arbitrary/commercial Android APK compatibility, Unity graphics,
games, JNI_OnLoad, full framework/resources/services, long sessions, GPU
acceleration, physical RTX 5070 or other real hardware. Subway Surfers is a
Compatibility test input from 0.5 and is unsupported by Native 0.2. Its APK
is not included in the source, ISO or test evidence.
