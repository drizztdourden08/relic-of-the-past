<!-- @layer docs @kind doc -->
# Known Limitations

## Current Release

### Platform
- **macOS and Linux builds are untested** — builds are produced by CI but have not been verified on real hardware
- **No code signing** — all platforms will show "unknown publisher" or "unidentified developer" warnings on first launch

### Auto-Update
- **Private repo** — auto-update cannot access release assets without authentication. Will work once the repository is made public
- **Portable Windows build** — cannot auto-update (must download new versions manually)

### Game Engine
- The underlying zelda3 C port has its own set of known issues — these are inherited as-is
- WebAssembly performance depends on the browser engine embedded in Electron — generally runs at full speed on modern hardware

### Audio
- MSU packs must follow the community-standard track numbering — non-standard packs may have silent tracks
- No in-app MSU track preview — you need to be in-game to hear the music

### Input
- Some Bluetooth controller connections may not support rumble — try USB if haptics don't work
- DualShock 3 requires third-party drivers on Windows (DS4Windows or similar)
- Very old or obscure controllers may not be recognized by the Gamepad API

### Saves
- Save data is per-profile and cannot be exported/imported between profiles (planned for future)
- No cloud save synchronization

---

## Planned Improvements

- Randomizer support (item shuffling, logic tracking)
- Save import/export
- Cloud saves
- Code signing for Windows and macOS
- Public repository (unlocks auto-update and GitHub Wiki)
