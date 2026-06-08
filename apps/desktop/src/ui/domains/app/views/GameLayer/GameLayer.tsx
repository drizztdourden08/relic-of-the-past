/* @layer renderer-components @kind component */
import { useRef, useEffect, useState } from 'react';
import { useGameState } from './behavior/useGameState';
import { getInputManager } from '../../../../../lib/game';
import type { EdgeGlowRenderer } from '../../../../../lib/game/edge-glow';
import type { ShadowRenderer } from '../../../../../lib/game/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { useCanvasFit } from '../../../../../hooks/useCanvasFit';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import { useExclusiveInsetsStore } from '../../../../design-system/composites/Widget/behavior/exclusiveInsetsStore';
import { ControllerDisconnectOverlay } from './sub-components/ControllerDisconnectOverlay';
import { NavigationOverlay } from './sub-components/navigation-overlay';
import { ShadowEditorOverlay } from './sub-components/ShadowEditorOverlay';
import { ShadowEditorPanel } from './sub-components/ShadowEditorPanel';
import { ShadowElementList } from './sub-components/ShadowElementList';
import { GameOverlay } from '../GameOverlay';
import { useEdgeGlowLoop } from './behavior/useEdgeGlowLoop';
import { useShadowCastingLoop } from './behavior/useShadowCastingLoop';
import './GameLayer.css';
import type { GameLayerProps } from './types';

const GameLayer = (props: GameLayerProps) => {
  const { assetData, configIni, profileId, stretch, edgeEffect = true, shadowCasting = false } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowRendererRef = useRef<EdgeGlowRenderer | null>(null);
  const shadowRendererRef = useRef<ShadowRenderer | null>(null);
  const shadowProjectRef = useRef<ShadowCastingProject | null>(null);
  const shadowCastingRef = useRef(shadowCasting);
  shadowCastingRef.current = shadowCasting;
  const rafIdRef = useRef<number>(0);
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
  const fitSize = useCanvasFit(containerRef, bufSize.w, bufSize.h, stretch);

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
  useEdgeGlowLoop({ status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, rafIdRef, edgeEffectRef, setBufSize });
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

  // Double-click canvas to resume from pause
  useEffect(() => {
    if (status !== 'running') return;

    const handleDblClick = () => {
      const inputMgr = getInputManager();
      if (inputMgr.isPaused()) {
        inputMgr.resume();
      }
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('dblclick', handleDblClick);

    return () => {
      canvas?.removeEventListener('dblclick', handleDblClick);
    };
  }, [status, canvasKey]);

  return (
    <div
      className="game-layer"
      ref={containerRef}
      style={
        (exclusiveInsets.left || exclusiveInsets.right || exclusiveInsets.top || exclusiveInsets.bottom)
          ? { left: exclusiveInsets.left, right: exclusiveInsets.right, top: exclusiveInsets.top, bottom: exclusiveInsets.bottom }
          : undefined
      }
    >
      {status === 'loading' && (
        <div className="game-layer__status-overlay">
          <span className="game-layer__status-text game-layer__status-text--loading">Loading WASM core...</span>
        </div>
      )}
      {status === 'error' && (
        <div className="game-layer__status-overlay">
          <span className="game-layer__status-text game-layer__status-text--error">Error: {error}</span>
        </div>
      )}
      <canvas
        key={canvasKey}
        ref={canvasRef}
        id="canvas"
        className={`game-layer__canvas${status === 'running' ? ' game-layer__canvas--hidden' : ' game-layer__canvas--idle'}`}
        width={512}
        height={448}
        tabIndex={0}
      />
      <canvas
        key={`fx-${canvasKey}`}
        ref={fxCanvasRef}
        className={`game-layer__fx-canvas${status !== 'running' ? ' game-layer__fx-canvas--hidden' : ''}`}
        width={512}
        height={448}
      />
      <canvas
        key={`shadow-${canvasKey}`}
        ref={shadowCanvasRef}
        className={`game-layer__shadow-canvas${status !== 'running' ? ' game-layer__shadow-canvas--hidden' : ''}`}
        style={shadowDebugMode ? { mixBlendMode: 'normal' } : undefined}
        width={512}
        height={448}
      />

      {controllerPaused && status === 'running' && disconnectedName && disconnectedName !== 'Manual pause' && (
        <ControllerDisconnectOverlay controllerName={disconnectedName} />
      )}
      {controllerPaused && status === 'running' && (!disconnectedName || disconnectedName === 'Manual pause') && (
        <div className="game-layer__pause-overlay">
          <div className="game-layer__pause-icon">
            <div className="game-layer__pause-bar" />
            <div className="game-layer__pause-bar" />
          </div>
        </div>
      )}
      {status === 'running' && <NavigationOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorPanel />}
      {status === 'running' && <ShadowElementList />}
      {status === 'running' && <GameOverlay width={fitSize.width} height={fitSize.height} />}
    </div>
  );
};

export { GameLayer };
