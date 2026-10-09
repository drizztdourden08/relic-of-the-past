/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuPackManifest } from '@rotp/game-data';
import { listPackEntries } from '../msu-inventory';
import { assertSafeName } from '../msu-paths';
import { manifestPath } from './manifest-path';
import { serializeManifest } from './serialize-manifest';
import { withPackName } from './with-pack-name';

const writeManifest = async (files: FileStore, pack: string, manifest: MsuPackManifest): Promise<void> => {
  assertSafeName(pack);
  const inventory = await listPackEntries(files, pack);
  await files.writeText(manifestPath(pack), serializeManifest({ ...withPackName(manifest, pack), files: inventory }));
};

export { writeManifest };
