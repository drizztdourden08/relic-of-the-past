import { useRef, useEffect, useState, useCallback } from 'react';

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

type GameState = 'no-assets' | 'loading' | 'running' | 'error';

export function GameCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('no-assets');
  const [error, setError] = useState<string>('');
  const moduleRef = useRef<unknown>(null);

  const startGame = useCallback(async (assetData: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGameState('loading');

    try {
      const module = await Zelda3({
        canvas,
        preRun: [(mod: { FS: { writeFile: (path: string, data: Uint8Array) => void; mkdir: (path: string) => void } }) => {
          mod.FS.writeFile('/zelda3_assets.dat', assetData);
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        startGame(data);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [startGame]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        startGame(data);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [startGame]);

  // Draw placeholder when not running
  useEffect(() => {
    if (gameState === 'running') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4a9';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';

    if (gameState === 'loading') {
      ctx.fillText('Loading WASM core...', canvas.width / 2, canvas.height / 2);
    } else if (gameState === 'error') {
      ctx.fillStyle = '#e94560';
      ctx.fillText('Error: ' + error, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.fillText('Drop zelda3_assets.dat here', canvas.width / 2, canvas.height / 2);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#666';
      ctx.fillText('or click to select', canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [gameState, error]);

  return (
    <div
      className="game-canvas-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={512}
        height={448}
        tabIndex={0}
        onClick={() => {
          if (gameState === 'no-assets') {
            document.getElementById('asset-file-input')?.click();
          }
        }}
      />
      {gameState === 'no-assets' && (
        <input
          id="asset-file-input"
          type="file"
          accept=".dat"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      )}
    </div>
  );
}
