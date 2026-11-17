# KYVEX 0.5 / Rift 0.1 validation — 2026-11-03

Rift implements milestone M0 of the supplied Android platform plan. Its Rust
core, APK inspector, input scheduler, local service, SQLite library and Qt Studio
are original KYVEX source. Real Android execution uses Waydroid; optional ARM
translation uses the separately downloaded, pinned libndk R125 build.

## Automated checks

- 14 Rust tests passed: bounded APK/AXML parsing, hostile identifiers, overlapping
  string-pool allocation budget, limited DEX arithmetic/fuel, multitouch,
  joystick diagonals, swipe completion, watchdog, protocol layout and compatible
  profile defaults/ABI validation.
- 45 Python tests passed, including Live detection, privileged argument bounds,
  ADB public-key format, Live storage preservation and bridge behavior.
  Staging tests also verify that Windows filesystem modes cannot make system
  configuration writable, scripts remain executable, destination symlinks are
  not followed and existing private directories retain their permissions.
- 12 Node tests passed for the existing Control Center / privileged integration.
- Real-daemon integration passed against the supplied Subway APK: metadata,
  SHA256 snapshot, library persistence, profile round trip, malformed APKs,
  multiple pointers, release, lost-client watchdog and DEX self-test (42).
- Native Qt Studio remained open in a software-rendered test display without
  QML/resource errors. The existing Control Center UI smoke test also passed.

## Live validation

UEFI USB boot was exercised in a disposable KVM/QEMU machine with 24 GiB RAM,
8 vCPUs and a software-rendered virtual display. No physical or writable disk
was attached. Android initialization, ARM installation and local-key approval
were exercised from the desktop. Android runs in temporary RAM storage.

Testing found and fixed these actual integration failures:

- Android's nested overlay failed on the Archiso overlay root, disabling the
  ARM libraries. A dedicated tmpfs at /var/lib/waydroid now gives Android a
  compatible upper/work filesystem. Android sees libndk inside /system.
- A frozen background container blocked direct ADB commands. Rift restores the
  Android view before connecting to a frozen instance.
- An asynchronous APK install exposed a package before dexopt/unfreezing had
  completed. Rift now uses the authenticated PackageInstaller completion result.
- Duplicate launch intents were removed; a launch starts the parsed activity
  once. Background bridge failures return to Studio without a hidden dialog.

The final per-user daemon was loaded into the Live test session. The opt-in
Android smoke test passed with ro.adb.secure=1: Android's own input dispatcher
reported two simultaneous pointers, and release cleared Rift's contacts. This
test uses Android Home as a known target and restores pointer debugging settings.
Running it concurrently with APK installation is not a valid test scenario.

The Qt editor was tested using actual mouse dragging in Live: coordinates were
saved through IPC, and Undo restored the original coordinates. An independent
Qt touch window also received simultaneous W + Space from the virtual keyboard.

## APK compatibility observations

| APK / mode | Status | Observed behavior |
| --- | --- | --- |
| Subway Surfers 3.71.0, ARM32 | Working for the tested smoke scenario | Import, synchronous install, initial setup, menu and a short playable run; Rift supplied tap and arrow-key swipe events. No account, purchase, advertisement or long-session validation. |
| Subway Surfers 3.71.0, ARM64 | Partial | Metadata and installation tested; a complete ARM64 gameplay run was not verified. Use armeabi-v7a in the per-app architecture selector for the tested path. |
| VLC 3.6.5, ARM32 | Partial | Imported and launched through Rift into the native Android onboarding UI. Media playback was not retested in this release. |
| VLC 3.6.5, ARM64 | Partial | Imported and launched through Rift into the main Android UI; Android reports arm64-v8a. Media playback was not retested in this release. |
| Real APKs on Rift Native | Unsupported | The original interpreter only runs bounded DEX integer instruction tests. It does not implement Android Framework, JNI, Bionic or an ARM JIT. |

Subway input SHA256:
`a62070172463efcffd7472543e1358e69b6530492c9101741cef32c3ba249bb2`.
Package com.kiloo.subwaysurf; 270,605,830 bytes; ARM32 + ARM64; 9 DEX files;
491,474 declared DEX methods; 38 native libraries. User APKs are not redistributed.

## Limits and reproducibility

Tests used a virtual software GPU, not physical AMD, Intel or NVIDIA hardware.
No FPS, input latency or performance improvement is claimed. SwiftShader is a
compatibility renderer, not evidence of gaming acceleration. One upstream
Android SystemUI startup exception recovered during initialization; this alpha
does not claim that upstream Android is free of errors.

The release includes curated screenshots/logs and locked Rust dependencies.
Final ISO digest, size and cold-boot check are recorded in release-0.5.json and
SHA256SUMS-0.5 beside the ISO. Prior 0.4 installation/Windows tests remain in
their original release; they are not presented as newly repeated 0.5 tests.

Full native Android runtime/JIT, arbitrary macros, gamepads, unrestricted mouse
capture, complete resource icons, split APK/XAPK and broad app certification
remain future milestones. English is the Studio default; its Ukrainian switch
currently translates the main navigation and selected labels.
