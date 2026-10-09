/* @layer renderer-components @kind logic */
import { readZipDirectory, entryData } from '@shared/store/manifest/zip-directory';
import { STORE_LIMITS } from '@shared/store/limits';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { parseManifest } from '@shared/storage/msu-edit';
import type { PackSource } from '../../../pack-source.type';
import type { MusicPack } from '../PackContents.type';

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
