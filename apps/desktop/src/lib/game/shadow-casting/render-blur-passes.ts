/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';

const renderBlurPasses = (pipe: ShadowPipeline, state: ShadowState, blurRadius: number): void => {
  const { gl, progs, quadBuffer, heightmapTex } = pipe;
  const u = pipe.uniforms.blur;
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.blurFBO1.framebuffer);
  gl.viewport(0, 0, state.width, state.height);
  gl.useProgram(progs.blur);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.shadowFBO.texture);
  gl.uniform1i(u.texture, 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
  gl.uniform1i(u.heightmap, 1);
  gl.uniform2f(u.resolution, state.width, state.height);
  gl.uniform1f(u.radius, blurRadius);
  gl.uniform2f(u.direction, 1.0, 0.0);

  drawQuad(gl, progs.blur, quadBuffer);

  gl.bindFramebuffer(gl.FRAMEBUFFER, state.blurFBO2.framebuffer);
  gl.viewport(0, 0, state.width, state.height);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.blurFBO1.texture);
  gl.uniform1i(u.texture, 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
  gl.uniform1i(u.heightmap, 1);
  gl.uniform2f(u.direction, 0.0, 1.0);

  drawQuad(gl, progs.blur, quadBuffer);
};

export { renderBlurPasses };
