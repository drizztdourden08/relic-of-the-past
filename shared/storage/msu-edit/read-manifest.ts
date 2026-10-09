/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { manifestPath } from './manifest-path';
import { parseManifest } from './parse-manifest';
import { withPackName } from './with-pack-name';

const readManifest = async (files: FileStore, pack: string): Promise<MsuPackManifest | null> => {
  const manifest = parseManifest(await files.readText(manifestPath(pack)));
  return manifest && withPackName(manifest, pack);
};

export { readManifest };
