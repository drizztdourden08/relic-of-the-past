/* @layer shared-storage @kind logic */
/**
 * Reading language sets. Every entry point migrates a legacy folder first, so
 * a caller never sees the old layout, and the content half is upgraded to the
 * current set format on the way past (see ./format-2).
 */
import type { FileStore } from '@shared/platform';
import type { DialogueEntry, LanguageSet, LanguageSetMeta, TextOverrides } from '@shared/game/language';
import { readJson } from '../json';
import { readContent } from './format-2';
import { migrateLegacySet } from './migrate';
import { dialoguePath, fontPath, fontWidthPath, setMetaPath, textPath } from './paths';
import type { LanguageSetSummary, SetFontBytes } from './types';

/**
 * Identity only. Picked field by field so the format bookkeeping the header
 * also carries stays in the storage layer instead of riding along on every set
 * a caller holds.
 */
const readSetMeta = async (files: FileStore, id: string): Promise<LanguageSetMeta | null> => {
  const raw = await readJson<LanguageSetMeta | null>(files, setMetaPath(id), null);
  if (!raw) return null;
  const { name, base, origin, version, author } = raw;
  return { id: raw.id, name, base, origin, version, author };
};

const readDialogue = (files: FileStore, id: string): Promise<DialogueEntry[]> =>
  readJson<DialogueEntry[]>(files, dialoguePath(id), []);

/**
 * Overrides only, so a folder written before this file existed reads as an
 * empty object — which is exactly "nothing translated yet". The catalog, not
 * this payload, decides which slots the editor shows.
 */
const readText = (files: FileStore, id: string): Promise<TextOverrides> =>
  readJson<TextOverrides>(files, textPath(id), {});

const getSet = async (files: FileStore, id: string): Promise<LanguageSet | null> => {
  if (!await migrateLegacySet(files, id)) return null;
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  return {
    ...meta,
    dialogue: await readDialogue(files, id),
    text: await readText(files, id),
    ...await readContent(files, id),
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
