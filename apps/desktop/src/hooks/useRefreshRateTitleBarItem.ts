/* @layer renderer-app @kind hook */
import { nav, useT } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { isSyncedRate } from '@drizztdourden08/brock-display';
import { useFpsAndRefreshRate } from './useFpsAndRefreshRate';

const useRefreshRateTitleBarItem = (): TitleBarItemSpec | null => {
  const { fps, refreshHz } = useFpsAndRefreshRate();
  const t = useT();
  if (fps <= 0 || refreshHz === null || isSyncedRate(refreshHz)) return null;
  return {
    kind: 'status',
    label: t('views-game-layer:title-bar.refresh-rate-hint'),
    icon: 'triangle-alert',
    status: t('views-game-layer:title-bar.refresh-rate-status'),
    tone: 'danger',
    onSelect: () => nav.open('game/display'),
  };
};

export { useRefreshRateTitleBarItem };
