/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { isAutomationLaunch, nav, useBootStore, useNavigationStore } from '@drizztdourden08/brock-react';
import { screenshotHold } from '@app/boot/screenshot-hold';
import { startupFlag } from '@app/startup/startup-flag';
import { HOME_HUB } from '../GameSession.constants';
import { RENDER_SETTLE_MS } from './auto-launch.constants';

const useOpenHubOnStart = (profileId: string | null): void => {
  const ready = useBootStore((s) => s.phase === 'ready');
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !ready || profileId === null) return;
    done.current = true;
    const idle = useNavigationStore.getState().active === null;
    if (startupFlag('screenshot') === 'hub') {
      if (idle) nav.home(HOME_HUB);
      setTimeout(screenshotHold.release, RENDER_SETTLE_MS);
      return;
    }
    if (isAutomationLaunch() || !idle) return;
    nav.home(HOME_HUB);
  }, [ready, profileId]);
};

export { useOpenHubOnStart };
