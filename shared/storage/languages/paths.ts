/* @layer shared-storage @kind logic */
/**
 * On-disk layout of one language set, under the FileStore's `languages/<id>/`:
 *
 *   set.json         LanguageSetMeta (identity + provenance)
 *   dialogue.json    DialogueEntry[]
 *   glossary.json    GlossaryTerm[]
 *   names.json       NameTable
 *   font.bin         raw 2bpp glyph sheet
 *   font-width.bin   per-glyph width table
 *
 * The two legacy files a ROM extraction also leaves behind (`dialogue.txt`,
 * `meta.json`) are named here too, since both the migration and the
 * compatibility reader still address them.
 */

const setDir = (id: string): string => `languages/${id}`;

const setMetaPath = (id: string): string => `${setDir(id)}/set.json`;
const dialoguePath = (id: string): string => `${setDir(id)}/dialogue.json`;
const glossaryPath = (id: string): string => `${setDir(id)}/glossary.json`;
const namesPath = (id: string): string => `${setDir(id)}/names.json`;
const fontPath = (id: string): string => `${setDir(id)}/font.bin`;
const fontWidthPath = (id: string): string => `${setDir(id)}/font-width.bin`;

const legacyDialoguePath = (id: string): string => `${setDir(id)}/dialogue.txt`;
const legacyMetaPath = (id: string): string => `${setDir(id)}/meta.json`;

export {
  setDir, setMetaPath, dialoguePath, glossaryPath, namesPath, fontPath, fontWidthPath,
  legacyDialoguePath, legacyMetaPath,
};
