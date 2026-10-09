/* @layer bridge-wasm @kind logic */
import { drawQuad } from '../webgl/gl-helpers';
import type { EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';

const renderComposite = (pipe: EdgeGlowPipeline, state: EdgeGlowState, timeSeconds: number): void => {
  const { gl, glCanvas, progs, uniforms, quadBuffer, gameTexture, draw, settings } = pipe;
  const { width, height, black, max } = state;
  const u = uniforms.composite;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);
  gl.useProgram(progs.composite);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gameTexture);
  gl.uniform1i(u.gameTexture, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, state.fboMirror.texture);
  gl.uniform1i(u.mirrorTexture, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, state.fboB.texture);
  gl.uniform1i(u.blurTexture, 2);

  gl.uniform1f(u.time, timeSeconds);
  gl.uniform2f(u.resolution, width, height);
  gl.uniform1f(u.glowIntensity, settings.glowIntensity);
  gl.uniform1f(u.noiseSpeed, settings.noiseSpeed);
  gl.uniform1f(u.noiseScale, settings.noiseScale);
  gl.uniform1f(u.blackLeft, max.left);
  gl.uniform1f(u.blackRight, max.right);
  gl.uniform1f(u.blackBottom, max.bottom);
  gl.uniform1f(u.blackTop, max.top);
  gl.uniform1f(u.dynLeft, black.left);
  gl.uniform1f(u.dynRight, black.right);
  gl.uniform1f(u.dynBottom, black.bottom);
  gl.uniform1f(u.dynTop, black.top);
  gl.uniform1f(u.effectOpacity, state.effectOpacity);
  const pixelSize = glCanvas.clientWidth > 0 ? (glCanvas.clientWidth / width) * state.pixelSizeMultiplier : state.pixelSizeMultiplier;
  gl.uniform1f(u.pixelSize, pixelSize);
  gl.uniform1f(u.pixelDivisor, state.pixelDivisor);
  gl.uniform1f(u.pixelExponent, state.pixelExponent);

  drawQuad(gl, progs.composite, quadBuffer, draw);
};

export { renderComposite };
