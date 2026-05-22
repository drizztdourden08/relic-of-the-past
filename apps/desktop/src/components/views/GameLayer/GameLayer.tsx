import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from './behavior/useGameState';
import { getInputManager, wasmGetViewportInfo, wasmRenderCleanFrame } from '../../../lib/game';
import { createEdgeGlowRenderer, type EdgeGlowRenderer } from '../../../lib/game/edge-glow';
import { createShadowRenderer, type ShadowRenderer } from '../../../lib/game/shadow-casting';
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';
import { useCanvasFit } from '../../../hooks/useCanvasFit';
import { useShadowEditorStore } from '../../../stores/shadow-editor-store';
import { ControllerDisconnectOverlay } from './sub-components/ControllerDisconnectOverlay';
import { ConnectionOverlay } from './sub-components/ConnectionOverlay';
import { ShadowEditorOverlay } from './sub-components/ShadowEditorOverlay';
import { ShadowEditorPanel } from './sub-components/ShadowEditorPanel';
import { GameOverlay } from '../GameOverlay';
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

  // ─── Edge glow shader render loop ───
  useEffect(() => {
    if (status !== 'running') return;
    const gameCanvas = canvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!gameCanvas || !fxCanvas) return;

    // Wait a frame for SDL to set canvas dimensions
    const initId = requestAnimationFrame(() => {
      // Match FX canvas buffer to game canvas buffer
      fxCanvas.width = gameCanvas.width;
      fxCanvas.height = gameCanvas.height;

      const renderer = createEdgeGlowRenderer(fxCanvas);
      if (!renderer) return;
      glowRendererRef.current = renderer;

      // Screen transition fade state
      let prevBlackLeft = -1;
      let prevBlackRight = -1;
      let fadeOpacity = 1.0;
      let fadeTarget = 1.0;
      const FADE_SPEED = 4.0; // per second (0→1 in 250ms)
      let lastTime = 0;

      const loop = (time: number) => {
        const dt = lastTime > 0 ? (time - lastTime) / 1000 : 0;
        lastTime = time;
        // Sync buffer size if game canvas changed (e.g. aspect ratio switch)
        if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
          fxCanvas.width = gameCanvas.width;
          fxCanvas.height = gameCanvas.height;
          setBufSize({ w: gameCanvas.width, h: gameCanvas.height });
        }

        // Query WASM for precise viewport info
        const vp = wasmGetViewportInfo();
        if (vp) {
          // Use locationModule (physical location, unaffected by text/menu overlays)
          // so effects persist during telepathy, NPC dialogue, etc.
          const hasExtended = vp.extraLeftRight > 0 || (vp.snesHeight === 240);
          const isOverworld = vp.locationModule === 9;
          if (isOverworld && hasExtended && edgeEffectRef.current) {
            renderer.setEnabled(true);
          } else if (!edgeEffectRef.current || !isOverworld) {
            renderer.setEnabled(false);
          }
          // Only update bounds when on overworld — freeze during text/events
          if (isOverworld) {
            renderer.setBlackBounds(vp.blackLeft, vp.blackRight, vp.blackBottom);
            const maxBottom = vp.snesHeight === 240 ? 16 : 0;
            renderer.setMaxBounds(vp.extraLeftRight, vp.extraLeftRight, maxBottom);
          }

          // Detect screen transition: bounds jump by >10px ONLY during overworld movement
          if (prevBlackLeft >= 0 && isOverworld) {
            const leftDelta = Math.abs(vp.blackLeft - prevBlackLeft);
            const rightDelta = Math.abs(vp.blackRight - prevBlackRight);
            if (leftDelta > 10 || rightDelta > 10) {
              fadeTarget = 0;
              fadeOpacity = 0; // instant hide on transition
            }
          }
          if (isOverworld) {
            prevBlackLeft = vp.blackLeft;
            prevBlackRight = vp.blackRight;
          }

          // If just came back and stable, fade in
          if (isOverworld && hasExtended && fadeTarget === 0 && fadeOpacity <= 0) {
            fadeTarget = 1.0;
          }
        } else {
          renderer.setEnabled(false);
        }

        // Animate fade
        if (fadeOpacity < fadeTarget) {
          fadeOpacity = Math.min(fadeOpacity + dt * FADE_SPEED, fadeTarget);
        } else if (fadeOpacity > fadeTarget) {
          fadeOpacity = Math.max(fadeOpacity - dt * FADE_SPEED, fadeTarget);
        }
        renderer.setEffectOpacity(fadeOpacity);

        // Get clean frame (no HUD) for the mirror pass
        const cleanResult = vp?.isGameplay ? wasmRenderCleanFrame() : null;
        renderer.render(gameCanvas, time, cleanResult ?? null);
        rafIdRef.current = requestAnimationFrame(loop);
      };
      rafIdRef.current = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(initId);
      cancelAnimationFrame(rafIdRef.current);
      if (glowRendererRef.current) {
        glowRendererRef.current.dispose();
        glowRendererRef.current = null;
      }
    };
  }, [status, canvasKey]);

  // ─── Shadow casting shader render loop ───
  useEffect(() => {
    if (status !== 'running') return;
    const gameCanvas = canvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!gameCanvas || !shadowCanvas) return;

    // Load shadow project data
    let cancelled = false;
    let shadowRafId = 0;

    const init = async () => {
      try {
        const project = await window.api.shadowCasting.load();
        if (cancelled) return;
        shadowProjectRef.current = project;
      } catch {
        shadowProjectRef.current = null;
      }

      if (cancelled) return;

      // Size shadow canvas to match game
      shadowCanvas.width = gameCanvas.width;
      shadowCanvas.height = gameCanvas.height;

      const renderer = createShadowRenderer(shadowCanvas);
      if (!renderer) return;
      shadowRendererRef.current = renderer;

      // Subscribe to editor store so live edits are reflected
      const unsub = useShadowEditorStore.subscribe((state) => {
        if (state.dirty || state.open) {
          shadowProjectRef.current = state.project;
        }
      });

      let prevScreenId = -1;

      const loop = (time: number) => {
        if (!shadowCastingRef.current || !shadowProjectRef.current) {
          renderer.setEnabled(false);
          renderer.render(gameCanvas, time);
          shadowRafId = requestAnimationFrame(loop);
          return;
        }

        // Sync buffer size
        if (gameCanvas.width !== shadowCanvas.width || gameCanvas.height !== shadowCanvas.height) {
          renderer.resize(gameCanvas.width, gameCanvas.height);
        }

        // Detect current overworld screen from camera position
        const vp = wasmGetViewportInfo();
        let screenId = -1;
        if (vp && vp.locationModule === 9) {
          const col = Math.floor((vp.cameraX + 128) / 512) & 7;
          const row = Math.floor((vp.cameraY + 112) / 512) & 7;
          screenId = row * 8 + col;
        }

        if (screenId !== prevScreenId || useShadowEditorStore.getState().dirty) {
          prevScreenId = screenId;
          const screenData = shadowProjectRef.current.screens[screenId] ?? null;
          renderer.setScreenData(screenData);
          if (screenData && screenData.heightmap.length > 0) {
            renderer.setEnabled(true);
          } else {
            renderer.setEnabled(false);
          }
        }

        renderer.render(gameCanvas, time);
        shadowRafId = requestAnimationFrame(loop);
      };
      shadowRafId = requestAnimationFrame(loop);

      // Store cleanup for when effect unmounts
      const origCleanup = () => { unsub(); };
      (shadowRendererRef as any)._unsub = origCleanup;
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(shadowRafId);
      if (shadowRendererRef.current) {
        (shadowRendererRef as any)._unsub?.();
        shadowRendererRef.current.dispose();
        shadowRendererRef.current = null;
      }
    };
  }, [status, canvasKey]);

  // Start game when assets arrive
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
    <div className="game-layer" ref={containerRef}>
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
      {status === 'running' && <ConnectionOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorOverlay width={fitSize.width} height={fitSize.height} gameRunning={status === 'running'} />}
      {status === 'running' && <ShadowEditorPanel />}
      {status === 'running' && <GameOverlay width={fitSize.width} height={fitSize.height} />}
    </div>
  );
};

export { GameLayer };
