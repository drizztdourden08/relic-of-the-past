/* @layer renderer-components @kind component */
import { useRef, useEffect, useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Canvas } from '../../../../design-system/primitives/Canvas';
import { useGameState } from './behavior/useGameState';
import { getInputManager } from '../../../../../lib/game';
import type { EdgeGlowRenderer } from '../../../../../lib/game/edge-glow';
import type { ShadowRenderer } from '../../../../../lib/game/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { useCanvasFit } from '../../../../../hooks/useCanvasFit';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import { useExclusiveInsetsStore } from '../../../../../stores/exclusive-insets-store';
import { ControllerDisconnectOverlay } from './sub-components/ControllerDisconnectOverlay';
import { ProfileSwitcherOverlay } from './sub-components/ProfileSwitcherOverlay';
import { useControllerOverlay } from './behavior/useControllerOverlay';
import { useProfileSwitcher } from './behavior/useProfileSwitcher';
import { NavigationOverlay } from './sub-components/navigation-overlay';
import { ShadowEditorOverlay } from './sub-components/ShadowEditorOverlay';
import { ShadowEditorPanel } from './sub-components/ShadowEditorPanel';
import { ShadowElementList } from './sub-components/ShadowElementList';
import { GameOverlay } from '../GameOverlay';
import { useEdgeGlowLoop } from './behavior/useEdgeGlowLoop';
import { useShadowCastingLoop } from './behavior/useShadowCastingLoop';
import './GameLayer.css';
import type { GameLayerProps } from './GameLayer.type';

