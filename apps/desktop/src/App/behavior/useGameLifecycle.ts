import { useState, useCallback, useEffect } from 'react';
import { subscribeGameState, resetGame } from '../../lib/game';

const useGameLifecycle = () => {
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [configIni, setConfigIni] = useState<string | undefined>(undefined);
  const [gameCrashed, setGameCrashed] = useState(false);

  const isRunning = assetData != null && !gameCrashed;

  useEffect(() => {
    return subscribeGameState((state) => {
      if (state.status === 'error') {
        setGameCrashed(true);
      }
    });
  }, []);

  const setGameData = useCallback((data: Uint8Array, ini?: string) => {
    setAssetData(data);
    setConfigIni(ini);
    setGameCrashed(false);
  }, []);

  const stop = useCallback(() => {
    resetGame();
    setAssetData(null);
    setConfigIni(undefined);
    setGameCrashed(false);
  }, []);

  const clearGame = useCallback(() => {
    setAssetData(null);
    setConfigIni(undefined);
    setGameCrashed(false);
  }, []);

  return { isRunning, assetData, configIni, setGameData, stop, clearGame };
};

export { useGameLifecycle };
