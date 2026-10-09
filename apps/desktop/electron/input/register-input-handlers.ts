/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { readInputProfiles, writeInputProfiles } from './profile-store';
import { writeDebugCapture } from './write-debug-capture';

const registerInputHandlers = (): void => {
  handle('inputProfiles:read', (_event, profileId: string) => readInputProfiles(profileId));
  handle('inputProfiles:write', (_event, profileId: string, profiles: unknown[]) => writeInputProfiles(profileId, profiles));
  handle('controller:write-debug-capture', (_event, name: string, data: unknown) => writeDebugCapture(name, data));
};

export { registerInputHandlers };
