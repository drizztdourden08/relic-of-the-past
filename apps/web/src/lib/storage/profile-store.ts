/* @layer renderer-lib @kind logic */
/**
 * Renderer-facing profile/app-state/config store, bound to the active platform's
 * FileStore. Same surface the renderer previously called on window.api, now
 * routed through the platform layer so it works on desktop and mobile alike.
 */
import type { Profile, ProfilePatch, AppState, CreateProfileOptions } from '@shared/types/profile';
import * as store from '@shared/storage/profiles';
import { getPlatform } from '@app/platform/get-platform';
import { isAutomationLaunch } from '@app/lib/instance';

const files = () => getPlatform().files;

const listProfiles = (): Promise<Profile[]> => store.listProfiles(files());
const createProfile = (opts: CreateProfileOptions): Promise<Profile> =>
  store.createProfile(files(), opts);
const updateProfile = (id: string, patch: ProfilePatch): Promise<Profile | null> => store.updateProfile(files(), id, patch);
const deleteProfile = (id: string): Promise<void> => store.deleteProfile(files(), id);
// app.json decides which profile opens by default, and it is shared by every launch.
// loadProfileForGame() writes it on each run, so ANY automated launch, not only a named
// instance, is prevented from repointing it, or the user's next normal launch resumes an
// agent's profile. Gated here, at the single seam, so no call site can forget.
const setLastProfile = (id: string): Promise<void> =>
  isAutomationLaunch() ? Promise.resolve() : store.setLastProfile(files(), id);
const updateLastPlayed = (id: string): Promise<void> => store.updateLastPlayed(files(), id);
const getAppState = (): Promise<AppState> => store.getAppState(files());
const readConfig = (id: string): Promise<Record<string, unknown> | null> => store.readConfig(files(), id);
const writeConfig = (id: string, settings: Record<string, unknown>): Promise<void> => store.writeConfig(files(), id, settings);

// Merge-write the active input profile id without clobbering other settings. Used
// when the profile-cycle shortcut switches profiles outside the settings screen.
const updateActiveInputProfileId = async (id: string, activeInputProfileId: string): Promise<void> => {
  const current = (await store.readConfig(files(), id)) ?? {};
  await store.writeConfig(files(), id, { ...current, activeInputProfileId });
};

export {
  listProfiles, createProfile, updateProfile, deleteProfile,
  setLastProfile, updateLastPlayed, getAppState, readConfig, writeConfig,
  updateActiveInputProfileId,
};
