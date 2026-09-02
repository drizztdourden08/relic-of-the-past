/* @layer renderer-lib @kind logic */
/**
 * Renderer MSU store over FileStore + import (pick/download → zip/raw → install).
 * Mirrors the window.api MSU surface (readMsuTrackFile returns ArrayBuffer).
 */
import type { MsuPackManifest, MsuPackMeta, MsuResumeState } from '@shared/types/msu-manifest';
import type { SaveKind } from '@shared/storage/save-paths';
import * as msu from '@shared/storage/msu';
import * as resume from '@shared/storage/msu-resume';
import { fetchToBytes } from '@shared/storage/download';
import { isZip, unzip } from '@shared/storage/archive';
import { getPlatform } from '@app/platform/get-platform';
import { publishImportProgress } from './import-progress-bus';
import { probeAudioFile } from './audio-probe';
// The one shape, so the renderer cannot quietly fall behind what an import actually reports.
import type { MsuResult } from '@shared/ipc/msu-contract';

const files = () => getPlatform().files;
const MSU_RE = /\.(pcm|opuz|msu)$/i;

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
const listMsuAudioFiles = (pack: string) => msu.listAudioFiles(files(), pack);
/** Every file in the pack folder, audio or not, the manifest excepted — what an export stores. */
const listMsuPackEntries = (pack: string) => msu.listPackEntries(files(), pack);
// Passed unconditionally: the probe answers null when no decoder is installed, so the
// encoded rows simply stay unfilled rather than the caller branching on availability.
const getMsuFileMetadata = (pack: string) => msu.packFileMetadata(files(), pack, probeAudioFile);
const readMsuLoopSample = (pack: string, fileName: string) => msu.readMsu1LoopSample(files(), pack, fileName);
const deleteMsuPack = (pack: string) => msu.deletePack(files(), pack);

// ── Pack editing (.msul manifest + per-file operations) ──
const readMsuManifest = (pack: string) => msu.readManifest(files(), pack);
const writeMsuManifest = (pack: string, manifest: MsuPackManifest) => msu.writeManifest(files(), pack, manifest);
const createMsuPack = (pack: string, meta?: Partial<MsuPackMeta>) => msu.createPack(files(), pack, meta);
const renameMsuPack = (from: string, to: string) => msu.renamePack(files(), from, to);
const renameMsuTrackFile = (pack: string, from: string, to: string) => msu.renameTrackFile(files(), pack, from, to);
const deleteMsuTrackFile = (pack: string, fileName: string) => msu.deleteTrackFile(files(), pack, fileName);
const writeMsuTrackFile = (pack: string, fileName: string, data: ArrayBuffer) =>
  msu.writeTrackFile(files(), pack, fileName, new Uint8Array(data));

// ── Per-save music-resume sidecars ──
const writeMsuResume = (profile: string, kind: SaveKind, id: string | number, state: MsuResumeState) =>
  resume.writeMsuResume(files(), profile, kind, id, state);
const readMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  resume.readMsuResume(files(), profile, kind, id);
const deleteMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  resume.deleteMsuResume(files(), profile, kind, id);

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

export {
  listMsuPacks, getMsuPackFiles, getMsuTrackList, listMsuAudioFiles, listMsuPackEntries, getMsuFileMetadata,
  readMsuLoopSample, deleteMsuPack, readMsuTrackFile,
  importMsuFile, importMsu,
  readMsuManifest, writeMsuManifest, createMsuPack, renameMsuPack, renameMsuTrackFile, deleteMsuTrackFile,
  writeMsuTrackFile,
  writeMsuResume, readMsuResume, deleteMsuResume,
};
