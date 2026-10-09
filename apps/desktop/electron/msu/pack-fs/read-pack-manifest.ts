/* @layer electron-main @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { parseManifest } from '@shared/storage/msu-edit';
import { manifestPath } from './manifest-path';
import { readPackText } from './read-pack-text';
import { withPackName } from './with-pack-name';

const readPackManifest = async (pack: string): Promise<MsuPackManifest | null> => {
  const manifest = parseManifest(await readPackText(manifestPath(pack)));
  return manifest && withPackName(manifest, pack);
};

export { readPackManifest };
