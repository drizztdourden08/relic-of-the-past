/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { applyProfilePatch } from '@shared/storage/profile-patch';
import type { Profile, ProfilePatch, CreateProfileOptions } from '@shared/types/profile';
import { listProfiles, createProfile, loadProfile, updateProfile, deleteProfile } from './store';
import { loadAppState, saveAppState } from './app-state';

const registerProfileHandlers = (): void => {
  handle('profiles:list', () => listProfiles());

  handle('profiles:create', async (_event, opts: CreateProfileOptions) => {
    const profile = await createProfile(opts);
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

  // Whitelist by design, shared with the renderer's store (shared/storage/profile-patch.ts):
  // absent leaves a field alone, null clears it, and of `randomizer` only the connection moves.
  handle('profiles:update', async (_event, id: string, patch: ProfilePatch) => {
    const profile = await loadProfile(id);
    if (!profile) return null;
    applyProfilePatch(profile, patch);
    await updateProfile(profile);
    return profile;
  });
};

export { registerProfileHandlers };
