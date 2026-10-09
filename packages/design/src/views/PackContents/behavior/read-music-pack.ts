/* @layer renderer-components @kind logic */
import { readZipDirectory, entryData, STORE_LIMITS, MSUL_MANIFEST_NAME, parseManifest } from '@rotp/hub-contracts';
import type { PackSource } from '../../../packs/pack-source.type';
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
