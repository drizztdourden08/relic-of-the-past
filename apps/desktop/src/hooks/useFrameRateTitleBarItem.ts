/* @layer renderer-app @kind hook */
import { nav } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { effectiveHz } from '@shared/display/refresh-rate';
import { useFpsReadout } from './useFpsReadout';
import { useOptionalGameSession } from './useOptionalGameSession';
import { useRefreshRate } from './useRefreshRate';

const useFrameRateTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  const showFps = session?.display.showFps ?? false;
  const { fps } = useFpsReadout(showFps, session?.game.isRunning ?? false);
  const refreshHz = effectiveHz(useRefreshRate());
  if (!showFps || fps <= 0) return null;
  const status = `${fps} FPS${refreshHz !== null ? ` (${Math.round(refreshHz)} Hz)` : ''}`;
  return { kind: 'status', label: 'Frame rate', icon: 'monitor', status, onSelect: () => nav.open('game/display') };
};

export { useFrameRateTitleBarItem };
