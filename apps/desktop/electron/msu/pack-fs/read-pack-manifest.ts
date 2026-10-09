/* @layer electron-main @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { parseManifest } from '@rotp/hub-contracts';
import { manifestPath } from './manifest-path';
import { readPackText } from './read-pack-text';
import { withPackName } from './with-pack-name';

const readPackManifest = async (pack: string): Promise<MsuPackManifest | null> => {
  const manifest = parseManifest(await readPackText(manifestPath(pack)));
  return manifest && withPackName(manifest, pack);
};

export { readPackManifest };
