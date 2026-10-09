/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { AppState } from '@shared/types/profile';
import { readJson } from '../json';
import { APP_STATE_FILE } from './profiles.constants';

const getAppState = (files: FileStore): Promise<AppState> =>
  readJson<AppState>(files, APP_STATE_FILE, { lastProfileId: null });

export { getAppState };
