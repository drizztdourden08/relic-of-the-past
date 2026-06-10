/* @layer electron-main @kind logic */
import { join } from 'path';
import { randomUUID } from 'crypto';
import { getProfileSavesDir } from './store';
import { statSaveSlot } from './save-slot';
import { createManifestStore } from './manifest-store';
import type { NormalSaveInfo } from '@shared/types/saves';

const getNormalSavesDir = (profileId: string): string =>
  join(getProfileSavesDir(profileId), 'normal');

interface NormalSaveManifestEntry {
  id: string;
  name: string;
  timestamp: number;
}

const store = createManifestStore<NormalSaveManifestEntry, NormalSaveInfo>({
  getDir: getNormalSavesDir,
  toInfo: (e, slot) => ({ id: e.id, name: e.name, timestamp: e.timestamp, size: slot.size, hasScreenshot: slot.hasScreenshot }),
});

const createNormalSave = async (profileId: string, name: string, data: Buffer, screenshot?: Buffer): Promise<NormalSaveInfo> => {
  const entry: NormalSaveManifestEntry = { id: randomUUID().slice(0, 8), name, timestamp: Date.now() };
  await store.append(profileId, entry, data, screenshot);
  return { id: entry.id, name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

const listNormalSaves = (profileId: string): Promise<NormalSaveInfo[]> => store.list(profileId);
const loadNormalSave = (profileId: string, id: string): Promise<Buffer | null> => store.load(profileId, id);
const loadNormalScreenshot = (profileId: string, id: string): Promise<Buffer | null> => store.loadScreenshot(profileId, id);
const deleteNormalSave = (profileId: string, id: string): Promise<void> => store.remove(profileId, id);

const overwriteNormalSave = async (profileId: string, id: string, data: Buffer, screenshot?: Buffer): Promise<NormalSaveInfo | null> => {
  const manifest = await store.readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  entry.timestamp = Date.now();
  await store.writePair(profileId, id, data, screenshot);
  await store.writeManifest(profileId, manifest);

  return { id, name: entry.name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

const renameNormalSave = async (profileId: string, id: string, newName: string): Promise<NormalSaveInfo | null> => {
  const manifest = await store.readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  entry.name = newName;
  await store.writeManifest(profileId, manifest);

  const { sav, png } = store.savPaths(getNormalSavesDir(profileId), id);
  const slot = await statSaveSlot(sav, png);
  if (!slot) return null;
  return { id, name: newName, timestamp: entry.timestamp, size: slot.size, hasScreenshot: slot.hasScreenshot };
};

export {
  createNormalSave,
  deleteNormalSave,
  getNormalSavesDir,
  listNormalSaves,
  loadNormalSave,
  loadNormalScreenshot,
  overwriteNormalSave,
  renameNormalSave,
};
