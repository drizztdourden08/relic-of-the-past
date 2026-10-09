/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { assertSafeName, packDir } from '../paths';
import { readManifest } from './read-manifest';
import { writeManifest } from './write-manifest';

const renamePack = async (files: FileStore, from: string, to: string): Promise<void> => {
  assertSafeName(from);
  assertSafeName(to);
  if (from === to) return;
  if (await files.exists(packDir(to))) throw new Error(`MSU pack already exists: ${to}`);
  for (const name of await files.list(packDir(from))) {
    const bytes = await files.readBytes(`${packDir(from)}/${name}`);
    if (bytes) await files.writeBytes(`${packDir(to)}/${name}`, bytes);
  }
  const manifest = await readManifest(files, to);
  if (manifest) await writeManifest(files, to, manifest);
  await files.remove(packDir(from));
};

export { renamePack };
