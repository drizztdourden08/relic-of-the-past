/* @layer renderer-appshell @kind hook */
import { useEffect, useState } from 'react';
import { log } from '../../lib/log-bus';
import { getAppState } from '../../lib/storage/profile-store';
import { instanceProfile } from '../../lib/instance';
import type { PageId } from '../App.type';

const useStartup = (
  profileMgmt: {
    refreshProfilesAndRoms: () => Promise<{ profiles: Profile[]; romStatuses: RomInfo[] }>;
    setActiveProfile: (p: Profile | null) => void;
  },
  nav: { setActivePage: (page: PageId) => void },
) => {
  const [settled, setSettled] = useState(false);

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
        const simRun = await window.api.getSimRunConfig();
        const wanted = instanceProfile();
        const isAutoTest = testArgs.autoState !== null || !!testArgs.screenshot || dumpSlot !== null || dumpNavSlot !== null || simRun !== null || window.api.startup.fresh || window.api.startup.autoStart || wanted !== null;

        if (wanted !== null) {
          const pinned = profileList.find((p) => p.id === wanted) ?? profileList.find((p) => p.name === wanted);
          if (!pinned) {
            log.error(`Instance profile "${wanted}" not found. Run "npm run wt -- new" to provision it`);
            nav.setActivePage('data');
            return;
          }
          log.app(`Instance profile: ${pinned.name}`);
          profileMgmt.setActiveProfile(pinned);
          return;
        }

        if (profileList.length === 0) {
          log.app('No profiles found, showing setup screen');
          nav.setActivePage('data');
        } else if (profileList.length === 1) {
          log.app('Single profile found, showing profile page...');
          profileMgmt.setActiveProfile(profileList[0]);
          if (!isAutoTest) nav.setActivePage('profile');
        } else {
          const lastProfile = appState.lastProfileId
            ? profileList.find((p) => p.id === appState.lastProfileId)
            : null;
          if (lastProfile) {
            log.app(`Resuming last profile: ${lastProfile.name}`);
            profileMgmt.setActiveProfile(lastProfile);
            if (!isAutoTest) nav.setActivePage('profile');
          } else {
            nav.setActivePage('data');
          }
        }
      } catch (err) {
        log.error(`Startup failed: ${err}`);
        nav.setActivePage('data');
      } finally {
        setSettled(true);
      }
    })();
  }, []);

  return { settled };
};

export { useStartup };
