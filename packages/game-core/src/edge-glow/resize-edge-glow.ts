/* @layer bridge-wasm @kind logic */
import { createFBO, destroyFBO } from '../webgl/gl-helpers';
import type { EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';

const resizeEdgeGlow = (pipe: EdgeGlowPipeline, state: EdgeGlowState, w: number, h: number): void => {
  const { gl, glCanvas } = pipe;
  state.width = w;
  state.height = h;
  glCanvas.width = w;
  glCanvas.height = h;

  destroyFBO(gl, state.fboMirror);
  destroyFBO(gl, state.fboA);
  destroyFBO(gl, state.fboB);
  state.fboMirror = createFBO(gl, w, h, gl.NEAREST);
  state.fboA = createFBO(gl, w, h);
  state.fboB = createFBO(gl, w, h);
};

export { resizeEdgeGlow };
