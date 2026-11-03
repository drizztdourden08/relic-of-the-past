/* @layer renderer-app @kind hook */
import { nav } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useFpsAndRefreshRate } from './useFpsAndRefreshRate';

const useFrameRateTitleBarItem = (): TitleBarItemSpec | null => {
  const { showFps, fps, refreshHz } = useFpsAndRefreshRate();
  if (!showFps || fps <= 0) return null;
  const status = `${fps} FPS${refreshHz !== null ? ` (${Math.round(refreshHz)} Hz)` : ''}`;
  return { kind: 'status', label: 'Frame rate', icon: 'monitor', status, onSelect: () => nav.open('game/picture') };
};

export { useFrameRateTitleBarItem };
