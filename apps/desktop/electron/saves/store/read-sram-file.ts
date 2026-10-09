/* @layer electron-main @kind logic */
import { join } from 'path';
import { readFile } from 'fs/promises';
import { getProfileSavesDir } from './get-profile-saves-dir';

const readSramFile = async (profileId: string): Promise<Buffer | null> => {
  try {
    return await readFile(join(getProfileSavesDir(profileId), 'sram.dat'));
  } catch {
    return null;
  }
};

export { readSramFile };
