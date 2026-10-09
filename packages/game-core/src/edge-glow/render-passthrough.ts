/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';

const renderPassthrough = (pipe: EdgeGlowPipeline, state: EdgeGlowState): void => {
  const { gl, progs, uniforms, quadBuffer, gameTexture, draw } = pipe;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, state.width, state.height);
  gl.useProgram(progs.blurH);
  gl.uniform1i(uniforms.blurH.texture, 0);
  gl.uniform2f(uniforms.blurH.resolution, state.width, state.height);
  gl.uniform1f(uniforms.blurH.radius, 0.0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gameTexture);
  drawQuad(gl, progs.blurH, quadBuffer, draw);
};

export { renderPassthrough };
