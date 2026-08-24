/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect } from 'react';
import { subscribeGameState, resetGame } from '../../lib/game';
import { useGameAssetsStore } from '@app/stores/game-assets-store';

const useGameLifecycle = () => {
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [configIni, setConfigIni] = useState<string | undefined>(undefined);
  const [gameCrashed, setGameCrashed] = useState(false);
  const markBooted = useGameAssetsStore((state) => state.markBooted);
  const clearBooted = useGameAssetsStore((state) => state.clearBooted);

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
    // These bytes were just read from disk, so this is the generation it plays.
    markBooted();
  }, [markBooted]);

  const stop = useCallback(async () => {
    await resetGame();
    setAssetData(null);
    setConfigIni(undefined);
    setGameCrashed(false);
    clearBooted();
  }, [clearBooted]);

  const clearGame = useCallback(() => {
    setAssetData(null);
    setConfigIni(undefined);
    setGameCrashed(false);
    clearBooted();
  }, [clearBooted]);

  return { isRunning, assetData, configIni, setGameData, stop, clearGame };
};

export { useGameLifecycle };
