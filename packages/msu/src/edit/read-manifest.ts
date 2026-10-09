/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuPackManifest } from '@rotp/game-data';
import { manifestPath } from './manifest-path';
import { parseManifest } from '@rotp/hub-contracts';
import { withPackName } from './with-pack-name';

const readManifest = async (files: FileStore, pack: string): Promise<MsuPackManifest | null> => {
  const manifest = parseManifest(await files.readText(manifestPath(pack)));
  return manifest && withPackName(manifest, pack);
};

export { readManifest };
