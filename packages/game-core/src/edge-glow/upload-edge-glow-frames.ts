/* @layer bridge-wasm @kind logic */
import type { CleanFrame, EdgeGlowPipeline } from './edge-glow-programs.type';

const uploadEdgeGlowFrames = (
  pipe: EdgeGlowPipeline,
  gameCanvas: HTMLCanvasElement,
  cleanFrame?: CleanFrame | null,
): WebGLTexture => {
  const { gl, gameTexture, cleanTexture } = pipe;
  gl.bindTexture(gl.TEXTURE_2D, gameTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);
  if (!cleanFrame) return gameTexture;
  gl.bindTexture(gl.TEXTURE_2D, cleanTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cleanFrame.width, cleanFrame.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cleanFrame.data);
  return cleanTexture;
};

export { uploadEdgeGlowFrames };
