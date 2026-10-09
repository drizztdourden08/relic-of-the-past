/* @layer bridge-wasm @kind logic */
import { RESTORE_TIMEOUT_MS } from './canvas-context.constants';

const restoreLostContext = (canvas: HTMLCanvasElement): Promise<void> => {
  const gl = canvas.getContext('webgl');
  if (!gl || !gl.isContextLost()) return Promise.resolve();
  const lose = gl.getExtension('WEBGL_lose_context');
  if (!lose) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = (): void => {
      if (settled) return;
      settled = true;
      canvas.removeEventListener('webglcontextrestored', done);
      resolve();
    };
    canvas.addEventListener('webglcontextrestored', done);
    lose.restoreContext();
    setTimeout(done, RESTORE_TIMEOUT_MS);
  });
};

export { restoreLostContext };
