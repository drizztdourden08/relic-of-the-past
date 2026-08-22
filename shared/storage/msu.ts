/* @layer shared-storage @kind logic */
/**
 * MSU audio-pack storage over FileStore (msu/<pack>/<track>.{pcm,opuz,msu}).
 * The editing half lives in ./msu-edit and is re-exported at the bottom, so this
 * module stays the one import site for the whole MSU storage surface.
 */
import type { FileStore } from '@shared/platform';
import { isAudioFile, packDir, packFile } from './msu-paths';

const isMsuFile = (name: string): boolean => /\.(pcm|opuz|msu)$/i.test(name);

const listPacks = async (files: FileStore): Promise<{ name: string; fileCount: number; totalSize: number }[]> => {
  const out: { name: string; fileCount: number; totalSize: number }[] = [];
  for (const name of await files.list('msu')) {
    const trackFiles = (await files.list(packDir(name))).filter(isMsuFile);
    let totalSize = 0;
    for (const f of trackFiles) { const st = await files.stat(`${packDir(name)}/${f}`); if (st) totalSize += st.bytes; }
    out.push({ name, fileCount: trackFiles.length, totalSize });
  }
  return out;
};

const getPackFiles = async (files: FileStore, pack: string): Promise<{ name: string; size: number }[]> => {
  const out: { name: string; size: number }[] = [];
  for (const f of (await files.list(packDir(pack))).filter(isMsuFile)) {
    const st = await files.stat(`${packDir(pack)}/${f}`);
    if (st) out.push({ name: f, size: st.bytes });
  }
  return out;
};

const getTrackList = async (files: FileStore, pack: string): Promise<{ fileName: string; trackNum: number; ext: string }[]> => {
  const out: { fileName: string; trackNum: number; ext: string }[] = [];
  for (const f of await files.list(packDir(pack))) {
    const m = f.match(/(\d+)\.(pcm|opuz)$/i);
    if (m) out.push({ fileName: f, trackNum: parseInt(m[1], 10), ext: m[2].toLowerCase() });
  }
  return out;
};

// Every audio file in the pack, whatever its name — a layered pack's files are
// arbitrary (wind-loop.flac), so the numbered getTrackList above cannot see them.
const listAudioFiles = async (files: FileStore, pack: string): Promise<{ name: string; size: number }[]> => {
  const out: { name: string; size: number }[] = [];
  for (const f of (await files.list(packDir(pack))).filter(isAudioFile)) {
    const st = await files.stat(`${packDir(pack)}/${f}`);
    if (st && !st.isDirectory) out.push({ name: f, size: st.bytes });
  }
  return out;
};

const readTrackFile = (files: FileStore, pack: string, fileName: string): Promise<Uint8Array | null> =>
  files.readBytes(packFile(pack, fileName));

const deletePack = (files: FileStore, pack: string): Promise<void> => files.remove(packDir(pack));

const installTracks = async (files: FileStore, pack: string, tracks: { name: string; bytes: Uint8Array }[]): Promise<void> => {
  for (const t of tracks) await files.writeBytes(packFile(pack, t.name), t.bytes);
};

export {
  isMsuFile, listPacks, getPackFiles, getTrackList, listAudioFiles, readTrackFile, deletePack, installTracks,
};
export { isAudioFile } from './msu-paths';
export {
  readManifest, writeManifest, createPack, renamePack, writeTrackFile, deleteTrackFile, renameTrackFile,
} from './msu-edit';
