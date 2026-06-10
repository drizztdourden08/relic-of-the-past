/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { log } from '../../lib/log-bus';
import { setSpritesBase } from '@shared/game/items/sprites';
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
          window.api.getAppState(),
          window.api.getTestArgs(),
        ]);

        const dumpSlot = await window.api.getDumpLayersSlot();
        const dumpNavSlot = await window.api.getDumpNavSlot();
        const isAutoTest = testArgs.autoState !== null || !!testArgs.screenshot || dumpSlot !== null || dumpNavSlot !== null;

        if (profileList.length === 0) {
          log.app('No profiles found, showing setup screen');
          nav.setActivePage('picker');
        } else if (profileList.length === 1) {
          log.app('Single profile found, showing profile page...');
          profileMgmt.setActiveProfile(profileList[0]);
          setSpritesBase(window.api.getSpritesBaseUrl(profileList[0].romFile));
          if (!isAutoTest) nav.setActivePage('profile');
        } else {
          const lastProfile = appState.lastProfileId
            ? profileList.find((p) => p.id === appState.lastProfileId)
            : null;
          if (lastProfile) {
            log.app(`Resuming last profile: ${lastProfile.name}`);
            profileMgmt.setActiveProfile(lastProfile);
            setSpritesBase(window.api.getSpritesBaseUrl(lastProfile.romFile));
            if (!isAutoTest) nav.setActivePage('profile');
          } else {
            nav.setActivePage('picker');
          }
        }
      } catch (err) {
        log.error(`Startup failed: ${err}`);
        nav.setActivePage('picker');
      }
    })();
  }, []);
};

export { useStartup };
