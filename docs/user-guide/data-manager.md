<!-- @layer docs @kind doc -->
# Data Manager

The central place to manage everything that isn't a save: profiles, ROMs, sprites, languages, and
music. Open it from the title bar → **Data**.

## Tabs

### Profiles
List, create, select, and delete [profiles](profiles.md). Creating one binds a ROM, a language, and an
optional MSU-1 pack.

### ROMs
Import a ROM from a file or URL, view its info (filename, size, hash, timestamps), trigger
[asset extraction](../getting-started/importing-a-rom.md), and delete ROMs. Extraction status is shown
per ROM.

### Sprites
Per-ROM sprite extraction and management — extract/cache sprite PNGs, review individual sprites, and
inspect item-to-sprite mapping. See [Sprite Tools](sprite-tools.md).

### Languages
Extract translations from a ROM (or a file/URL) and manage language packs (English, French, …). The
selected language drives in-game dialogue.

### MSU (music)
Import [MSU-1](audio-msu.md) music packs from a file or URL, browse the track listing, see file
count/size, and delete packs. Attach a pack to a profile to replace the SPC soundtrack.

## Where it lives

Each tab is backed by an Electron IPC domain (`roms`, `assets`, `sprites`, `languages`, `msu`,
`profiles`) — the renderer never touches the filesystem directly. See
[Electron & IPC](../architecture/electron-ipc.md).