const GameLayer = (props: GameLayerProps) => {
  const { assetData, configIni, profileId, stretch, pixelPerfect = false, edgeEffect = true, shadowCasting = false } = props;
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
  const [controllerPaused, setControllerPaused] = useState(false);
  const [disconnectedName, setDisconnectedName] = useState('');
  const [bufSize, setBufSize] = useState({ w: 512, h: 448 });
  const shadowDebugMode = useShadowEditorStore((s) => s.debugMode);

  // Exclusive insets from widget layout (shrink game area when docked widgets claim space)
  const exclusiveInsets = useExclusiveInsetsStore((s) => s.insets);

  // Compute fitted size using shared hook (same formula for canvas + overlay)
  const fitSize = useCanvasFit({ containerRef, bufW: bufSize.w, bufH: bufSize.h, stretch, pixelPerfect });

  // Apply fitted size to canvases (they need direct DOM style manipulation).
  // Depends on `status` because SDL/Emscripten removes inline styles during
  // WASM initialization — we must re-apply after it transitions to 'running'.
  useEffect(() => {
    const applyStyles = () => {
      const canvas = canvasRef.current;
      const fxCanvas = fxCanvasRef.current;
      const shadowCanvas = shadowCanvasRef.current;
      if (canvas) {
        canvas.style.width = `${fitSize.width}px`;
        canvas.style.height = `${fitSize.height}px`;
      }
      if (fxCanvas) {
        fxCanvas.style.width = `${fitSize.width}px`;
        fxCanvas.style.height = `${fitSize.height}px`;
      }
      if (shadowCanvas) {
        shadowCanvas.style.width = `${fitSize.width}px`;
        shadowCanvas.style.height = `${fitSize.height}px`;
      }
    };
    applyStyles();
    // Re-apply after a frame to override any SDL style manipulation during init
    if (status === 'running') {
      const id = requestAnimationFrame(applyStyles);
      return () => cancelAnimationFrame(id);
    }
  }, [fitSize, status]);

  // Sync buffer size from canvas after WASM starts (SDL may change canvas.width/height)
  useEffect(() => {
    if (status !== 'running') return;
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas && (canvas.width !== bufSize.w || canvas.height !== bufSize.h)) {
        setBufSize({ w: canvas.width, h: canvas.height });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [status, canvasKey]);

  // Edge-glow + shadow-casting shader render loops (extracted to focused hooks)
  useEdgeGlowLoop({ status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, edgeEffectRef, setBufSize });
  useShadowCastingLoop({ status, canvasKey, canvasRef, shadowCanvasRef, shadowRendererRef, shadowProjectRef, shadowCastingRef });

  useEffect(() => {
    if (assetData && status === 'idle' && canvasRef.current) {
      hasStartedRef.current = true;
      start(canvasRef.current, assetData, configIni, profileId);
    }
  }, [assetData, status, start, configIni, profileId, canvasKey]);

  // Force a new canvas element when returning to idle AFTER a game has run.
  // Skip the initial mount — only needed after crash/reset.
  useEffect(() => {
    if (status === 'idle' && hasStartedRef.current) {
      setCanvasKey((k) => k + 1);
    }
  }, [status]);

  // ─── Controller disconnect pause/resume ───
  useEffect(() => {
    if (status !== 'running') return;
    const inputMgr = getInputManager();
    const unsub = inputMgr.onPauseChange((paused, name) => {
      setControllerPaused(paused);
      setDisconnectedName(name);
    });
    return unsub;
  }, [status]);

  // On game start, verify the profile's mapped controller is actually present.
  // Delay so HID enumeration / gamepad activation has a moment to populate.
  useEffect(() => {
    if (status !== 'running') return;
    const id = setTimeout(() => getInputManager().checkControllerPresence(), 800);
    return () => clearTimeout(id);
  }, [status]);

  const overlay = useControllerOverlay(controllerPaused);
  const profileSwitcher = useProfileSwitcher(status === 'running');

  return (
    <Box
      className="game-layer"
      ref={containerRef}
      style={
        (exclusiveInsets.left || exclusiveInsets.right || exclusiveInsets.top || exclusiveInsets.bottom)
          ? { left: exclusiveInsets.left, right: exclusiveInsets.right, top: exclusiveInsets.top, bottom: exclusiveInsets.bottom }
          : undefined
      }
    >
      {status === 'error' && (
        <Box className="game-layer__status-overlay">
          <Text className="game-layer__status-text game-layer__status-text--error">Error: {error}</Text>
        </Box>
      )}
      <Canvas
        key={canvasKey}
        ref={canvasRef}
        id="canvas"
        className={`game-layer__canvas${status === 'running' ? ' game-layer__canvas--hidden' : ' game-layer__canvas--idle'}`}
        width={512}
        height={448}
        tabIndex={0}
      />
      <Canvas
        key={`fx-${canvasKey}`}
        ref={fxCanvasRef}
        className={`game-layer__fx-canvas${status !== 'running' ? ' game-layer__fx-canvas--hidden' : ''}`}
        width={512}
        height={448}
      />
      <Canvas
        key={`shadow-${canvasKey}`}
        ref={shadowCanvasRef}
        className={`game-layer__shadow-canvas${status !== 'running' ? ' game-layer__shadow-canvas--hidden' : ''}`}
        style={shadowDebugMode ? { mixBlendMode: 'normal' } : undefined}
        width={512}
        height={448}
      />

      {controllerPaused && status === 'running' && disconnectedName && disconnectedName !== 'Manual pause' && (
        <ControllerDisconnectOverlay
          controllerName={disconnectedName}
          pauseMapping={overlay.pauseMapping}
          prevMapping={overlay.prevMapping}
          nextMapping={overlay.nextMapping}
          canSwitchProfile={overlay.canSwitchProfile}
          onResume={overlay.onResume}
        />
      )}
      {controllerPaused && status === 'running' && (!disconnectedName || disconnectedName === 'Manual pause') && (
        <Box className="game-layer__pause-overlay">
          <Box className="game-layer__pause-icon">
            <Box className="game-layer__pause-bar" />
            <Box className="game-layer__pause-bar" />
          </Box>
        </Box>
      )}
      {status === 'running' && (
        <ProfileSwitcherOverlay
          open={profileSwitcher.open}
          profiles={profileSwitcher.profiles}
          activeId={profileSwitcher.activeId}
          prevMapping={profileSwitcher.prevMapping}
          nextMapping={profileSwitcher.nextMapping}
        />
      )}
      {status === 'running' && <NavigationOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorPanel />}
      {status === 'running' && <ShadowElementList />}
      {status === 'running' && <GameOverlay width={fitSize.width} height={fitSize.height} />}
    </Box>
  );
};

export { GameLayer };
