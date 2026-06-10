/* @layer electron-main @kind logic */
import type { AppState } from '@shared/types/profile';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const loadAppState = (): Promise<AppState> =>
  readJson<AppState>(getUserDataPath('app.json'), { lastProfileId: null });

const saveAppState = (state: AppState): Promise<void> =>
  writeJson(getUserDataPath('app.json'), state);

export { loadAppState, saveAppState };
