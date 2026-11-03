/* @layer renderer-app @kind hook */
import { nav } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { isSyncedRate } from '@drizztdourden08/brock-display';
import { useFpsAndRefreshRate } from './useFpsAndRefreshRate';
import { REFRESH_RATE_HINT } from './refresh-rate-title-bar-item.constants';

const useRefreshRateTitleBarItem = (): TitleBarItemSpec | null => {
  const { fps, refreshHz } = useFpsAndRefreshRate();
  if (fps <= 0 || refreshHz === null || isSyncedRate(refreshHz)) return null;
  return { kind: 'status', label: REFRESH_RATE_HINT, icon: 'triangle-alert', status: 'Incompatible refresh rate', tone: 'danger', onSelect: () => nav.open('game/display') };
};

export { useRefreshRateTitleBarItem };
