/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import type { Profile, ProfilePatch } from '@shared/types/profile';
import { listProfiles, createProfile, loadProfile, updateProfile, deleteProfile } from './store';
import { loadAppState, saveAppState } from './app-state';

const registerProfileHandlers = (): void => {
  handle('profiles:list', () => listProfiles());

  handle('profiles:create', async (_event, name: string, romFile: string, language?: string, msuPack?: string) => {
    const profile = await createProfile(name, romFile, language, msuPack);
    const appState = await loadAppState();
    appState.lastProfileId = profile.id;
    await saveAppState(appState);
    return profile;
  });

  handle('profiles:delete', async (_event, id: string) => {
    await deleteProfile(id);
    const appState = await loadAppState();
    if (appState.lastProfileId === id) {
      appState.lastProfileId = null;
      await saveAppState(appState);
    }
  });

  handle('profiles:setLast', async (_event, id: string) => {
    const appState = await loadAppState();
    appState.lastProfileId = id;
    await saveAppState(appState);
  });

  handle('profiles:getAppState', () => loadAppState());

  handle('profiles:updateLastPlayed', async (_event, id: string) => {
    const profile = await loadProfile(id);
    if (profile) {
      profile.lastPlayed = Date.now();
      await updateProfile(profile);
    }
  });

  // A patch distinguishes three things, and the middle one used to be unreachable: a key that is
  // ABSENT leaves the field alone, a key holding NULL clears it, and a key holding a value sets it.
  // Clearing was written as `undefined`, which is indistinguishable from absent once the patch has
  // crossed the IPC boundary, so picking "None" for a pack or language silently kept the old one.
  handle('profiles:update', async (_event, id: string, patch: ProfilePatch) => {
    const profile = await loadProfile(id);
    if (!profile) return null;
    if (patch.name != null) profile.name = patch.name;
    if (patch.language !== undefined) profile.language = patch.language ?? undefined;
    if (patch.msuPack !== undefined) profile.msuPack = patch.msuPack ?? undefined;
    await updateProfile(profile);
    return profile;
  });
};

export { registerProfileHandlers };
