/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@rotp/features';
import { usePlatform } from '@drizztdourden08/brock-react';
import { syncAspectRatioLock } from './sync-aspect-ratio-lock';
import { CANVAS_POLL_ATTEMPTS, CANVAS_POLL_MS } from './useDisplaySettings.constants';

const useDisplaySettings = (params: { isGameRunning: boolean }) => {
  const { isGameRunning } = params;
  const { window: win } = usePlatform();

  const [windowMode, setWindowMode] = useState<GameSettings['windowMode']>('windowed');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportConstraint, setViewportConstraint] = useState<GameSettings['viewportConstraint']>('none');
  const [aspectRatio, setAspectRatio] = useState<GameSettings['aspectRatio']>('4:3');
  const [showFps, setShowFps] = useState(false);
  const [overworldEdgeEffect, setOverworldEdgeEffect] = useState(true);
  const [postProcessingShadows, setPostProcessingShadows] = useState(false);
  const [pixelPerfect, setPixelPerfect] = useState(false);

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

  const handleShadowCastingChange = useCallback((enabled: boolean) => {
    setPostProcessingShadows(enabled);
  }, []);

  const handlePixelPerfectChange = useCallback((enabled: boolean) => {
    setPixelPerfect(enabled);
  }, []);

  useEffect(() => {
    void win.isFullscreen().then(setIsFullscreen);
    return win.onFullscreenChange(setIsFullscreen);
  }, [win]);

  useEffect(() => {
    if (!isGameRunning) return;
    syncAspectRatioLock(win, viewportConstraint, aspectRatio, windowMode, isFullscreen);
  }, [win, isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen]);

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
        win.setAspectRatioLock(0, 0);
      }
      return;
    }
    if (vcRef.current !== 'fit') return;
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const canvas = document.querySelector<HTMLCanvasElement>('.game-layer__canvas');
      if ((canvas && canvas.width > 0 && canvas.height > 0) || attempts >= CANVAS_POLL_ATTEMPTS) {
        clearInterval(poll);
        syncAspectRatioLock(win, vcRef.current, arRef.current, wmRef.current, fsRef.current);
      }
    }, CANVAS_POLL_MS);
    return () => clearInterval(poll);
  }, [win, isGameRunning]);

  const initFromSettings = useCallback((settings: {
    windowMode: GameSettings['windowMode'];
    viewportConstraint: GameSettings['viewportConstraint'];
    aspectRatio: GameSettings['aspectRatio'];
    displayPerfInTitle: boolean;
    overworldEdgeEffect: boolean;
    postProcessingShadows: boolean;
    startFullscreen: boolean;
    pixelPerfect: boolean;
  }) => {
    setWindowMode(settings.windowMode);
    setViewportConstraint(settings.viewportConstraint);
    setAspectRatio(settings.aspectRatio);
    setShowFps(settings.displayPerfInTitle);
    setOverworldEdgeEffect(settings.overworldEdgeEffect);
    setPostProcessingShadows(settings.postProcessingShadows);
    setPixelPerfect(settings.pixelPerfect);
    if (settings.startFullscreen) {
      win.setFullscreen(true);
    }
  }, [win]);

  return {
    windowMode,
    isFullscreen,
    viewportConstraint,
    aspectRatio,
    showFps,
    overworldEdgeEffect,
    postProcessingShadows,
    pixelPerfect,
    handleWindowModeChange,
    handleConstraintSettingsChange,
    handleDisplayPerfChange,
    handleEdgeEffectChange,
    handleShadowCastingChange,
    handlePixelPerfectChange,
    initFromSettings,
  };
};

export { useDisplaySettings };
