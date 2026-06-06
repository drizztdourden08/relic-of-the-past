/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import type { AppState } from '../../../../shared/types/profile';
import { getUserDataPath } from '../lib/paths';

const loadAppState = async (): Promise<AppState> => {
  try {
    const data = await readFile(getUserDataPath('app.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastProfileId: null };
  }
};

const saveAppState = async (state: AppState): Promise<void> => {
  await writeFile(getUserDataPath('app.json'), JSON.stringify(state, null, 2), 'utf-8');
};

export { loadAppState, saveAppState };
