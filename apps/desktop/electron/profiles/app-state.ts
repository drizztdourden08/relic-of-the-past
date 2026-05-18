import { readFile, writeFile } from 'fs/promises';
import type { AppState } from '../../../../shared/types/profile';
import { getUserDataPath } from '../lib/paths';

export async function loadAppState(): Promise<AppState> {
  try {
    const data = await readFile(getUserDataPath('app.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastProfileId: null };
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  await writeFile(getUserDataPath('app.json'), JSON.stringify(state, null, 2), 'utf-8');
}
