/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { nav, useBootStore, useNavigationStore } from '@drizztdourden08/brock-react';
import { releaseScreenshot } from '@app/boot/screenshot-frames/release-screenshot';
import { startPageRoute } from '@app/launch-flags/start-page';
import { startupFlag } from '@app/launch-flags/startup-flag';
import { HOME_HUB } from '../GameSession.constants';
import { RENDER_SETTLE_MS } from './auto-launch.constants';

const useOpenHubOnStart = (profileId: string | null): void => {
  const ready = useBootStore((s) => s.phase === 'ready');
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !ready || profileId === null || startupFlag('screenshot') !== 'hub') return;
    done.current = true;
    const route = startPageRoute();
    const idle = useNavigationStore.getState().active === null;
    if (route !== null) nav.open(route);
    else if (idle) nav.home(HOME_HUB);
    setTimeout(() => { void releaseScreenshot('hub'); }, RENDER_SETTLE_MS);
  }, [ready, profileId]);
};

export { useOpenHubOnStart };
