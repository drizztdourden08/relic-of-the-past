/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { FBO } from '../webgl/gl-helpers';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';

const renderBlurPasses = (pipe: ShadowPipeline, state: ShadowState, blurRadius: number): void => {
  const { gl, progs, quadBuffer, heightmapTex } = pipe;
  const u = pipe.uniforms.blur;

  const pass = (target: FBO, source: FBO, direction: readonly [number, number]): void => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, state.width, state.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(u.texture, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
    gl.uniform1i(u.heightmap, 1);
    gl.uniform2f(u.direction, direction[0], direction[1]);
    drawQuad(gl, progs.blur, quadBuffer);
  };

  gl.useProgram(progs.blur);
  gl.uniform2f(u.resolution, state.width, state.height);
  gl.uniform1f(u.radius, blurRadius);
  pass(state.blurFBO1, state.shadowFBO, [1.0, 0.0]);
  pass(state.blurFBO2, state.blurFBO1, [0.0, 1.0]);
};

export { renderBlurPasses };
