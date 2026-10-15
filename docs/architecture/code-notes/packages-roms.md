<!-- @layer docs @kind doc -->
# Code notes: packages/roms

Facts about `packages/roms` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/roms/src/archive/archive-write.ts

- Entries are stored without compression (STORE) by default. Gigabytes of Opus or raw PCM do not deflate, so compressing costs minutes and saves nothing. Text entries such as a manifest pass `store: false` and get DEFLATE.
- Entries keep their given order and one fixed timestamp. Two exports of the same pack are byte-identical, and a reader can sniff the first entry (a manifest, when it is put first).
- `ZIP_FIXED_DATE` is 1980-01-01, the earliest instant a ZIP timestamp can hold. Any fixed date would do.
- `createFolders` is off because folder entries would be written ahead of their contents and break the first-entry sniffing.
- Entry names use forward slashes for folders, as the ZIP format expects.

## packages/roms/src/archive/is-zip.ts

- Only the two bytes `PK` (0x50 0x4b) are checked. That covers a normal archive (`PK\x03\x04`) and an empty one (`PK\x05\x06`).

## packages/roms/src/assets/check.ts

- A missing base means extract. A supplement ROM with no sidecar yet also means extract, which is what makes importing the second cartridge later rebuild the blob on its own.

## packages/roms/src/assets/index.ts

- The base blob and each supplement are stored as separate files and joined into one buffer only when loading. The engine wants one buffer with the supplement appended, but storing it that way would let a base-only rebuild silently delete the supplement. Separate files with separate lifetimes mean a rebuild cannot erase the other half.
- The compile itself runs in a renderer Worker (Node-Buffer pipeline). This folder only does the FileStore I/O.

## packages/roms/src/assets/remove-sidecar.ts

- Used when the source ROM of a sidecar is gone, so a stale supplement never outlives its cartridge.

## packages/roms/src/kinds/index.ts

- A base ROM boots the game; a supplement only adds to one. Explicit kinds replaced scanning the ROM folder for the first `.gba` file, where a stray or wrong-revision file was adopted and then failed deep inside the asset compile.
- `label` is neutral: the cartridge's own title is data, never a UI literal.
- `pickExtensions` carry no leading dots.
- An empty `accepts` list means no digest gate. The base cartridge is validated by the extractor's own multi-region SHA-1 profiles, so hashing it here would reject the regional ROMs the pipeline supports.

## packages/roms/src/library/index.ts

- Every import names its kind, and kind and digest are settled at import, where the user can still be told which file was refused and why.
- `ROM_PICK_EXTENSIONS` serves call sites that only ever meant the base cartridge.
- Deleting a base cartridge takes its blob, its sidecars and its profiles with it. Deleting a supplement drops only the sidecars it produced; the base game is untouched, which is the point of the two being separate files.
- An import never overwrites: an existing destination is reported as `alreadyExists` and the bytes on disk stay as they are.
