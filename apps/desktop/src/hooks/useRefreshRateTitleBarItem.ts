/* @layer renderer-app @kind hook */
import { nav } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { effectiveHz, isSyncedRate } from '@shared/display/refresh-rate';
import { useOptionalGameSession } from './useOptionalGameSession';
import { useRefreshRate } from './useRefreshRate';
import { REFRESH_RATE_HINT } from './useRefreshRateTitleBarItem.constants';

const useRefreshRateTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  const refreshHz = effectiveHz(useRefreshRate());
  if (!session?.display.showFps || refreshHz === null || isSyncedRate(refreshHz)) return null;
  return { kind: 'status', label: REFRESH_RATE_HINT, icon: 'triangle-alert', status: 'Incompatible refresh rate', tone: 'danger', onSelect: () => nav.open('game/display') };
};

export { useRefreshRateTitleBarItem };
