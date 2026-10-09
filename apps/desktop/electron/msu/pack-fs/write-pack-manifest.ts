/* @layer electron-main @kind logic */
import { dirname } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import type { MsuPackManifest } from '@rotp/game-data';
import { serializeManifest } from '@shared/storage/msu-edit';
import { manifestPath } from './manifest-path';
import { packInventory } from './pack-inventory';
import { withPackName } from './with-pack-name';

const writePackManifest = async (pack: string, manifest: MsuPackManifest): Promise<void> => {
  const path = manifestPath(pack);
  await mkdir(dirname(path), { recursive: true });
  const files = await packInventory(pack);
  await writeFile(path, serializeManifest({ ...withPackName(manifest, pack), files }), 'utf-8');
};

export { writePackManifest };
