import { useRef, useEffect, useState } from 'react';
import { useGameState } from './behavior/useGameState';
import './GameLayer.css';

interface GameLayerProps {
  assetData: Uint8Array | null;
  configIni?: string;
}

export function GameLayer({ assetData, configIni }: GameLayerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, error, start } = useGameState();
  // Increment to force React to create a fresh <canvas> DOM element on restart,
  // ensuring the new WASM instance gets a clean WebGL context.
  const [canvasKey, setCanvasKey] = useState(0);
  const hasStartedRef = useRef(false);

  // Start game when assets arrive
  useEffect(() => {
    if (assetData && status === 'idle' && canvasRef.current) {
      hasStartedRef.current = true;
      start(canvasRef.current, assetData, configIni);
    }
  }, [assetData, status, start, configIni, canvasKey]);

  // Force a new canvas element when returning to idle AFTER a game has run.
  // Skip the initial mount — only needed after crash/reset.
  useEffect(() => {
    if (status === 'idle' && hasStartedRef.current) {
      setCanvasKey((k) => k + 1);
    }
  }, [status]);

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
    <div className="game-layer">
      <canvas
        key={canvasKey}
        ref={canvasRef}
        className="game-layer__canvas"
        width={512}
        height={448}
        tabIndex={0}
      />
    </div>
  );
}
