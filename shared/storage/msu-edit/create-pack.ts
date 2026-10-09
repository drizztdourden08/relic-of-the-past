/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuPackMeta } from '@shared/types/msu-manifest';
import { assertSafeName, packDir } from '../msu-paths';
import { newManifest } from './new-manifest';
import { writeManifest } from './write-manifest';

const createPack = async (files: FileStore, pack: string, meta?: Partial<MsuPackMeta>): Promise<void> => {
  assertSafeName(pack);
  if (await files.exists(packDir(pack))) throw new Error(`MSU pack already exists: ${pack}`);
  await writeManifest(files, pack, newManifest(pack, meta));
};

export { createPack };
