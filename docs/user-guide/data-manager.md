<!-- @layer docs @kind doc -->
# Data Manager

One place to manage everything that isn't a save: profiles, ROMs, sprites, languages, and music. Open
it from the title bar → **Data**.

## Tabs

### Profiles
List, create, select, and delete [profiles](profiles.md). Creating one binds a ROM, a language, and an
optional MSU-1 pack.

### ROMs
Import a ROM from a file or URL, view its info such as filename, size, hash, and timestamps, run
[asset extraction](../getting-started/importing-a-rom.md), and delete ROMs. Extraction status is shown
per ROM.

### Sprites
Per-ROM sprite extraction and management. Extract and cache sprite PNGs, review individual sprites, and
inspect the item-to-sprite mapping. See [Sprite Tools](sprite-tools.md).

### Languages
Extract translations from a ROM, a file, or a URL and manage language packs such as English and French.
The selected language drives in-game dialogue.

### MSU Studio
Import [MSU-1](audio-msu.md) music packs from a file or URL, then build and edit them: every music slot,
the ambient beds and both effect channels, each with layers you can shape. Manage the pack's audio files
and convert them to one format. Attach a pack to a profile to replace the original soundtrack.

## Where it lives

Each tab is backed by an Electron IPC domain: `roms`, `assets`, `sprites`, `languages`, `msu`, and
`profiles`. The renderer never touches the filesystem directly. See
[Electron & IPC](../architecture/electron-ipc.md).
