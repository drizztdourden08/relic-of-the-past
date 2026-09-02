/* @layer electron-main @kind logic */
/**
 * The pack's audio as this operation sees it: every file with its size, which of them are
 * already in the target format, and what a converted file gets called.
 *
 * The listing is one directory read plus a stat per entry — no file is opened, so a pack of a
 * hundred tracks totalling gigabytes costs the same as a pack of three.
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
    } catch { /* vanished between the listing and the stat — nothing to convert */ }
  }
  return out;
};

/** True for a file already in the format the pack is being normalised to. */
const isTargetFormat = (name: string): boolean => extensionOf(name) === OPTIMIZE_TARGET_EXTENSION;

/**
 * The files a run would really convert: not yet in the target format, and not already
 * superseded by a same-stem file that is.
 *
 * A superseded original is exactly what a previous run left behind, kept on purpose until it is
 * thrown out. Converting it AGAIN would encode it a second time under a suffixed name, move the
 * manifest onto that copy, and orphan the first — every run would double the pack. Its reference
 * is re-pointed at the copy that already exists instead, with nothing encoded.
 */
const pendingConversions = (audio: PackAudioFile[]): PackAudioFile[] => {
  const covered = supersededMap(audio.map((file) => file.name));
  return audio.filter((file) => !isTargetFormat(file.name) && !covered.has(file.name));
};

const stemOf = (name: string): string => name.replace(/\.[^.]*$/, '');

/**
 * What the converted file is called: the same stem in the target format.
 *
 * A pack can already hold a `foo.flac` next to a `foo.pcm`, and the original is KEPT, so the
 * name is suffixed rather than overwritten — losing an existing file to a rename would be a
 * far worse outcome than an odd name.
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
