/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { isAutomationLaunch, nav, useBootStore, useNavigationStore } from '@drizztdourden08/brock-react';
import { HOME_HUB } from '../GameSession.constants';

const useOpenHubOnStart = (profileId: string | null): void => {
  const ready = useBootStore((s) => s.phase === 'ready');
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !ready || profileId === null) return;
    done.current = true;
    if (isAutomationLaunch() || useNavigationStore.getState().active !== null) return;
    nav.home(HOME_HUB);
  }, [ready, profileId]);
};

export { useOpenHubOnStart };
