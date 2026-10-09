/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuPackManifest } from '@rotp/game-data';
import { synthesizeClassicManifest } from '../msu-classic-manifest';
import {
  getTrackList, listPackEntries, readManifest, readTrackFile, writeManifest, writeTrackFile,
} from '../msu';
import { assertSafeName, packDir } from '../msu-paths';
import type { DuplicateInstalled } from './duplicate.type';

const freeCopyName = async (files: FileStore, pack: string): Promise<string> => {
  const base = `${pack} copy`;
  if (!(await files.exists(packDir(base)))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base} ${n}`;
    if (!(await files.exists(packDir(candidate)))) return candidate;
  }
  return `${base} ${Date.now()}`;
};

const manifestOf = async (files: FileStore, pack: string): Promise<MsuPackManifest> =>
  (await readManifest(files, pack)) ?? synthesizeClassicManifest(pack, await getTrackList(files, pack));

const duplicateMsu: DuplicateInstalled = async (files, installedName, basedOn) => {
  assertSafeName(installedName);
  if (!(await files.exists(packDir(installedName)))) throw new Error(`The music pack "${installedName}" was not found.`);
  const name = await freeCopyName(files, installedName);
  const manifest = await manifestOf(files, installedName);
  for (const entry of await listPackEntries(files, installedName)) {
    const bytes = await readTrackFile(files, installedName, entry);
    if (bytes) await writeTrackFile(files, name, entry, bytes);
  }
  await writeManifest(files, name, { ...manifest, meta: { ...manifest.meta, name, createdAt: Date.now(), basedOn } });
  return { name };
};

export { duplicateMsu };
