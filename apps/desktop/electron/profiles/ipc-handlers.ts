import { ipcMain } from 'electron';
import type { Profile } from '../../../../shared/types/profile';
import { listProfiles, createProfile, loadProfile, updateProfile, deleteProfile } from './store';
import { loadAppState, saveAppState } from './app-state';

function registerProfileHandlers(): void {
  ipcMain.handle('profiles:list', () => listProfiles());

  ipcMain.handle('profiles:create', async (_event, name: string, romFile: string, language?: string, msuPack?: string) => {
    const profile = await createProfile(name, romFile, language, msuPack);
    const appState = await loadAppState();
    appState.lastProfileId = profile.id;
    await saveAppState(appState);
    return profile;
  });

  ipcMain.handle('profiles:delete', async (_event, id: string) => {
    await deleteProfile(id);
    const appState = await loadAppState();
    if (appState.lastProfileId === id) {
      appState.lastProfileId = null;
      await saveAppState(appState);
    }
  });

  ipcMain.handle('profiles:setLast', async (_event, id: string) => {
    const appState = await loadAppState();
    appState.lastProfileId = id;
    await saveAppState(appState);
  });

  ipcMain.handle('profiles:getAppState', () => loadAppState());

  ipcMain.handle('profiles:updateLastPlayed', async (_event, id: string) => {
    const profile = await loadProfile(id);
    if (profile) {
      profile.lastPlayed = Date.now();
      await updateProfile(profile);
    }
  });

  ipcMain.handle('profiles:update', async (_event, id: string, patch: Partial<Profile>) => {
    const profile = await loadProfile(id);
    if (!profile) return null;
    if (patch.name !== undefined) profile.name = patch.name;
    if (patch.language !== undefined) profile.language = patch.language;
    if (patch.msuPack !== undefined) profile.msuPack = patch.msuPack;
    await updateProfile(profile);
    return profile;
  });
}

export { registerProfileHandlers };
