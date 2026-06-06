import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, rm, rename, access, cp } from 'fs/promises';
import type { Profile } from '../../../../shared/types/profile';
import { getUserDataPath, getLegacyPath } from '../lib/paths';

const exists = async (p: string): Promise<boolean> => {
  try { await access(p); return true; } catch { return false; }
};

const migrateDataFolder = async (): Promise<void> => {
  const dataDir = getUserDataPath();
  const migrationDirs = ['roms', 'profiles', 'assets', 'config'];

  let needsMigration = false;
  for (const dir of migrationDirs) {
    const oldDir = getLegacyPath(dir);
    const newDir = getUserDataPath(dir);
    if (await exists(oldDir) && !(await exists(newDir))) {
      needsMigration = true;
      break;
    }
  }

  const oldAppJson = getLegacyPath('app.json');
  const newAppJson = getUserDataPath('app.json');
  if (await exists(oldAppJson) && !(await exists(newAppJson))) {
    needsMigration = true;
  }

  if (!needsMigration) return;

  await mkdir(dataDir, { recursive: true });

  for (const dir of migrationDirs) {
    const oldDir = getLegacyPath(dir);
    const newDir = getUserDataPath(dir);
    if (await exists(oldDir) && !(await exists(newDir))) {
      try {
        await rename(oldDir, newDir);
      } catch {
        await cp(oldDir, newDir, { recursive: true });
        await rm(oldDir, { recursive: true, force: true });
      }
    }
  }

  if (await exists(oldAppJson) && !(await exists(newAppJson))) {
    try {
      await rename(oldAppJson, newAppJson);
    } catch {
      const data = await readFile(oldAppJson, 'utf-8');
      await writeFile(newAppJson, data, 'utf-8');
      await rm(oldAppJson, { force: true });
    }
  }

  await migrateMsuPacks();
};

const migrateMsuPacks = async (): Promise<void> => {
  const profilesDir = getUserDataPath('profiles');
  let entries: string[];
  try { entries = await readdir(profilesDir); } catch { return; }

  for (const entry of entries) {
    const profileMsuDir = join(profilesDir, entry, 'msu');
    if (!(await exists(profileMsuDir))) continue;

    let files: string[];
    try { files = await readdir(profileMsuDir); } catch { continue; }
    if (files.length === 0) continue;

    let profileName = entry;
    try {
      const data = await readFile(join(profilesDir, entry, 'profile.json'), 'utf-8');
      const p = JSON.parse(data) as Profile;
      profileName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      p.msuPack = profileName;
      await writeFile(join(profilesDir, entry, 'profile.json'), JSON.stringify(p, null, 2), 'utf-8');
    } catch { /* use id */ }

    const sharedMsuDir = getUserDataPath('msu', profileName);
    await mkdir(sharedMsuDir, { recursive: true });

    for (const file of files) {
      const src = join(profileMsuDir, file);
      const dst = join(sharedMsuDir, file);
      if (!(await exists(dst))) {
        try { await rename(src, dst); } catch {
          const data = await readFile(src);
          await writeFile(dst, data);
          await rm(src, { force: true });
        }
      }
    }

    await rm(profileMsuDir, { recursive: true, force: true });
  }
};

export { migrateDataFolder };
