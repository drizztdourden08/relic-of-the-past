<!-- @layer root-config @kind doc -->
# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately via GitHub's
[**Private vulnerability reporting**](https://github.com/drizztdourden08/relic-of-the-past/security/advisories/new)
("Security" tab → "Report a vulnerability"). Include:

- a description of the issue and its impact,
- steps to reproduce, and
- affected version/platform.

You can expect an acknowledgement within a reasonable timeframe. Once a fix is available, we'll
coordinate disclosure.

## Scope

This is a desktop Electron app that talks to USB/HID controllers, reads user-provided ROM files, and
runs a WebAssembly game core. Areas of particular interest:

- Electron main ↔ renderer IPC and the preload bridge
- File-system access (ROM loading, profiles, saves, config)
- USB/HID device handling

## Out of scope

- The vendored upstream decompilation under `core/zelda3/` (report those upstream).
- Anything requiring the user to supply a malicious ROM they obtained themselves. The app ships no
  game data, and it validates ROM checksums on load.
