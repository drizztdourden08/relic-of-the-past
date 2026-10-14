/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import type { GameBootParams } from './useGameBoot.type';

const useGameBoot = (params: GameBootParams): void => {
  const { status, canvasKey, canvasRef, hasStartedRef, assetData, configIni, profileId, start, setCanvasKey } = params;

  useEffect(() => {
    if (assetData && status === 'idle' && canvasRef.current) {
      hasStartedRef.current = true;
      void start(canvasRef.current, assetData, configIni, profileId);
    }
  }, [assetData, status, start, configIni, profileId, canvasKey]);

  useEffect(() => {
    const returnedToIdleAfterRun = status === 'idle' && hasStartedRef.current;
    if (returnedToIdleAfterRun) {
      setCanvasKey((k) => k + 1);
    }
  }, [status]);
};

export { useGameBoot };
