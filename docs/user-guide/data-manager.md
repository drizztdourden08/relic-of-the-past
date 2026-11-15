<!-- @layer docs @kind doc -->
# Data Manager

One place to manage everything that isn't a save: profiles, ROMs, sprites, languages, and music. Open
it from the title bar with **Data**.

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

#### Importing a fan translation

A fan translation is a patch applied to one of the official releases. To bring one in, open
**Import patched ROM** in the Languages tab and fill in:

- **Name**: the name of the new set. Its id is made from the name, and a name already in use is refused.
- **Based on**: the release the patch was made for. US English is the default.
- **Credits**: optional, who made the translation.
- **ROM file**: the patched ROM, as `.sfc`, `.smc` or a `.zip` holding one. The ROM is read, never saved.

The import reads the dialogue, the font pictures, the letter widths, the dictionary, the menu and caption
text and the credits one by one. A report then lists each part as Ok, Recovered (found at a new place
or rebuilt) or Failed, with the reason. The set is saved when the dialogue and the font are read; otherwise
nothing is saved and the report says what went wrong.

Letters the patch adds to the font are kept. When the import cannot tell which letter a new picture is, it
names it with a placeholder such as `[Glyph4F]` and lists it in the report. The placeholder works like any other letter in
the editor. Keeping the original release in your ROM library helps the import recognise moved or redrawn
parts, but it is not required.

### MSU Studio

Import [MSU-1](audio-msu.md) music packs from a file or URL, then build and edit them: every music slot,
the ambient beds and both effect channels, each with layers you can shape. Manage the pack's audio files
and convert them to one format. Attach a pack to a profile to replace the original soundtrack.

## Where it lives

Each tab is backed by an Electron IPC domain: `roms`, `assets`, `sprites`, `languages`, `msu`, and
`profiles`. The renderer never touches the filesystem directly. See
[Electron & IPC](../architecture/electron-ipc.md).
