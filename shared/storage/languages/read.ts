/* @layer shared-storage @kind logic */
/**
 * Reading language sets. Every entry point migrates a legacy folder first, so
 * a caller never sees the old layout.
 */
import type { FileStore } from '@shared/platform';
import type { DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable } from '@shared/game/language';
import { emptyNameTable } from '@shared/game/language';
import { readJson } from '../json';
import { migrateLegacySet } from './migrate';
import { dialoguePath, fontPath, fontWidthPath, glossaryPath, namesPath, setMetaPath } from './paths';
import type { LanguageSetSummary, SetFontBytes } from './types';

const readSetMeta = (files: FileStore, id: string): Promise<LanguageSetMeta | null> =>
  readJson<LanguageSetMeta | null>(files, setMetaPath(id), null);

const readDialogue = (files: FileStore, id: string): Promise<DialogueEntry[]> =>
  readJson<DialogueEntry[]>(files, dialoguePath(id), []);

const getSet = async (files: FileStore, id: string): Promise<LanguageSet | null> => {
  if (!await migrateLegacySet(files, id)) return null;
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  return {
    ...meta,
    dialogue: await readDialogue(files, id),
    glossary: await readJson<GlossaryTerm[]>(files, glossaryPath(id), []),
    names: await readJson<NameTable>(files, namesPath(id), emptyNameTable()),
  };
};

const summaryOf = async (files: FileStore, id: string): Promise<LanguageSetSummary | null> => {
  if (!await migrateLegacySet(files, id)) return null;
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  const { name, base, origin } = meta;
  return { id: meta.id, name, base, origin, lineCount: (await readDialogue(files, id)).length };
};

const list = async (files: FileStore): Promise<LanguageSetSummary[]> => {
  const out: LanguageSetSummary[] = [];
  for (const id of await files.list('languages')) {
    const summary = await summaryOf(files, id);
    if (summary) out.push(summary);
  }
  return out;
};

/** The font pair a bake step needs alongside the set itself. */
const getSetFont = async (files: FileStore, id: string): Promise<SetFontBytes | null> => {
  const fontData = await files.readBytes(fontPath(id));
  const fontWidth = await files.readBytes(fontWidthPath(id));
  return fontData && fontWidth ? { fontData, fontWidth } : null;
};

export { getSet, getSetFont, list };
