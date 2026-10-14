/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { GameSettings } from '@rotp/features';
import { usePlatform } from '@drizztdourden08/brock-react';
import { useFullscreenState } from './useFullscreenState';
import { useAspectRatioLock } from './useAspectRatioLock';
import type { DisplayInit } from './useDisplaySettings.type';

const useDisplaySettings = (params: { isGameRunning: boolean }) => {
  const { isGameRunning } = params;
  const { window: win } = usePlatform();

  const [windowMode, setWindowMode] = useState<GameSettings['windowMode']>('windowed');
  const [viewportConstraint, setViewportConstraint] = useState<GameSettings['viewportConstraint']>('none');
  const [aspectRatio, setAspectRatio] = useState<GameSettings['aspectRatio']>('4:3');
  const [showFps, setShowFps] = useState(false);
  const [overworldEdgeEffect, setOverworldEdgeEffect] = useState(true);
  const [postProcessingShadows, setPostProcessingShadows] = useState(false);
  const [pixelPerfect, setPixelPerfect] = useState(false);
  const isFullscreen = useFullscreenState(win);

  const handleConstraintSettingsChange = useCallback((constraint: GameSettings['viewportConstraint'], ar: GameSettings['aspectRatio']) => {
    setViewportConstraint(constraint);
    setAspectRatio(ar);
  }, []);

  useAspectRatioLock({ win, isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen });

  const initFromSettings = useCallback((settings: DisplayInit) => {
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
    handleWindowModeChange: setWindowMode,
    handleConstraintSettingsChange,
    handleDisplayPerfChange: setShowFps,
    handleEdgeEffectChange: setOverworldEdgeEffect,
    handleShadowCastingChange: setPostProcessingShadows,
    handlePixelPerfectChange: setPixelPerfect,
    initFromSettings,
  };
};

export { useDisplaySettings };
