/* @layer shared-storage @kind logic */
/**
 * MSU audio-pack storage over FileStore (msu/<pack>/<track>.{pcm,opuz,msu}).
 * The editing half lives in ./msu-edit and is re-exported at the bottom, so this
 * module stays the one import site for the whole MSU storage surface.
 */
import type { FileStore } from '@shared/platform';
import type { AudioProbe } from '@shared/types/audio-probe';
import {
  MSU1_BYTES_PER_FRAME, MSU1_MAGIC_TEXT, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, MSU1_CHANNELS,
  msu1FrameCount,
} from '@shared/types/msu1-format';
import { isAudioFile, packDir, packFile, trackNumberOf } from './msu-paths';

const extensionOf = (name: string): string => (name.split('.').pop() ?? '').toLowerCase();

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
    const trackNum = trackNumberOf(f);
    if (trackNum !== null) out.push({ fileName: f, trackNum, ext: extensionOf(f) });
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


/**
 * What is known about one pack file. Free for MSU-1 `.pcm` — the format is raw samples at a fixed
 * rate, so duration follows from the byte count and nothing is opened. For an encoded file the same
 * facts live inside the codec, so they are filled in only when a decoder is on hand to be asked and
 * stay null otherwise; they are never guessed at.
 */
type MsuFileMetadata = {
  name: string;
  size: number;
  /** Lowercase, no dot. */
  ext: string;
  /** Seconds. */
  durationSeconds: number | null;
  sampleRate: number | null;
  channels: number | null;
  /** Bits per second. */
  bitRate: number | null;
};

/** Raw MSU-1 has no codec, so its bit rate is exactly what its sample format costs. */
const MSU1_BIT_RATE = MSU1_SAMPLE_RATE * MSU1_BYTES_PER_FRAME * 8;

/**
 * Formats whose figures a probe can supply. The two MSU containers are excluded on purpose:
 * `.pcm` is already exact from arithmetic, and `.opuz` is a custom wrapper no decoder reads.
 */
const PROBEABLE_EXTENSIONS = new Set(['mp3', 'ogg', 'flac', 'opus']);

/** The size-only row for one file: exact for `.pcm`, all-null for anything encoded. */
const baseMetadata = (name: string, bytes: number): MsuFileMetadata => {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  const isPcm = ext === 'pcm';
  return {
    name,
    size: bytes,
    ext,
    durationSeconds: isPcm ? msu1FrameCount(bytes) / MSU1_SAMPLE_RATE : null,
    sampleRate: isPcm ? MSU1_SAMPLE_RATE : null,
    channels: isPcm ? MSU1_CHANNELS : null,
    bitRate: isPcm ? MSU1_BIT_RATE : null,
  };
};

/**
 * What each file in a pack is.
 *
 * The base pass is arithmetic on the directory listing, which is what makes it affordable for a
 * pack of a hundred files totalling a couple of gigabytes: MSU-1 fixes the sample rate and channel
 * count, so a `.pcm`'s duration follows from its byte count alone and no file is opened.
 *
 * `probe` is optional and only ever asked about an ENCODED file, whose figures arithmetic cannot
 * reach. Without it — no decoder installed, or a platform that has none — those rows keep their
 * nulls and the `.pcm` rows are unaffected either way. Probes run one at a time on purpose: each is
 * a separate process, and a hundred at once would cost more than the listing it is annotating.
 *
 * The loop point is the one thing that needs the file itself, and it is deliberately NOT read here.
 * It lives in the first eight bytes, but a FileStore reads whole files, so collecting it for a
 * listing would pull the entire pack through memory to look at 8 bytes each. `readMsu1LoopSample`
 * fetches it for the one file that is actually being looked at.
 */
/**
 * How many probes run at once. A probe is a process launch, and a converted pack has a hundred
 * files to ask about; one at a time made the list take as long as the slowest hundred launches
 * laid end to end. A few in flight keeps a disk busy without a hundred processes fighting for it.
 */
const PROBE_CONCURRENCY = 4;

/** `map`, with at most `limit` callbacks in flight. Order of the result matches the input. */
const mapLimited = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
};

const packFileMetadata = async (
  files: FileStore, pack: string, probe?: AudioProbe,
): Promise<MsuFileMetadata[]> => {
  const names = (await files.list(packDir(pack))).filter(isAudioFile);
  const rows = await mapLimited(names, PROBE_CONCURRENCY, async (name): Promise<MsuFileMetadata | null> => {
    const st = await files.stat(`${packDir(pack)}/${name}`);
    if (!st || st.isDirectory) return null;
    const row = baseMetadata(name, st.bytes);
    if (probe && PROBEABLE_EXTENSIONS.has(row.ext)) {
      const probed = await probe(`${packDir(pack)}/${name}`);
      if (probed) Object.assign(row, probed);
    }
    return row;
  });
  return rows.filter((row): row is MsuFileMetadata => row !== null);
};

/**
 * The loop point a `.pcm` declares in its header, or null for any other format (no other format
 * here can carry one) and for a file that is not a valid MSU-1.
 */
const readMsu1LoopSample = async (
  files: FileStore, pack: string, fileName: string,
): Promise<number | null> => {
  if (!fileName.toLowerCase().endsWith('.pcm')) return null;
  const bytes = await files.readBytes(packFile(pack, fileName));
  if (bytes === null || bytes.byteLength < MSU1_HEADER_BYTES) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  return magic === MSU1_MAGIC_TEXT ? view.getUint32(4, true) : null;
};

export {
  isMsuFile, listPacks, getPackFiles, getTrackList, listAudioFiles, readTrackFile, deletePack, installTracks,
  packFileMetadata, readMsu1LoopSample,
};
export type { MsuFileMetadata };
export { isAudioFile } from './msu-paths';
export { listPackEntries } from './msu-inventory';
export {
  readManifest, writeManifest, createPack, renamePack, writeTrackFile, deleteTrackFile, renameTrackFile,
} from './msu-edit';
