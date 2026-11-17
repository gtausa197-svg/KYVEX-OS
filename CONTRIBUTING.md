# Contributing to KYVEX OS

Thanks for helping improve this experimental Linux distribution.

## Before sending changes

1. Read the [architecture](docs/ARCHITECTURE.md) and [known limitations](docs/KNOWN-LIMITATIONS.md).
2. Open an issue describing the user impact, reproduction steps, hardware details and expected behavior. Avoid posting sensitive logs.
3. Keep changes scoped to a single component (`archiso`, `desktop`, `installer`, `rift`, docs or tests).
4. For security issues, **do not post public exploit details**. Use the process in [SECURITY.md](SECURITY.md).

## Guidelines

- Preserve upstream license headers and accurately credit DuoDesk/TwinDesk/Dynarmic and any other reused code.
- Keep scripts defensive around privileged operations. A change touching disk layouts, encryption or boot scripts must include rollback/recovery notes and testing details.
- Do not include copyrighted games/APKs, private keys, credentials, giant build caches or unverified external binary downloads.
- Include a clear before/after validation log or screenshots when changing graphics or installer UI.
- Never label a test as passed if you have not run it.
- Prefer small, readable commits and describe hardware, OS/kernel and test scope in your pull request.

## Development checks

```bash
python3 tools/check_repository.py
```

This checks documentation assets only. There are additional tests under `tests/` and `rift/`; run the appropriate component tests in their intended build environments.
