/* @layer bridge-wasm @kind logic */
import * as profileStore from '../storage/profile-store';

const activeRomFile = async (): Promise<string | null> => {
  try {
    const [state, profiles] = await Promise.all([
      profileStore.getAppState(),
      profileStore.listProfiles(),
    ]);
    const lastSelected = profiles.find((p) => p.id === state.lastProfileId);
    return lastSelected?.romFile ?? profiles.find((p) => p.romFile)?.romFile ?? null;
  } catch {
    return null;
  }
};

export { activeRomFile };
