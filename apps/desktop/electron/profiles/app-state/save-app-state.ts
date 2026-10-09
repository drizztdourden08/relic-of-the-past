/* @layer electron-main @kind logic */
import type { AppState } from '@shared/types/profile';
import { getUserDataPath } from '../../lib/paths';
import { writeJson } from '../../lib/json-store';

const saveAppState = (state: AppState): Promise<void> =>
  writeJson(getUserDataPath('app.json'), state);

export { saveAppState };
