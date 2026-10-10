/* @layer bridge-wasm @kind logic */
import { destroyFBO } from '../webgl/gl-helpers';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';

const disposeShadowPipeline = (pipe: ShadowPipeline, state: ShadowState): void => {
  const { gl, heightmapTex, gameTex, quadBuffer, progs } = pipe;
  gl.deleteTexture(heightmapTex);
  gl.deleteTexture(gameTex);
  gl.deleteBuffer(quadBuffer);
  gl.deleteProgram(progs.shadow);
  gl.deleteProgram(progs.blur);
  gl.deleteProgram(progs.composite);
  destroyFBO(gl, state.shadowFBO);
  destroyFBO(gl, state.blurFBO1);
  destroyFBO(gl, state.blurFBO2);
};

export { disposeShadowPipeline };
