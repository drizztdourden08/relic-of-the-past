/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';

const renderCompositePass = (pipe: ShadowPipeline, state: ShadowState, lightTex: WebGLTexture): void => {
  const { gl, progs, quadBuffer, gameTex } = pipe;
  const u = pipe.uniforms.composite;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, state.width, state.height);
  gl.useProgram(progs.composite);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gameTex);
  gl.uniform1i(u.gameTexture, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, lightTex);
  gl.uniform1i(u.lightTexture, 1);

  drawQuad(gl, progs.composite, quadBuffer);
};

export { renderCompositePass };
