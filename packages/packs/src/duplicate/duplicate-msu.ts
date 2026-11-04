/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuPackManifest } from '@rotp/game-data';
import { alttpMsuConfig as config, synthesizeClassicManifest, getTrackList, listPackEntries, readManifest, readTrackFile, writeManifest, writeTrackFile, assertSafeName, packDir } from '@rotp/msu';
import type { DuplicateInstalled } from './duplicate.type';

const freeCopyName = async (files: FileStore, pack: string): Promise<string> => {
  const base = `${pack} copy`;
  if (!(await files.exists(packDir(config, base)))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base} ${n}`;
    if (!(await files.exists(packDir(config, candidate)))) return candidate;
  }
  return `${base} ${Date.now()}`;
};

const manifestOf = async (files: FileStore, pack: string): Promise<MsuPackManifest> =>
  (await readManifest(config, files, pack)) ?? synthesizeClassicManifest(config, pack, await getTrackList(config, files, pack));

const duplicateMsu: DuplicateInstalled = async (files, installedName, basedOn) => {
  assertSafeName(installedName);
  if (!(await files.exists(packDir(config, installedName)))) throw new Error(`The music pack "${installedName}" was not found.`);
  const name = await freeCopyName(files, installedName);
  const manifest = await manifestOf(files, installedName);
  for (const entry of await listPackEntries(config, files, installedName)) {
    const bytes = await readTrackFile(config, files, installedName, entry);
    if (bytes) await writeTrackFile(config, files, name, { name: entry, bytes });
  }
  await writeManifest(config, files, name, { ...manifest, meta: { ...manifest.meta, name, createdAt: Date.now(), basedOn } });
  return { name };
};

export { duplicateMsu };
