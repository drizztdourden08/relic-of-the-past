/* @layer renderer-app @kind hook */
import { nav, useT } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useFpsAndRefreshRate } from './useFpsAndRefreshRate';

const useFrameRateTitleBarItem = (): TitleBarItemSpec | null => {
  const { showFps, fps, refreshHz } = useFpsAndRefreshRate();
  const t = useT();
  if (!showFps || fps <= 0) return null;
  const status = `${fps} FPS${refreshHz !== null ? ` (${Math.round(refreshHz)} Hz)` : ''}`;
  return { kind: 'status', label: t('views-game-layer:title-bar.frame-rate'), icon: 'monitor', status, onSelect: () => nav.open('game/picture') };
};

export { useFrameRateTitleBarItem };
