/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { log } from '../../lib/log-bus';
import { applySpritesForRom } from '../../lib/sprites/apply-sprites-for-rom';
import { getAppState } from '../../lib/storage/profile-store';
import type { PageId } from '../types';

const useStartup = (
  profileMgmt: {
    refreshProfilesAndRoms: () => Promise<{ profiles: Profile[]; romStatuses: RomInfo[] }>;
    setActiveProfile: (p: Profile | null) => void;
  },
  nav: { setActivePage: (page: PageId) => void },
) => {
  useEffect(() => {
    (async () => {
      try {
        const [{ profiles: profileList }, appState, testArgs] = await Promise.all([
          profileMgmt.refreshProfilesAndRoms(),
          getAppState(),
          window.api.getTestArgs(),
        ]);

        const dumpSlot = await window.api.getDumpLayersSlot();
        const dumpNavSlot = await window.api.getDumpNavSlot();
        // --fresh (and other automation) starts straight in the game view with no
        // home/profile menu in the way.
        const isAutoTest = testArgs.autoState !== null || !!testArgs.screenshot || dumpSlot !== null || dumpNavSlot !== null || window.api.startup.fresh;

        if (profileList.length === 0) {
          log.app('No profiles found, showing setup screen');
          nav.setActivePage('data');
        } else if (profileList.length === 1) {
          log.app('Single profile found, showing profile page...');
          profileMgmt.setActiveProfile(profileList[0]);
          void applySpritesForRom(profileList[0].romFile);
          if (!isAutoTest) nav.setActivePage('profile');
        } else {
          const lastProfile = appState.lastProfileId
            ? profileList.find((p) => p.id === appState.lastProfileId)
            : null;
          if (lastProfile) {
            log.app(`Resuming last profile: ${lastProfile.name}`);
            profileMgmt.setActiveProfile(lastProfile);
            void applySpritesForRom(lastProfile.romFile);
            if (!isAutoTest) nav.setActivePage('profile');
          } else {
            nav.setActivePage('data');
          }
        }
      } catch (err) {
        log.error(`Startup failed: ${err}`);
        nav.setActivePage('data');
      }
    })();
  }, []);
};

export { useStartup };
