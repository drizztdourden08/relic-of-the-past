import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { syncAspectRatioLock } from './syncAspectRatioLock';

export const useDisplaySettings = (params: { isGameRunning: boolean }) => {
  const { isGameRunning } = params;

  const [windowMode, setWindowMode] = useState<GameSettings['windowMode']>('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportConstraint, setViewportConstraint] = useState<GameSettings['viewportConstraint']>('none');
  const [aspectRatio, setAspectRatio] = useState<GameSettings['aspectRatio']>('4:3');
  const [showFps, setShowFps] = useState(false);
  const [overworldEdgeEffect, setOverworldEdgeEffect] = useState(true);

  const handleWindowModeChange = useCallback((mode: GameSettings['windowMode']) => {
    setWindowMode(mode);
  }, []);

  const handleConstraintSettingsChange = useCallback((constraint: GameSettings['viewportConstraint'], ar: GameSettings['aspectRatio']) => {
    setViewportConstraint(constraint);
    setAspectRatio(ar);
  }, []);

  const handleDisplayPerfChange = useCallback((enabled: boolean) => {
    setShowFps(enabled);
  }, []);

  const handleEdgeEffectChange = useCallback((enabled: boolean) => {
    setOverworldEdgeEffect(enabled);
  }, []);

  // Track fullscreen state for aspect ratio lock
  useEffect(() => {
    window.api.isFullscreen().then(setIsFullscreen);
    return window.api.onFullscreenChange(setIsFullscreen);
  }, []);

  // Sync aspect ratio lock when settings change
  useEffect(() => {
    if (!isGameRunning) return;
    syncAspectRatioLock(viewportConstraint, aspectRatio, windowMode, isFullscreen);
  }, [isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen]);

  // Re-sync when game starts (canvas buffer dimensions become available)
  const vcRef = useRef(viewportConstraint);
  const arRef = useRef(aspectRatio);
  const wmRef = useRef(windowMode);
  const fsRef = useRef(isFullscreen);
  vcRef.current = viewportConstraint;
  arRef.current = aspectRatio;
  wmRef.current = windowMode;
  fsRef.current = isFullscreen;

  useEffect(() => {
    if (!isGameRunning) {
      if (vcRef.current === 'fit') {
        window.api.setAspectRatioLock(0, 0);
      }
      return;
    }
    if (vcRef.current !== 'fit') return;
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
      if ((canvas && canvas.width > 0 && canvas.height > 0) || attempts >= 30) {
        clearInterval(poll);
        syncAspectRatioLock(vcRef.current, arRef.current, wmRef.current, fsRef.current);
      }
    }, 100);
    return () => clearInterval(poll);
  }, [isGameRunning]);

  const initFromSettings = useCallback((settings: {
    windowMode: GameSettings['windowMode'];
    viewportConstraint: GameSettings['viewportConstraint'];
    aspectRatio: GameSettings['aspectRatio'];
    displayPerfInTitle: boolean;
    overworldEdgeEffect: boolean;
    startFullscreen: boolean;
  }) => {
    setWindowMode(settings.windowMode);
    setViewportConstraint(settings.viewportConstraint);
    setAspectRatio(settings.aspectRatio);
    setShowFps(settings.displayPerfInTitle);
    setOverworldEdgeEffect(settings.overworldEdgeEffect);
    if (settings.startFullscreen) {
      window.api.setFullscreen(true);
    }
  }, []);

  return {
    windowMode,
    isFullscreen,
    viewportConstraint,
    aspectRatio,
    showFps,
    overworldEdgeEffect,
    handleWindowModeChange,
    handleConstraintSettingsChange,
    handleDisplayPerfChange,
    handleEdgeEffectChange,
    initFromSettings,
  };
};
