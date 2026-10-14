/* @layer bridge-wasm @kind logic */
import { destroyFBO } from '../webgl/gl-helpers';
import type { EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';

const disposeEdgeGlow = (pipe: EdgeGlowPipeline, state: EdgeGlowState): void => {
  const { gl, progs, quadBuffer, gameTexture, cleanTexture } = pipe;
  gl.deleteProgram(progs.mirror);
  gl.deleteProgram(progs.blurH);
  gl.deleteProgram(progs.blurV);
  gl.deleteProgram(progs.composite);
  gl.deleteBuffer(quadBuffer);
  gl.deleteTexture(gameTexture);
  gl.deleteTexture(cleanTexture);
  destroyFBO(gl, state.fboMirror);
  destroyFBO(gl, state.fboA);
  destroyFBO(gl, state.fboB);
};

export { disposeEdgeGlow };
