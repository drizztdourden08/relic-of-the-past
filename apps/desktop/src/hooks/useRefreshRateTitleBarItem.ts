/* @layer renderer-app @kind hook */
import { nav } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { effectiveHz, isSyncedRate } from '@drizztdourden08/brock-display';
import { useRefreshRate } from '@drizztdourden08/brock-display/renderer';
import { useFpsReadout } from './useFpsReadout';
import { useOptionalGameSession } from './useOptionalGameSession';
import { REFRESH_RATE_HINT } from './useRefreshRateTitleBarItem.constants';

const useRefreshRateTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  const showFps = session?.display.showFps ?? false;
  const { fps } = useFpsReadout(showFps, session?.game.isRunning ?? false);
  const refreshHz = effectiveHz(useRefreshRate());
  if (fps <= 0 || refreshHz === null || isSyncedRate(refreshHz)) return null;
  return { kind: 'status', label: REFRESH_RATE_HINT, icon: 'triangle-alert', status: 'Incompatible refresh rate', tone: 'danger', onSelect: () => nav.open('game/display') };
};

export { useRefreshRateTitleBarItem };
