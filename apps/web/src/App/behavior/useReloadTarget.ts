/* @layer renderer-appshell @kind hook */
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
