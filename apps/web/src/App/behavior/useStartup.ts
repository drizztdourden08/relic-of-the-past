/* @layer renderer-appshell @kind hook */
import { useEffect, useState } from 'react';
import { log } from '../../lib/log-bus';
import { applySpritesForRom } from '../../lib/sprites/apply-sprites-for-rom';
import { getAppState } from '../../lib/storage/profile-store';
import { instanceProfile } from '../../lib/instance';
import type { PageId } from '../types';

const useStartup = (
  profileMgmt: {
    refreshProfilesAndRoms: () => Promise<{ profiles: Profile[]; romStatuses: RomInfo[] }>;
    setActiveProfile: (p: Profile | null) => void;
  },
  nav: { setActivePage: (page: PageId) => void },
) => {
  // Startup owns which page the app lands on, so it also owns the moment the shell
  // stops moving — which is what useShellReady waits for before revealing the window.
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
        // Automation launches (--fresh, --sim-run, --dump-*, --auto-state, --screenshot,
        // --instance) start straight in the game view with no home/profile menu in the
        // way — the game only reaches 'running' on the game view, which the sim waits for.
        const wanted = instanceProfile();
        const isAutoTest = testArgs.autoState !== null || !!testArgs.screenshot || dumpSlot !== null || dumpNavSlot !== null || simRun !== null || window.api.startup.fresh || wanted !== null;

        // A named instance pins its own profile, matched by id first then by name. An
        // unknown name stops here rather than falling through to the user's profile: a
        // run that silently used the wrong save data is worse than one that fails.
        if (wanted !== null) {
          const pinned = profileList.find((p) => p.id === wanted) ?? profileList.find((p) => p.name === wanted);
          if (!pinned) {
            log.error(`Instance profile "${wanted}" not found — run "npm run wt -- new" to provision it`);
            nav.setActivePage('data');
            return;
          }
          log.app(`Instance profile: ${pinned.name}`);
          profileMgmt.setActiveProfile(pinned);
          void applySpritesForRom(pinned.romFile);
          return;
        }

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
      } finally {
        // Every exit path above, including the early returns — a boot that failed still
        // has to end with a visible window.
        setSettled(true);
      }
    })();
  }, []);

  return { settled };
};

export { useStartup };
