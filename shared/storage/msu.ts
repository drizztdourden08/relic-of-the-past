/* @layer shared-storage @kind logic */
/** MSU audio-pack storage over FileStore (msu/<pack>/<track>.{pcm,opuz,msu}). */
import type { FileStore } from '@shared/platform';

const isMsuFile = (name: string): boolean => /\.(pcm|opuz|msu)$/i.test(name);
const packDir = (pack: string): string => `msu/${pack}`;

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

const readTrackFile = (files: FileStore, pack: string, fileName: string): Promise<Uint8Array | null> => {
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) throw new Error('Invalid filename');
  return files.readBytes(`${packDir(pack)}/${fileName}`);
};

const deletePack = (files: FileStore, pack: string): Promise<void> => files.remove(packDir(pack));

const installTracks = async (files: FileStore, pack: string, tracks: { name: string; bytes: Uint8Array }[]): Promise<void> => {
  for (const t of tracks) await files.writeBytes(`${packDir(pack)}/${t.name}`, t.bytes);
};

export { isMsuFile, listPacks, getPackFiles, getTrackList, readTrackFile, deletePack, installTracks };
