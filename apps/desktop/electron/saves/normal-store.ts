import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, stat, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { getProfileSavesDir } from './store';
import type { NormalSaveInfo } from '../../../../shared/types/saves';

function getNormalSavesDir(profileId: string): string {
  return join(getProfileSavesDir(profileId), 'normal');
}

interface NormalSaveManifestEntry {
  id: string;
  name: string;
  timestamp: number;
}

async function readManifest(profileId: string): Promise<NormalSaveManifestEntry[]> {
  try {
    const data = await readFile(join(getNormalSavesDir(profileId), 'manifest.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeManifest(profileId: string, entries: NormalSaveManifestEntry[]): Promise<void> {
  const dir = getNormalSavesDir(profileId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(entries, null, 2), 'utf-8');
}

async function createNormalSave(
  profileId: string,
  name: string,
  data: Buffer,
  screenshot?: Buffer,
): Promise<NormalSaveInfo> {
  const dir = getNormalSavesDir(profileId);
  await mkdir(dir, { recursive: true });

  const id = randomUUID().slice(0, 8);
  const timestamp = Date.now();

  await writeFile(join(dir, `${id}.sav`), data);
  if (screenshot) {
    await writeFile(join(dir, `${id}.png`), screenshot);
  }

  const manifest = await readManifest(profileId);
  manifest.push({ id, name, timestamp });
  await writeManifest(profileId, manifest);

  return {
    id,
    name,
    timestamp,
    size: data.byteLength,
    hasScreenshot: !!screenshot,
  };
}

async function listNormalSaves(profileId: string): Promise<NormalSaveInfo[]> {
  const dir = getNormalSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const results: NormalSaveInfo[] = [];

  for (const entry of manifest) {
    const savPath = join(dir, `${entry.id}.sav`);
    try {
      const s = await stat(savPath);
      let hasScreenshot = false;
      try {
        await stat(join(dir, `${entry.id}.png`));
        hasScreenshot = true;
      } catch { /* no screenshot */ }
      results.push({
        id: entry.id,
        name: entry.name,
        timestamp: entry.timestamp,
        size: s.size,
        hasScreenshot,
      });
    } catch {
      // File missing — skip orphaned manifest entry
    }
  }

  // Return newest first
  return results.sort((a, b) => b.timestamp - a.timestamp);
}

async function loadNormalSave(profileId: string, id: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getNormalSavesDir(profileId), `${id}.sav`));
  } catch {
    return null;
  }
}

async function loadNormalScreenshot(profileId: string, id: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getNormalSavesDir(profileId), `${id}.png`));
  } catch {
    return null;
  }
}

async function overwriteNormalSave(
  profileId: string,
  id: string,
  data: Buffer,
  screenshot?: Buffer,
): Promise<NormalSaveInfo | null> {
  const dir = getNormalSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  const timestamp = Date.now();
  entry.timestamp = timestamp;

  await writeFile(join(dir, `${id}.sav`), data);
  if (screenshot) {
    await writeFile(join(dir, `${id}.png`), screenshot);
  }
  await writeManifest(profileId, manifest);

  return {
    id: entry.id,
    name: entry.name,
    timestamp,
    size: data.byteLength,
    hasScreenshot: !!screenshot,
  };
}

async function deleteNormalSave(profileId: string, id: string): Promise<void> {
  const dir = getNormalSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const filtered = manifest.filter((e) => e.id !== id);
  await writeManifest(profileId, filtered);

  try { await unlink(join(dir, `${id}.sav`)); } catch { /* ignore */ }
  try { await unlink(join(dir, `${id}.png`)); } catch { /* ignore */ }
}

async function renameNormalSave(profileId: string, id: string, newName: string): Promise<NormalSaveInfo | null> {
  const dir = getNormalSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  entry.name = newName;
  await writeManifest(profileId, manifest);

  try {
    const s = await stat(join(dir, `${entry.id}.sav`));
    let hasScreenshot = false;
    try {
      await stat(join(dir, `${entry.id}.png`));
      hasScreenshot = true;
    } catch { /* no screenshot */ }
    return { id: entry.id, name: newName, timestamp: entry.timestamp, size: s.size, hasScreenshot };
  } catch {
    return null;
  }
}

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
