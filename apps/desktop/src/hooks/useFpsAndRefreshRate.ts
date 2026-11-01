/* @layer renderer-app @kind hook */
import { effectiveHz } from '@drizztdourden08/brock-display';
import { useRefreshRate } from '@drizztdourden08/brock-display/renderer';
import { useFpsReadout } from './useFpsReadout';
import { useOptionalGameSession } from './useOptionalGameSession';

const useFpsAndRefreshRate = (): { showFps: boolean; fps: number; refreshHz: number | null } => {
  const session = useOptionalGameSession();
  const showFps = session?.display.showFps ?? false;
  const { fps } = useFpsReadout(showFps, session?.game.isRunning ?? false);
  const refreshHz = effectiveHz(useRefreshRate());
  return { showFps, fps, refreshHz };
};

export { useFpsAndRefreshRate };
