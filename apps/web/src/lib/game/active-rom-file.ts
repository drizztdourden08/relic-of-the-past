/* @layer bridge-wasm @kind logic */
/**
 * The ROM the active profile boots: the profile the app last selected, falling
 * back to the first profile that has one, so a fresh install with a single
 * profile answers before anything is played. Null when no profile carries a ROM
 * or the store cannot be read.
 */
import * as profileStore from '../storage/profile-store';

const activeRomFile = async (): Promise<string | null> => {
  try {
    const [state, profiles] = await Promise.all([
      profileStore.getAppState(),
      profileStore.listProfiles(),
    ]);
    const active = profiles.find((p) => p.id === state.lastProfileId);
    return active?.romFile ?? profiles.find((p) => p.romFile)?.romFile ?? null;
  } catch {
    return null;
  }
};

export { activeRomFile };
