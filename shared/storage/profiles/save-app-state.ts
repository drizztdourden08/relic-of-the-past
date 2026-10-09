/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { AppState } from '@shared/types/profile';
import { writeJson } from '../json';
import { APP_STATE_FILE } from './profiles.constants';

const saveAppState = (files: FileStore, state: AppState): Promise<void> =>
  writeJson(files, APP_STATE_FILE, state);

export { saveAppState };
