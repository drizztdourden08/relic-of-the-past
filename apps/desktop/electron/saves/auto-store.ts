import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, stat, unlink } from 'fs/promises';
import { getProfileSavesDir } from './store';
import type { AutoSaveInfo } from '../../../../shared/types/saves';

const DEFAULT_MAX_ENTRIES = 5;
const ABSOLUTE_MAX_ENTRIES = 20;

function getAutoSavesDir(profileId: string): string {
  return join(getProfileSavesDir(profileId), 'auto');
}

interface AutoSaveManifestEntry {
  id: string;
  timestamp: number;
  trigger: 'timer' | 'quit';
}

async function readManifest(profileId: string): Promise<AutoSaveManifestEntry[]> {
  try {
    const data = await readFile(join(getAutoSavesDir(profileId), 'manifest.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeManifest(profileId: string, entries: AutoSaveManifestEntry[]): Promise<void> {
  const dir = getAutoSavesDir(profileId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(entries, null, 2), 'utf-8');
}

async function createAutoSave(
  profileId: string,
  trigger: 'timer' | 'quit',
  data: Buffer,
  screenshot?: Buffer,
): Promise<AutoSaveInfo> {
  const dir = getAutoSavesDir(profileId);
  await mkdir(dir, { recursive: true });

  const timestamp = Date.now();
  const id = String(timestamp);

  await writeFile(join(dir, `${id}.sav`), data);
  if (screenshot) {
    await writeFile(join(dir, `${id}.png`), screenshot);
  }

  const manifest = await readManifest(profileId);
  manifest.push({ id, timestamp, trigger });
  await writeManifest(profileId, manifest);

  return {
    id,
    timestamp,
    size: data.byteLength,
    trigger,
    hasScreenshot: !!screenshot,
  };
}

async function listAutoSaves(profileId: string): Promise<AutoSaveInfo[]> {
  const dir = getAutoSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const results: AutoSaveInfo[] = [];

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
        timestamp: entry.timestamp,
        size: s.size,
        trigger: entry.trigger,
        hasScreenshot,
      });
    } catch {
      // File missing — skip
    }
  }

  // Newest first
  return results.sort((a, b) => b.timestamp - a.timestamp);
}

async function loadAutoSave(profileId: string, id: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getAutoSavesDir(profileId), `${id}.sav`));
  } catch {
    return null;
  }
}

async function loadAutoScreenshot(profileId: string, id: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getAutoSavesDir(profileId), `${id}.png`));
  } catch {
    return null;
  }
}

async function deleteAutoSave(profileId: string, id: string): Promise<void> {
  const dir = getAutoSavesDir(profileId);
  const manifest = await readManifest(profileId);
  const filtered = manifest.filter((e) => e.id !== id);
  await writeManifest(profileId, filtered);

  try { await unlink(join(dir, `${id}.sav`)); } catch { /* ignore */ }
  try { await unlink(join(dir, `${id}.png`)); } catch { /* ignore */ }
}

async function pruneAutoSaves(profileId: string, maxEntries?: number): Promise<void> {
  const max = Math.min(maxEntries ?? DEFAULT_MAX_ENTRIES, ABSOLUTE_MAX_ENTRIES);
  const manifest = await readManifest(profileId);
  if (manifest.length <= max) return;

  // Sort oldest first, remove excess
  const sorted = [...manifest].sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = sorted.slice(0, sorted.length - max);

  for (const entry of toRemove) {
    await deleteAutoSave(profileId, entry.id);
  }
}

export {
  ABSOLUTE_MAX_ENTRIES,
  createAutoSave,
  DEFAULT_MAX_ENTRIES,
  deleteAutoSave,
  getAutoSavesDir,
  listAutoSaves,
  loadAutoSave,
  loadAutoScreenshot,
  pruneAutoSaves,
};
