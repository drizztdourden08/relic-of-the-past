/* @layer renderer-components @kind component */
import { useRef, useEffect, useState } from 'react';
import { Box, Text, Canvas } from '@drizztdourden08/tessera/primitives';
import { useGameState } from './behavior/useGameState';
import type { EdgeGlowRenderer, ShadowRenderer, ShadowCastingProject } from '@rotp/game-core';
import { useCanvasFit } from '../../hooks/useCanvasFit';
import { useShadowEditorStore } from '../../stores/shadow-editor-store';
import { ControllerDisconnectOverlay } from './sub-components/ControllerDisconnectOverlay';
import { ProfileSwitcherOverlay } from './sub-components/ProfileSwitcherOverlay';
import { useControllerOverlay } from './behavior/useControllerOverlay';
import { useProfileSwitcher } from './behavior/useProfileSwitcher';
import { useCanvasDisplaySize } from './behavior/useCanvasDisplaySize';
import { useCanvasBufferSize } from './behavior/useCanvasBufferSize';
import { useControllerPause } from './behavior/useControllerPause';
import { NavigationOverlay } from './sub-components/NavigationOverlay';
import { ShadowEditorOverlay } from './sub-components/ShadowEditorOverlay';
import { ShadowEditorPanel } from './sub-components/ShadowEditorPanel';
import { ShadowElementList } from './sub-components/ShadowElementList';
import { CheckToasts } from '../CheckToasts';
import { GameOverlay } from '../GameOverlay';
import { useEdgeGlowLoop } from './behavior/useEdgeGlowLoop';
import { useShadowCastingLoop } from './behavior/useShadowCastingLoop';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MANUAL_PAUSE_NAME, NORMAL_BLEND_STYLE } from './GameLayer.constants';
import './GameLayer.css';
import type { GameLayerProps } from './GameLayer.type';

const GameLayer = (props: GameLayerProps) => {
  const { assetData, configIni, profileId, stretch, pixelPerfect = false, edgeEffect = true, shadowCasting = false, developerToolsEnabled = false } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowRendererRef = useRef<EdgeGlowRenderer | null>(null);
  const shadowRendererRef = useRef<ShadowRenderer | null>(null);
  const shadowProjectRef = useRef<ShadowCastingProject | null>(null);
  const shadowCastingRef = useRef(shadowCasting);
  shadowCastingRef.current = shadowCasting;
  const edgeEffectRef = useRef(edgeEffect);
  edgeEffectRef.current = edgeEffect;
  const { status, error, start } = useGameState();
  const [canvasKey, setCanvasKey] = useState(0);
  const hasStartedRef = useRef(false);
  const { bufSize, setBufSize } = useCanvasBufferSize(canvasRef, status, canvasKey);
  const shadowDebugMode = useShadowEditorStore((s) => s.debugMode);

  const fitSize = useCanvasFit({ containerRef, bufW: bufSize.w, bufH: bufSize.h, stretch, pixelPerfect });

  useCanvasDisplaySize([canvasRef, fxCanvasRef, shadowCanvasRef], fitSize, status);

  useEdgeGlowLoop({ status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, edgeEffectRef, setBufSize });
  useShadowCastingLoop({ status, canvasKey, canvasRef, shadowCanvasRef, shadowRendererRef, shadowProjectRef, shadowCastingRef });

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

  const { controllerPaused, disconnectedName } = useControllerPause(status);
  const overlay = useControllerOverlay(controllerPaused);
  const profileSwitcher = useProfileSwitcher(status === 'running');
  const running = status === 'running';
  const isManualPause = !disconnectedName || disconnectedName === MANUAL_PAUSE_NAME;

  return (
    <Box className="game-layer" ref={containerRef}>
      {status === 'error' && (
        <Box className="game-layer__status-overlay">
          <Text className="game-layer__status-text game-layer__status-text--error">Error: {error}</Text>
        </Box>
      )}
      <Canvas
        key={canvasKey}
        ref={canvasRef}
        id="canvas"
        className={`game-layer__canvas${running ? ' game-layer__canvas--hidden' : ' game-layer__canvas--idle'}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        tabIndex={0}
      />
      <Canvas
        key={`fx-${canvasKey}`}
        ref={fxCanvasRef}
        className={`game-layer__fx-canvas${!running ? ' game-layer__fx-canvas--hidden' : ''}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <Canvas
        key={`shadow-${canvasKey}`}
        ref={shadowCanvasRef}
        className={`game-layer__shadow-canvas${!running ? ' game-layer__shadow-canvas--hidden' : ''}`}
        style={shadowDebugMode ? NORMAL_BLEND_STYLE : undefined}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      {controllerPaused && running && !isManualPause && (
        <ControllerDisconnectOverlay
          controllerName={disconnectedName}
          pauseMapping={overlay.pauseMapping}
          prevMapping={overlay.prevMapping}
          nextMapping={overlay.nextMapping}
          canSwitchProfile={overlay.canSwitchProfile}
          onResume={overlay.onResume}
        />
      )}
      {controllerPaused && running && isManualPause && (
        <Box className="game-layer__pause-overlay">
          <Box className="game-layer__pause-icon">
            <Box className="game-layer__pause-bar" />
            <Box className="game-layer__pause-bar" />
          </Box>
        </Box>
      )}
      {running && (
        <ProfileSwitcherOverlay
          open={profileSwitcher.open}
          profiles={profileSwitcher.profiles}
          activeId={profileSwitcher.activeId}
          prevMapping={profileSwitcher.prevMapping}
          nextMapping={profileSwitcher.nextMapping}
        />
      )}
      {running && <NavigationOverlay width={fitSize.width} height={fitSize.height} gameRunning={running} />}
      {running && developerToolsEnabled && <ShadowEditorOverlay width={fitSize.width} height={fitSize.height} gameRunning={running} />}
      {running && developerToolsEnabled && <ShadowEditorPanel />}
      {running && developerToolsEnabled && <ShadowElementList />}
      {running && <GameOverlay width={fitSize.width} height={fitSize.height} profileId={profileId} />}
      {running && <CheckToasts width={fitSize.width} height={fitSize.height} />}
    </Box>
  );
};

export { GameLayer };
