/* @layer renderer-lib @kind logic */
/**
 * Renderer languages store: list/get over FileStore; extract via the worker then
 * recompile all asset blobs (baking in the new pack). Mirrors window.api names.
 */
import type { LanguageSummary, LanguagePack } from '@shared/types/language';
import type { LanguageSet } from '@shared/game/language';
import * as languages from '@shared/storage/languages';
import type { ExtractedPack, LanguageSetSummary, NewSetParams, SetFontBytes } from '@shared/storage/languages';
import { fetchToBytes } from '@shared/storage/download';
import { isZip, unzip } from '@shared/storage/archive';
import { getPlatform } from '@app/platform/get-platform';
import { runOnWorker } from './extraction-client';
import { recompileAll } from './assets-store';
import { publishImportProgress } from './import-progress-bus';

const files = () => getPlatform().files;
const ROM_RE = /\.(sfc|smc)$/i;
type Result = { success: boolean; error?: string };

const emit = (phase: 'download' | 'decode' | 'extract' | 'done' | 'error', loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'language', id: 'language', phase, loaded, total, message });

const resolveRomBytes = async (bytes: Uint8Array): Promise<Uint8Array> => {
  if (!isZip(bytes)) return bytes;
  const roms = (await unzip(bytes)).filter((e) => ROM_RE.test(e.name));
  if (roms.length === 0) throw new Error('No ROM file (.sfc/.smc) found in the source');
  if (roms.length > 1) throw new Error(`Multiple ROM files found (${roms.length}). Provide exactly one ROM.`);
  return roms[0].bytes;
};

const extractFromBytes = async (romBytes: Uint8Array, code: string): Promise<Result> => {
  try {
    emit('decode', undefined, undefined, 'Decoding dialogue…');
    const pack = await runOnWorker<ExtractedPack>({ op: 'language', romBytes, code });
    await languages.writePack(files(), pack);
    emit('extract', undefined, undefined, 'Baking into assets…');
    await recompileAll();
    emit('done');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    emit('error', undefined, undefined, msg);
    return { success: false, error: msg };
  }
};

const listLanguages = (): Promise<LanguageSummary[]> => languages.listPacks(files());
const getLanguage = (code: string): Promise<LanguagePack | null> => languages.getLanguage(files(), code);

const extractLanguage = async (romFile: string, code: string): Promise<Result> => {
  const romBytes = await files().readBytes(`roms/${romFile}`);
  if (!romBytes) return { success: false, error: `ROM not found: ${romFile}` };
  return extractFromBytes(romBytes, code);
};

const extractLanguageFromFile = async (file: File, code: string): Promise<Result> => {
  try { return await extractFromBytes(await resolveRomBytes(new Uint8Array(await file.arrayBuffer())), code); }
  catch (err) { const msg = err instanceof Error ? err.message : String(err); emit('error', undefined, undefined, msg); return { success: false, error: msg }; }
};

const extractLanguageFromUrl = async (url: string, code: string): Promise<Result> => {
  try {
    const bytes = await fetchToBytes(url, (loaded, total) => emit('download', loaded, total ?? undefined));
    return await extractFromBytes(await resolveRomBytes(bytes), code);
  } catch (err) { const msg = err instanceof Error ? err.message : String(err); emit('error', undefined, undefined, msg); return { success: false, error: msg }; }
};

const deleteLanguage = async (code: string): Promise<void> => { await languages.remove(files(), code); await recompileAll(); };

const getLanguageSet = (id: string): Promise<LanguageSet | null> => languages.getSet(files(), id);

// A whole-set overwrite, then a rebake so the edit reaches the blob the core
// reads at boot — expensive, so callers debounce rather than save per keystroke.
const saveLanguageSet = async (set: LanguageSet): Promise<void> => {
  await languages.saveSet(files(), set);
  await recompileAll();
};

const listLanguageSets = (): Promise<LanguageSetSummary[]> => languages.list(files());

// The set's glyph tiles plus its per-glyph advance table. A read-only lookup —
// nothing here rebakes, so a preview can ask for it freely.
const getLanguageSetFont = (id: string): Promise<SetFontBytes | null> => languages.getSetFont(files(), id);

// Creating and duplicating both add a set the core can select, so both rebake.
const createLanguageSet = async (params: NewSetParams): Promise<LanguageSet> => {
  const created = await languages.createSet(files(), params);
  await recompileAll();
  return created;
};

const duplicateLanguageSet = async (sourceId: string, id: string, name: string): Promise<LanguageSet> => {
  const created = await languages.duplicateSet(files(), sourceId, id, name);
  await recompileAll();
  return created;
};

export { listLanguages, getLanguage, extractLanguage, extractLanguageFromFile, extractLanguageFromUrl, deleteLanguage };
export { getLanguageSet, saveLanguageSet, listLanguageSets, createLanguageSet, duplicateLanguageSet };
export { getLanguageSetFont };
