/* @layer electron-main @kind logic */
import { getUserDataPath, handle, readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';

const trackerPath = (profileId: string): string => getUserDataPath('profiles', profileId, 'tracker.json');

const trackerHandlers: HandlerGroup = {
  id: 'tracker',
  register: () => {
    handle('tracker:save', (_event, profileId, state) => writeJsonFile(trackerPath(profileId), state));
    handle('tracker:load', (_event, profileId) => readJsonFile<unknown>(trackerPath(profileId), null));
  },
};

export { trackerHandlers };
