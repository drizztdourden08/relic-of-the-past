<!-- @layer docs @kind doc -->
# Security

The canonical policy is the repo-root
[`SECURITY.md`](https://github.com/drizztdourden08/relic-of-the-past/blob/master/SECURITY.md). Summary:

## Reporting a vulnerability

**Do not open a public issue.** Report privately via GitHub's
[Private vulnerability reporting](https://github.com/drizztdourden08/relic-of-the-past/security/advisories/new)
(Security tab → "Report a vulnerability") with a description + impact, repro steps, and the affected
version/platform. You'll get an acknowledgement, and we'll coordinate disclosure once a fix is ready.

## Scope

A desktop Electron app that talks to USB/HID controllers, reads user-provided ROMs, and runs a WASM
game core. Of particular interest:

- Electron main ↔ renderer IPC and the preload bridge ([Electron & IPC](../architecture/electron-ipc.md)).
- Filesystem access — ROM loading, profiles, saves, config.
- USB/HID device handling.

## Out of scope

- The vendored upstream decompilation under `core/zelda3/` (report upstream).
- Anything requiring the user to supply a malicious ROM they obtained themselves — the app ships no
  game data and validates ROM checksums on load.
