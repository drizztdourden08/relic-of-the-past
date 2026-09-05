/* @layer shared-storage @kind logic */
/**
 * On-disk layout of one language set, under the FileStore's `languages/<id>/`:
 *
 *   set.json         LanguageSetMeta (identity + provenance) + format/structure
 *   dialogue.json    DialogueEntry[]
 *   text.json        TextOverrides (non-dialogue strings the translator retyped)
 *   variables.json   Variable[]  (format 2 onward)
 *   glossary.json    GlossaryTerm[]  (format 1 only)
 *   names.json       NameTable  (format 1 only)
 *   font.bin         raw 2bpp glyph sheet
 *   font-width.bin   per-glyph width table
 *
 * `text.json` holds overrides only, so a folder without it reads as "nothing translated".
 * The format-1 payloads are read when `set.json` carries no `format` and never written or
 * deleted after that; the header's `format` is the only discriminator. The two legacy files a
 * ROM extraction leaves (`dialogue.txt`, `meta.json`) are named here too for the migration
 * and the compatibility reader.
 */

const setDir = (id: string): string => `languages/${id}`;

const setMetaPath = (id: string): string => `${setDir(id)}/set.json`;
const dialoguePath = (id: string): string => `${setDir(id)}/dialogue.json`;
const textPath = (id: string): string => `${setDir(id)}/text.json`;
const variablesPath = (id: string): string => `${setDir(id)}/variables.json`;
const glossaryPath = (id: string): string => `${setDir(id)}/glossary.json`;
const namesPath = (id: string): string => `${setDir(id)}/names.json`;
const fontPath = (id: string): string => `${setDir(id)}/font.bin`;
const fontWidthPath = (id: string): string => `${setDir(id)}/font-width.bin`;

const legacyDialoguePath = (id: string): string => `${setDir(id)}/dialogue.txt`;
const legacyMetaPath = (id: string): string => `${setDir(id)}/meta.json`;

export {
  setDir, setMetaPath, dialoguePath, textPath, variablesPath, glossaryPath, namesPath, fontPath,
  fontWidthPath, legacyDialoguePath, legacyMetaPath,
};
