/* @layer renderer-appshell @kind hook */
/**
 * Publishes how to bring the running game up to date with the text on disk.
 *
 * The assets blob reaches the emulator once, at boot, and loading the same
 * profile again is what re-reads it — so that is what gets registered. It is a
 * capability the data screens cannot reach on their own, which is why the
 * notice there can offer a button rather than instructions.
 *
 * Registered from an effect on the ACTIVE PROFILE rather than from inside the
 * loader: a closure built in there could not name the callback it sits in, and
 * the profile is what the offer is really about.
 */
import { useEffect } from 'react';
import { useGameAssetsStore } from '@app/stores/game-assets-store';
import type { Profile } from '@shared/types/profile';

const useReloadTarget = (
  profile: Profile | null,
  load: (profile: Profile) => Promise<void>,
): void => {
  const registerReload = useGameAssetsStore((state) => state.registerReload);

  useEffect(() => {
    if (profile === null) {
      registerReload(null, null);
      return;
    }
    registerReload(profile.name, () => { void load(profile); });
  }, [profile, load, registerReload]);
};

export { useReloadTarget };
