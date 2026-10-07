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

/** The file names above, the one place each is spelled. */
const SET_FILES = {
  meta: 'set.json',
  dialogue: 'dialogue.json',
  text: 'text.json',
  variables: 'variables.json',
  glossary: 'glossary.json',
  names: 'names.json',
  font: 'font.bin',
  fontWidth: 'font-width.bin',
  legacyDialogue: 'dialogue.txt',
  legacyMeta: 'meta.json',
} as const;

const setDir = (id: string): string => `languages/${id}`;

const setFilePath = (id: string, name: string): string => `${setDir(id)}/${name}`;

const setMetaPath = (id: string): string => setFilePath(id, SET_FILES.meta);
const dialoguePath = (id: string): string => setFilePath(id, SET_FILES.dialogue);
const textPath = (id: string): string => setFilePath(id, SET_FILES.text);
const variablesPath = (id: string): string => setFilePath(id, SET_FILES.variables);
const glossaryPath = (id: string): string => setFilePath(id, SET_FILES.glossary);
const namesPath = (id: string): string => setFilePath(id, SET_FILES.names);
const fontPath = (id: string): string => setFilePath(id, SET_FILES.font);
const fontWidthPath = (id: string): string => setFilePath(id, SET_FILES.fontWidth);

const legacyDialoguePath = (id: string): string => setFilePath(id, SET_FILES.legacyDialogue);
const legacyMetaPath = (id: string): string => setFilePath(id, SET_FILES.legacyMeta);

export {
  SET_FILES, setDir, setFilePath, setMetaPath, dialoguePath, textPath, variablesPath, glossaryPath,
  namesPath, fontPath, fontWidthPath, legacyDialoguePath, legacyMetaPath,
};
