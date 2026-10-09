/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir, writeFile, stat, rename as fsRename } from 'fs/promises';
import { getProfileSavesDir } from './get-profile-saves-dir';

const backUpExisting = async (sramPath: string, bakPath: string): Promise<void> => {
  try {
    await stat(sramPath);
    await fsRename(sramPath, bakPath);
  } catch {
    return;
  }
};

const writeSramFile = async (profileId: string, data: Buffer): Promise<void> => {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  const sramPath = join(savesDir, 'sram.dat');
  const bakPath = join(savesDir, 'sram.bak');
  await backUpExisting(sramPath, bakPath);
  await writeFile(sramPath, data);
};

export { writeSramFile };
