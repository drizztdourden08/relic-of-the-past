import { useState, useCallback, useRef } from 'react';
import {
  startGame,
  getGameState,
  subscribeGameState,
  type GameStatus,
} from '../../../../lib/game';
import { useEffect } from 'react';

export function useGameState() {
  const [status, setStatus] = useState<GameStatus>(() => getGameState().status);
  const [error, setError] = useState<string | null>(() => getGameState().error);
  const startedRef = useRef(false);

  useEffect(() => {
    return subscribeGameState((state) => {
      setStatus(state.status);
      setError(state.error);
    });
  }, []);

  // Reset the guard when status goes back to idle (e.g. after crash + new asset data)
  useEffect(() => {
    if (status === 'idle') startedRef.current = false;
  }, [status]);

  const start = useCallback(
    async (canvas: HTMLCanvasElement, data: Uint8Array, configIni?: string, profileId?: string) => {
      if (startedRef.current) return;
      startedRef.current = true;
      await startGame(canvas, data, configIni, profileId);
    },
    [],
  );

  return { status, error, start };
}
