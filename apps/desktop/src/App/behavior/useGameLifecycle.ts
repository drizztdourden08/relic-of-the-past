import { useState, useCallback, useEffect } from 'react';
import { subscribeGameState, resetGame, getInputManager } from '../../lib/game';

export const useGameLifecycle = (params: {
  activeProfile: Profile | null;
  activePage: string;
  showSpriteDebug: boolean;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}) => {
  const { activeProfile, activePage, showSpriteDebug, loadProfileForGame } = params;

  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [gameCrashed, setGameCrashed] = useState(false);

  const isGameRunning = assetData != null && !gameCrashed;

  // Subscribe to game state for crash detection
  useEffect(() => {
    return subscribeGameState((state) => {
      if (state.status === 'error') {
        setGameCrashed(true);
      }
    });
  }, []);

  // Input suppression: disable game input when menus/settings/overlays are open
  useEffect(() => {
    const gameActive = isGameRunning && activePage === 'none' && !showSpriteDebug;
    getInputManager().setInputSuppressed(!gameActive);
  }, [activePage, isGameRunning, showSpriteDebug]);

  const handleStartGame = useCallback(() => {
    if (activeProfile) {
      loadProfileForGame(activeProfile);
    }
  }, [activeProfile, loadProfileForGame]);

  const handleStopGame = useCallback(() => {
    resetGame();
    setAssetData(null);
    setGameCrashed(false);
  }, []);

  const handleResetGame = useCallback(() => {
    if (activeProfile) {
      resetGame();
      setAssetData(null);
      setGameCrashed(false);
      loadProfileForGame(activeProfile);
    }
  }, [activeProfile, loadProfileForGame]);

  const clearGame = useCallback(() => {
    setAssetData(null);
    setGameCrashed(false);
  }, []);

  const startGame = useCallback((data: Uint8Array) => {
    setAssetData(data);
  }, []);

  const resetCrash = useCallback(() => {
    resetGame();
    setGameCrashed(false);
    setAssetData(null);
  }, []);

  return {
    assetData,
    isGameRunning,
    gameCrashed,
    handleStartGame,
    handleStopGame,
    handleResetGame,
    clearGame,
    startGame,
    resetCrash,
  };
};
