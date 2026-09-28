/* @layer renderer-components @kind logic */
/**
 * A music pack's listing without its audio: the zip directory from the end of the file, then
 * the manifest entry. A track's bytes are read later, only when its play button is pressed.
 */
import { readZipDirectory, entryData } from '@shared/store/manifest/zip-directory';
import type { ZipEntry } from '@shared/store/manifest/zip-directory';
import { STORE_LIMITS } from '@shared/store/limits';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { parseManifest } from '@shared/storage/msu-edit';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { PackSource } from '../../../pack-source.type';

type MusicPack = {
  manifest: MsuPackManifest;
  /** Every archive entry by name, for reading a file on demand. */
  entries: ReadonlyMap<string, ZipEntry>;
};

const readMusicPack = async (source: PackSource): Promise<MusicPack> => {
  const list = await readZipDirectory(source);
  const entry = list.find((item) => item.name === MSUL_MANIFEST_NAME);
  if (!entry) throw new Error(`This pack has no ${MSUL_MANIFEST_NAME}, so its tracks cannot be listed.`);
  if (entry.bytes > STORE_LIMITS.manifestBytes) throw new Error(`This pack's ${MSUL_MANIFEST_NAME} is too large to read.`);
  const manifest = parseManifest(new TextDecoder().decode(await entryData(source, entry)));
  if (!manifest) throw new Error(`This pack's ${MSUL_MANIFEST_NAME} is not a manifest this version can read.`);
  return { manifest, entries: new Map(list.map((item) => [item.name, item])) };
};

export { readMusicPack };
export type { MusicPack };
