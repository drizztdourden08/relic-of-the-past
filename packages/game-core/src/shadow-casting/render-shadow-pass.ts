/* @layer bridge-wasm @kind logic */
import type { ScreenLightingConfig } from '../shadow-casting-types';
import { drawQuad } from '../webgl/gl-helpers';
import type { LightUniforms } from './light-calculator';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';

const toRadians = (degrees: number): number => degrees * Math.PI / 180;

const renderShadowPass = (
  pipe: ShadowPipeline, state: ShadowState, lighting: ScreenLightingConfig, lights: LightUniforms, time: number,
): void => {
  const { gl, progs, quadBuffer, heightmapTex, gameTex } = pipe;
  const u = pipe.uniforms.shadow;
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.shadowFBO.framebuffer);
  gl.viewport(0, 0, state.width, state.height);
  gl.useProgram(progs.shadow);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
  gl.uniform1i(u.heightmap, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, gameTex);
  gl.uniform1i(u.gameTexture, 1);

  gl.uniform2f(u.resolution, state.snesWidth, state.snesHeight);
  gl.uniform1f(u.sunEnabled, lighting.sunEnabled ? 1.0 : 0.0);
  gl.uniform1f(u.sunAngle, toRadians(lighting.sunAngle));
  gl.uniform1f(u.sunElevation, toRadians(lighting.sunElevation));
  gl.uniform1f(u.sunIntensity, lighting.sunIntensity);
  gl.uniform1f(u.ambientIntensity, lighting.ambientIntensity);
  gl.uniform1f(u.time, time / 1000);
  gl.uniform1f(u.dayNightCycle, lighting.dayNightCycle ? 1.0 : 0.0);
  gl.uniform1f(u.cycleSpeed, lighting.cycleSpeed);
  gl.uniform1f(u.debugMode, state.debugMode ? 1.0 : 0.0);

  gl.uniform1i(u.numLights, lights.numLights);
  gl.uniform3fv(u.lightPos, lights.positions);
  gl.uniform3fv(u.lightColor, lights.colors);
  gl.uniform1fv(u.lightIntensity, lights.intensities);
  gl.uniform1fv(u.lightCastShadow, lights.castShadows);

  drawQuad(gl, progs.shadow, quadBuffer);
};

export { renderShadowPass };
