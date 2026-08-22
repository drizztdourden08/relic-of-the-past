/* @layer shared-storage @kind logic */
/**
 * The legacy `LanguagePack` view of a folder — the raw extraction payload
 * (`dialogue.txt` + `meta.json` + `font.bin`). Two things still need it: the
 * read-only inspector UI, and the asset recompile, which reads those same
 * files. So an extraction keeps writing them next to the new set files, and
 * `readPack` keeps serving them unchanged.
 */
import type { FileStore } from '@shared/platform';
import type { LanguageMeta, LanguagePack, LanguageSummary } from '@shared/types/language';
import { parseDialogueText } from '@shared/asset-extraction/text/parse-dialogue-text';
import { readJson } from '../json';
import { fontPath, legacyDialoguePath, legacyMetaPath } from './paths';
import type { ExtractedPack } from './types';

const readLegacyMeta = (files: FileStore, id: string): Promise<LanguageMeta | null> =>
  readJson<LanguageMeta | null>(files, legacyMetaPath(id), null);

const readPack = async (files: FileStore, id: string): Promise<LanguagePack | null> => {
  const meta = await readLegacyMeta(files, id);
  if (!meta) return null;
  const text = await files.readText(legacyDialoguePath(id));
  const font = await files.readBytes(fontPath(id));
  if (text == null || !font) return null;
  return { meta, lines: parseDialogueText(text), font: { tiles: Array.from(font), glyphCount: meta.glyphCount } };
};

/** Folders that still carry a readable extraction payload, as inspector rows. */
const listPacks = async (files: FileStore): Promise<LanguageSummary[]> => {
  const out: LanguageSummary[] = [];
  for (const id of await files.list('languages')) {
    const meta = await readLegacyMeta(files, id);
    if (meta) out.push({ code: meta.code, glyphCount: meta.glyphCount, lineCount: meta.lineCount });
  }
  return out;
};

const metaFromExtracted = (pack: ExtractedPack): LanguageMeta => ({
  code: pack.code, glyphCount: pack.glyphCount, lineCount: pack.lineCount,
  encoder: pack.encoder, flags: pack.flags, source: pack.description,
});

/** The in-memory pack an extraction just produced, in the legacy shape. */
const packFromExtracted = (pack: ExtractedPack): LanguagePack => ({
  meta: metaFromExtracted(pack),
  lines: parseDialogueText(pack.dialogue),
  font: { tiles: Array.from(pack.fontData), glyphCount: pack.glyphCount },
});

/** Write the legacy payload of a fresh extraction (text + font pair + meta). */
const writeLegacyPayload = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  await files.writeText(legacyDialoguePath(pack.code), pack.dialogue);
  await files.writeText(legacyMetaPath(pack.code), JSON.stringify(metaFromExtracted(pack), null, 2));
};

export { listPacks, packFromExtracted, readPack, writeLegacyPayload };
