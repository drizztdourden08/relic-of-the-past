<!-- @layer docs @kind doc -->
# Code notes: packages/packs

Facts about `packages/packs` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/packs/src/duplicate/duplicate-language.ts

- Rebaking the asset blob after a duplicate is the host's step, the same as after an install.

## packages/packs/src/duplicate/duplicate-msu.ts

- A pack with no manifest gets the synthesized one the player already plays it with.
- The manifest is written last, so a copy that stops part way reads as a classic pack, never a broken layered one.

## packages/packs/src/duplicate/duplicate-sprite.ts

- Only the manifest entry changes. The tiles and the preview go across as they are, so no canvas is needed and this runs on any host.

## packages/packs/src/duplicate/duplicate.type.ts

- A duplicate copies an installed item to a free new name, stamps `basedOn` into the copy's own metadata, and writes nothing into the original.

## packages/packs/src/link-sprites/link-sprites/index.ts

- The custom player sprite library is one global, profile-independent folder, `link-sprites/`, under the Data root. A profile's `linkSprite` setting selects one file by name, and the renderer stages the chosen file for the core at boot.
- Two containers live side by side: `.zspr`, which other tools produce, and `.rsp`, ours.
- File names become path segments, so every name from outside passes through `safeFileName` before it is joined. `writeLinkSprite` writes under the name as given, so callers pass a name that went through it.
- `freeSpriteName` adds a numbered suffix until the name is free, so nothing is overwritten.

## packages/packs/src/link-sprites/parse-rsp/index.ts

- The write side, which renders the courtesy PNG, stays in the renderer (`packages/packs/src/rsp`). Reading needs no canvas, so it lives here for every host: the renderer, Electron main and the store.
- The ZIP local file header check is cheap enough to run before handing bytes to JSZip.

## packages/packs/src/rsp/

- Writes a Relic Sprite Pack. Reading one lives in packages/packs/src/link-sprites/parse-rsp.
- It is a zip, so the contents stay inspectable with ordinary tools and the format can grow an entry without breaking readers that ignore it.
- The tiles go in raw, not as a PNG: the sheet is 4bpp indexed data, and a PNG round trip would mean deriving indices from colours again. A PNG is written alongside only so the file previews in an image viewer; it is never read back.
- `withPreview: false` skips that courtesy PNG. It costs a render, which a boot time flatten does not want.

## packages/packs/src/sprite-apply/sprite-rom.ts

With no active profile (a first run, a missing pinned profile, the profile creation form), a
ROM that is ready to play stands in, so views that draw item art do not show placeholders
over a set that is on disk.

## packages/packs/src/sprite-manifest-digest/index.ts

- The renderer (over its FileStore) and the main process (`apps/desktop/electron/sprites/extraction-state`, over fs) both ask whether a ROM's sprites are complete and have to agree, so the expected file list and the fingerprint are defined once here.
- The fingerprint is FNV-1a, not a real hash. This code runs in the renderer, the mobile host and Node, so `node:crypto` is not available, and nothing here is adversarial.
- The file count is carried next to the hash, so a 32-bit collision would also have to land on the same number of sprites to go unnoticed.
- The names are sorted before hashing, so a reordered manifest is the same manifest.

## packages/packs/src/sprites/index.ts

- Layout: `sprites/<romStem>/*.png`, the in-game binaries beside them, and the debug and review JSON at the Data root.
- `check` measures the folder against the manifest, not a file count. Counting kept a folder extracted before a sprite joined the manifest complete forever, so the new picture never appeared and the HUD drew a broken image.
- A finished extraction leaves a receipt naming the manifest digest it ran against. A receipt for the current manifest is taken at its word, so a definition the ROM cannot satisfy does not trigger a re-extract on every launch. Adding, renaming or removing a definition changes the digest, and the folder is then compared name by name. A folder with no receipt falls straight to that comparison.
- An empty or absent folder is never complete, receipt or not.
- The receipt's `count` is diagnostic only, never a gate.
- `writeSprites` clears the stale set first and writes the receipt after the files, so a failed write never leaves a receipt claiming a finished run.
- The in-game binary readers return null when the set predates that binary. The stamp reader returns null before the set carried a stamp.
- `isStale`: a set holding none of the expected files is not stale; that is the never-extracted case, which the caller answers by extracting. A set is stale when an expected file is absent while others are there, or the stamp is missing or names another version (the definitions, a drawing or the decoders changed).

## packages/packs/src/store/install/install-rsp.ts

- A character sprite is one `.rsp` file in the sprite library, under a name no other file has, so a store install never replaces a sprite the player made. Uninstall removes that one file.
- `settleName` moves the file to the sprite's own name once that name is free, after an update.

## packages/packs/src/store/install/select-installer.ts

- Callers never branch on the container themselves; they ask for the installer.

## packages/packs/src/zspr-write/zspr-write.ts

- Serializes a PlayerSheet back to ZSPR, for the studio's export and for the boot path (the core only reads ZSPR). The override layer is folded onto the original: the file carries one palette, so whichever layer the caller asks for is the one that survives. `layer: 'override'` (the default) bakes the edits; `'original'` writes the palette as imported.
- The display name and the author are NUL terminated UTF-16LE; the third string, a short credit line, is NUL terminated ASCII.
- The spec's checksum is a 16 bit sum of every byte, followed by `0xFFFF - sum`. The four checksum bytes are summed as the seed value `FF FF 00 00`, not zero, which reproduces other tools' output byte for byte. Nothing here validates it.

## packages/packs/src/zspr/parse-zspr.ts

- Reads ZSPR, the community custom sprite container, into a PlayerSheet.
- Header, 29 bytes: "ZSPR", a version byte, a four byte checksum, then (offset, length) for the tile block and for the palette block, a sprite type word, and six reserved bytes. ZSPR_HEADER names those offsets.
- Three strings follow, in this order: the display name and the author as NUL terminated UTF-16LE, then the author again as NUL terminated ASCII for a short in game credit. The two data blocks sit wherever the header's offsets point, in practice just past those strings.
- The palette block is four outfits of 15 words followed by two glove words. A sheet may ship tiles only; that parses as long as a stock palette is supplied to stand in, which mirrors PlayerSprite_Apply keeping the player on the stock row for a short block.
- `parseZspr` returns a sheet with an empty override layer, or null when the bytes are not a ZSPR.
