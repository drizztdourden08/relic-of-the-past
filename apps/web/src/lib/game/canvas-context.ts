/* @layer bridge-wasm @kind logic */
/**
 * A stopped game loses its canvas's WebGL context to free the GPU (lifecycle.ts stopGame). A
 * canvas hands that same lost context back on the next getContext, SDL's renderer then fails to
 * initialise on it and falls through to a 2d context the canvas can no longer give, and the core
 * dies on "createImageData of null". So a restart first asks the canvas to restore the context and
 * waits for it to say the context is back.
 */
const RESTORE_TIMEOUT_MS = 1000;

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
