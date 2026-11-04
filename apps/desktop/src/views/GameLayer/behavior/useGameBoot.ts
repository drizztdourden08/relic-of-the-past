/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import { getGameState } from '../../../game';
import type { GameBootParams } from './useGameBoot.type';

const useGameBoot = (params: GameBootParams): void => {
  const { status, canvasKey, canvasRef, assetData, configIni, profileId, start, setCanvasKey } = params;
  const bootedKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'idle') return;
    if (bootedKeyRef.current === canvasKey) {
      if (getGameState().status === 'idle') setCanvasKey((k) => k + 1);
      return;
    }
    if (!assetData || !canvasRef.current) return;
    bootedKeyRef.current = canvasKey;
    void start(canvasRef.current, assetData, configIni, profileId);
  }, [assetData, status, start, configIni, profileId, canvasKey]);
};

export { useGameBoot };
