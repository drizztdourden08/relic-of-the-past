/* @layer bridge-wasm @kind logic */
import { createFBO, destroyFBO } from '../webgl/gl-helpers';
import type { ShadowState } from './shadow-programs.type';

const resizeShadowFbos = (gl: WebGLRenderingContext, state: ShadowState, w: number, h: number): void => {
  destroyFBO(gl, state.shadowFBO);
  destroyFBO(gl, state.blurFBO1);
  destroyFBO(gl, state.blurFBO2);
  state.shadowFBO = createFBO(gl, w, h);
  state.blurFBO1 = createFBO(gl, w, h);
  state.blurFBO2 = createFBO(gl, w, h);
  state.width = w;
  state.height = h;
};

export { resizeShadowFbos };
