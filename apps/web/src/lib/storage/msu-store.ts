/* @layer renderer-lib @kind logic */
/**
 * Renderer MSU store over FileStore + import (pick/download → zip/raw → install).
 * Mirrors the window.api MSU surface (readMsuTrackFile returns ArrayBuffer).
 */
import * as msu from '@shared/storage/msu';
import { fetchToBytes } from '@shared/storage/download';
import { isZip, unzip } from '@shared/storage/archive';
import { getPlatform } from '@app/platform/get-platform';
import { publishImportProgress } from './import-progress-bus';

const files = () => getPlatform().files;
const MSU_RE = /\.(pcm|opuz|msu)$/i;
type MsuResult = { success: boolean; fileCount?: number; error?: string };

const emit = (phase: 'download' | 'copy' | 'done' | 'error', loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'msu', id: 'msu', phase, loaded, total, message });

const resolveTracks = async (bytes: Uint8Array, name: string): Promise<{ name: string; bytes: Uint8Array }[]> => {
  if (isZip(bytes)) return (await unzip(bytes)).filter((e) => MSU_RE.test(e.name));
  return MSU_RE.test(name) ? [{ name, bytes }] : [];
};

const install = async (pack: string, tracks: { name: string; bytes: Uint8Array }[]): Promise<MsuResult> => {
  if (tracks.length === 0) {
    const error = 'No audio tracks (.pcm/.opuz/.msu) found in the source. This may be a patch file, not an MSU audio pack.';
    emit('error', undefined, undefined, error);
    return { success: false, error };
  }
  let copied = 0;
  for (const t of tracks) { await files().writeBytes(`msu/${pack}/${t.name}`, t.bytes); copied += 1; emit('copy', copied, tracks.length); }
  emit('done');
  return { success: true, fileCount: tracks.length };
};

const nameFromUrl = (url: string): string => {
  try { return new URL(url).pathname.split('/').pop() || 'pack.zip'; } catch { return 'pack.zip'; }
};

const listMsuPacks = () => msu.listPacks(files());
const getMsuPackFiles = (pack: string) => msu.getPackFiles(files(), pack);
const getMsuTrackList = (pack: string) => msu.getTrackList(files(), pack);
const deleteMsuPack = (pack: string) => msu.deletePack(files(), pack);

const readMsuTrackFile = async (pack: string, fileName: string): Promise<ArrayBuffer> => {
  const bytes = await msu.readTrackFile(files(), pack, fileName);
  if (!bytes) throw new Error(`Track not found: ${fileName}`);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

const importMsuFile = async (pack: string, file: File): Promise<MsuResult> => {
  try { return await install(pack, await resolveTracks(new Uint8Array(await file.arrayBuffer()), file.name)); }
  catch (err) { const msg = err instanceof Error ? err.message : String(err); emit('error', undefined, undefined, msg); return { success: false, error: msg }; }
};

const importMsu = async (pack: string, url: string): Promise<MsuResult> => {
  try {
    const bytes = await fetchToBytes(url, (loaded, total) => emit('download', loaded, total ?? undefined));
    return await install(pack, await resolveTracks(bytes, nameFromUrl(url)));
  } catch (err) { const msg = err instanceof Error ? err.message : String(err); emit('error', undefined, undefined, msg); return { success: false, error: msg }; }
};

export { listMsuPacks, getMsuPackFiles, getMsuTrackList, deleteMsuPack, readMsuTrackFile, importMsuFile, importMsu };
