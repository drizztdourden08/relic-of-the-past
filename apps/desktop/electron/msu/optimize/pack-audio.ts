/* @layer electron-main @kind logic */
/**
 * The pack's audio as this operation sees it: every file with its size, which are already in
 * the target format, and what a converted file gets called. One readdir plus a stat per entry;
 * no file is opened.
 */
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import { isAudioFile } from '@shared/storage/msu-paths';
import { supersededMap } from '@shared/storage/msu-superseded';
import { OPTIMIZE_TARGET_EXTENSION } from '@shared/types/msu-optimize';
import { packPath } from '../pack-fs';
import { extensionOf } from './audio-source';

interface PackAudioFile {
  name: string;
  sizeBytes: number;
}

const listPackAudio = async (pack: string): Promise<PackAudioFile[]> => {
  const dir = packPath(pack);
  const out: PackAudioFile[] = [];
  for (const name of (await readdir(dir)).filter(isAudioFile)) {
    try {
      const entry = await stat(join(dir, name));
      if (entry.isFile()) out.push({ name, sizeBytes: entry.size });
    } catch { /* vanished between the listing and the stat */ }
  }
  return out;
};

/** True for a file already in the format the pack is being normalised to. */
const isTargetFormat = (name: string): boolean => extensionOf(name) === OPTIMIZE_TARGET_EXTENSION;

/**
 * The files a run would convert: not yet in the target format, and not superseded by a
 * same-stem file that is. Converting a superseded original AGAIN would encode a second
 * suffixed copy and orphan the first, doubling the pack every run; its reference is
 * re-pointed at the existing copy instead.
 */
const pendingConversions = (audio: PackAudioFile[]): PackAudioFile[] => {
  const covered = supersededMap(audio.map((file) => file.name));
  return audio.filter((file) => !isTargetFormat(file.name) && !covered.has(file.name));
};

const stemOf = (name: string): string => name.replace(/\.[^.]*$/, '');

/**
 * The same stem in the target format. A pack can already hold `foo.flac` next to `foo.pcm`,
 * so the name is suffixed, never overwritten: an odd name beats a lost file.
 */
const freeTargetName = (name: string, taken: Set<string>): string => {
  const stem = stemOf(name);
  const plain = `${stem}.${OPTIMIZE_TARGET_EXTENSION}`;
  if (!taken.has(plain)) return plain;
  let suffix = 2;
  while (taken.has(`${stem}-${suffix}.${OPTIMIZE_TARGET_EXTENSION}`)) suffix += 1;
  return `${stem}-${suffix}.${OPTIMIZE_TARGET_EXTENSION}`;
};

export { freeTargetName, isTargetFormat, listPackAudio, pendingConversions, stemOf };
export type { PackAudioFile };
