/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { AppState } from '@shared/types/profile';
import { readJson } from '@drizztdourden08/brock-core';
import { APP_STATE_FILE } from './profiles.constants';

const getAppState = (files: FileStore): Promise<AppState> =>
  readJson<AppState>(files, APP_STATE_FILE, { lastProfileId: null });

export { getAppState };
