import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from './behavior/useGameState';
import { getInputManager, wasmGetViewportInfo, wasmRenderCleanFrame } from '../../../lib/game';
import { createEdgeGlowRenderer, type EdgeGlowRenderer } from '../../../lib/game/edge-glow-shader';
import { ControllerDisconnectOverlay } from './sub-components/ControllerDisconnectOverlay';
import './GameLayer.css';
import type { GameLayerProps } from './types';


const GameLayer = (props: GameLayerProps) => {
  const { assetData, configIni, profileId, stretch, edgeEffect = true } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowRendererRef = useRef<EdgeGlowRenderer | null>(null);
  const rafIdRef = useRef<number>(0);
  const edgeEffectRef = useRef(edgeEffect);
  edgeEffectRef.current = edgeEffect;
  const { status, error, start } = useGameState();
  // Increment to force React to create a fresh <canvas> DOM element on restart,
  // ensuring the new WASM instance gets a clean WebGL context.
  const [canvasKey, setCanvasKey] = useState(0);
  const hasStartedRef = useRef(false);
  const [controllerPaused, setControllerPaused] = useState(false);
  const [disconnectedName, setDisconnectedName] = useState('');

  // Scale canvas to fill the container while maintaining aspect ratio
  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (!containerW || !containerH) return;

    if (stretch) {
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${containerH}px`;
      if (fxCanvas) {
        fxCanvas.style.width = `${containerW}px`;
        fxCanvas.style.height = `${containerH}px`;
      }
      return;
    }

    const bufW = canvas.width;
    const bufH = canvas.height;
    if (!bufW || !bufH) return;

    const scale = Math.min(containerW / bufW, containerH / bufH);
    const cssW = Math.floor(bufW * scale);
    const cssH = Math.floor(bufH * scale);

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    if (fxCanvas) {
      fxCanvas.style.width = `${cssW}px`;
      fxCanvas.style.height = `${cssH}px`;
    }
  }, [stretch]);

  // Observe container size changes and re-fit
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => fitCanvas());
    ro.observe(container);
    return () => ro.disconnect();
  }, [fitCanvas, canvasKey]);

  // Re-fit after WASM starts (SDL may change canvas.width/height)
  useEffect(() => {
    if (status !== 'running') return;
    // SDL_CreateWindow sets canvas.width/height; fit after a tick
    const id = requestAnimationFrame(() => fitCanvas());
    return () => cancelAnimationFrame(id);
  }, [status, fitCanvas]);

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
        }

        // Query WASM for precise viewport info
        const vp = wasmGetViewportInfo();
        if (vp) {
          // Enable on overworld (module 9) with extended aspect ratio
          // Keep effect visible during text/events if we were on overworld
          const hasExtended = vp.extraLeftRight > 0 || (vp.snesHeight === 240);
          const isOverworld = vp.mainModule === 9;
          if (isOverworld && hasExtended && edgeEffectRef.current) {
            renderer.setEnabled(true);
          } else if (!edgeEffectRef.current || (!vp.isGameplay && !isOverworld)) {
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

  // Draw placeholder when not running
  useEffect(() => {
    if (status === 'running') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';

    if (status === 'loading') {
      ctx.fillStyle = '#c8a84e';
      ctx.font = '18px monospace';
      ctx.fillText('Loading WASM core...', canvas.width / 2, canvas.height / 2);
    } else if (status === 'error') {
      ctx.fillStyle = '#e94560';
      ctx.font = '16px monospace';
      ctx.fillText(`Error: ${error}`, canvas.width / 2, canvas.height / 2);
    }
  }, [status, error]);

  return (
    <div className="game-layer" ref={containerRef}>
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
        className="game-layer__fx-canvas"
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
    </div>
  );
};

export { GameLayer };
