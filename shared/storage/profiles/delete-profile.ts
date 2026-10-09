/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { getAppState } from './get-app-state';
import { saveAppState } from './save-app-state';

const deleteProfile = async (files: FileStore, id: string): Promise<void> => {
  await files.remove(`profiles/${id}`);
  const state = await getAppState(files);
  if (state.lastProfileId === id) {
    state.lastProfileId = null;
    await saveAppState(files, state);
  }
};

export { deleteProfile };
