/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { AppState } from '@shared/types/profile';
import { writeJson } from '@drizztdourden08/brock-core';
import { APP_STATE_FILE } from './profiles.constants';

const saveAppState = (files: FileStore, state: AppState): Promise<void> =>
  writeJson(files, APP_STATE_FILE, state);

export { saveAppState };
