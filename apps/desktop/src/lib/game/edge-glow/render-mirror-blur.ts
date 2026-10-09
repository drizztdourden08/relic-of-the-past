/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';

const renderMirror = (pipe: EdgeGlowPipeline, state: EdgeGlowState, source: WebGLTexture, swizzle: boolean): void => {
  const { gl, progs, uniforms, quadBuffer, draw } = pipe;
  const { width, height, black } = state;
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboMirror.framebuffer);
  gl.viewport(0, 0, width, height);
  gl.useProgram(progs.mirror);
  gl.uniform1i(uniforms.mirror.gameTexture, 0);
  gl.uniform2f(uniforms.mirror.resolution, width, height);
  gl.uniform1f(uniforms.mirror.blackLeft, black.left);
  gl.uniform1f(uniforms.mirror.blackRight, black.right);
  gl.uniform1f(uniforms.mirror.blackBottom, black.bottom);
  gl.uniform1f(uniforms.mirror.blackTop, black.top);
  gl.uniform1f(uniforms.mirror.swizzleBR, swizzle ? 1.0 : 0.0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, source);
  drawQuad(gl, progs.mirror, quadBuffer, draw);
};

const renderBlurPasses = (pipe: EdgeGlowPipeline, state: EdgeGlowState): void => {
  const { gl, progs, uniforms, quadBuffer, draw, settings } = pipe;
  const { width, height } = state;
  let readTex = state.fboMirror.texture;

  for (let pass = 0; pass < settings.blurPasses; pass++) {
    const radius = settings.blurRadius * (pass + 1);

    gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboA.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(progs.blurH);
    gl.uniform1i(uniforms.blurH.texture, 0);
    gl.uniform2f(uniforms.blurH.resolution, width, height);
    gl.uniform1f(uniforms.blurH.radius, radius);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTex);
    drawQuad(gl, progs.blurH, quadBuffer, draw);

    gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboB.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(progs.blurV);
    gl.uniform1i(uniforms.blurV.texture, 0);
    gl.uniform2f(uniforms.blurV.resolution, width, height);
    gl.uniform1f(uniforms.blurV.radius, radius);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.fboA.texture);
    drawQuad(gl, progs.blurV, quadBuffer, draw);

    readTex = state.fboB.texture;
  }
};

const renderMirrorBlur = (pipe: EdgeGlowPipeline, state: EdgeGlowState, source: WebGLTexture, swizzle: boolean): void => {
  renderMirror(pipe, state, source, swizzle);
  renderBlurPasses(pipe, state);
};

export { renderMirrorBlur };
