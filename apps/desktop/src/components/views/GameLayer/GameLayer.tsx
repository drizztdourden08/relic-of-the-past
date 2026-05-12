import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from './behavior/useGameState';
import { saveState, loadState, getInputManager } from '../../../lib/game';
import { log } from '../../../lib/log-bus';
import { ControllerDisconnectOverlay } from './ControllerDisconnectOverlay';
import './GameLayer.css';

interface GameLayerProps {
  assetData: Uint8Array | null;
  configIni?: string;
  profileId?: string;
  stretch?: boolean;
}

export function GameLayer({ assetData, configIni, profileId, stretch }: GameLayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (!containerW || !containerH) return;

    if (stretch) {
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${containerH}px`;
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

  // Intercept F-key presses for disk-backed save/load states.
  // The C code handles the MEMFS side; we handle disk persistence.
  // We must run BEFORE SDL's handler to write state files to MEMFS for loads,
  // and AFTER for saves we read the file from MEMFS.
  useEffect(() => {
    if (status !== 'running') return;

    const handleFKey = async (e: KeyboardEvent) => {
      const match = e.key.match(/^F([1-4])$/);
      if (!match) return;
      const slot = parseInt(match[1], 10) - 1; // F1=slot 0 ... F4=slot 3

      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        console.log(`[SaveState] Shift+F${slot + 1} → saving slot ${slot}`);
        log.app(`[SaveState] Shift+F${slot + 1} pressed → saving slot ${slot}`);
        const ok = await saveState(slot);
        log.app(`[SaveState] Slot ${slot} save ${ok ? 'succeeded' : 'FAILED'}`);
      } else if (!e.ctrlKey) {
        console.log(`[LoadState] F${slot + 1} → loading slot ${slot}`);
        log.app(`[LoadState] F${slot + 1} pressed → loading slot ${slot}`);
        const ok = await loadState(slot);
        log.app(`[LoadState] Slot ${slot} load ${ok ? 'succeeded' : 'FAILED'}`);
      }
    };

    window.addEventListener('keydown', handleFKey, true);
    return () => window.removeEventListener('keydown', handleFKey, true);
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

  // F10 to toggle pause, double-click canvas to resume
  useEffect(() => {
    if (status !== 'running') return;

    const handleF10 = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        const inputMgr = getInputManager();
        if (inputMgr.isPaused()) {
          inputMgr.resume();
        } else {
          inputMgr.togglePause();
        }
      }
    };

    const handleDblClick = () => {
      const inputMgr = getInputManager();
      if (inputMgr.isPaused()) {
        inputMgr.resume();
      }
    };

    window.addEventListener('keydown', handleF10, true);
    const canvas = canvasRef.current;
    canvas?.addEventListener('dblclick', handleDblClick);

    return () => {
      window.removeEventListener('keydown', handleF10, true);
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
        className="game-layer__canvas"
        width={512}
        height={448}
        tabIndex={0}
      />
      {controllerPaused && status === 'running' && disconnectedName !== 'Manual pause' && (
        <ControllerDisconnectOverlay controllerName={disconnectedName} />
      )}
    </div>
  );
}
