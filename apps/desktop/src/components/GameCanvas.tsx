import { useRef, useEffect } from 'react';

export function GameCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Placeholder: fill with black and show waiting message
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4a9';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WASM core not loaded', canvas.width / 2, canvas.height / 2);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={512}
      height={448}
      tabIndex={0}
    />
  );
}
