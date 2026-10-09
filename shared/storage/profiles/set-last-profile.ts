/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { getAppState } from './get-app-state';
import { saveAppState } from './save-app-state';

const setLastProfile = async (files: FileStore, id: string): Promise<void> => {
  const state = await getAppState(files);
  state.lastProfileId = id;
  await saveAppState(files, state);
};

export { setLastProfile };
