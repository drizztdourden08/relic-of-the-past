/* @layer electron-main @kind logic */
import type { AppState } from '@shared/types/profile';
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';

const loadAppState = (): Promise<AppState> =>
  readJson<AppState>(getUserDataPath('app.json'), { lastProfileId: null });

export { loadAppState };
