import { useRef, useEffect, useState, useCallback } from 'react';

type GameState = 'idle' | 'loading' | 'running' | 'error';

interface GameCanvasProps {
  assetData: Uint8Array | null;
  status: string;
}

export function GameCanvas({ assetData, status }: GameCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [error, setError] = useState<string>('');
  const moduleRef = useRef<unknown>(null);
  const startedRef = useRef(false);

  const startGame = useCallback(async (data: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGameState('loading');

    try {
      const module = await Zelda3({
        canvas,
        preRun: [(mod: { FS: { writeFile: (path: string, data: Uint8Array) => void; mkdir: (path: string) => void } }) => {
          mod.FS.writeFile('/zelda3_assets.dat', data);
          try { mod.FS.mkdir('/saves'); } catch { /* may exist */ }
        }],
        print: (text: string) => console.log('[zelda3]', text),
        printErr: (text: string) => console.error('[zelda3]', text),
      });
      moduleRef.current = module;
      setGameState('running');
      canvas.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGameState('error');
    }
  }, []);

  // Start game when assetData is provided
  useEffect(() => {
    if (assetData && !startedRef.current) {
      startedRef.current = true;
      startGame(assetData);
    }
  }, [assetData, startGame]);

  // Draw placeholder when not running
  useEffect(() => {
    if (gameState === 'running') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';

    if (gameState === 'loading') {
      ctx.fillStyle = '#4a9';
      ctx.font = '18px monospace';
      ctx.fillText('Loading WASM core...', canvas.width / 2, canvas.height / 2);
    } else if (gameState === 'error') {
      ctx.fillStyle = '#e94560';
      ctx.font = '16px monospace';
      ctx.fillText('Error: ' + error, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.fillStyle = '#555';
      ctx.font = '18px monospace';
      const msg = status || 'Use menu ⋮ → Load ROM to start';
      ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    }
  }, [gameState, error, status]);

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={512}
        height={448}
        tabIndex={0}
      />
    </div>
  );
}
