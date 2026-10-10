/* @layer bridge-wasm @kind logic */
import type { ScreenShadowData } from '../shadow-casting-types';
import { buildHeightmapTexture } from './heightmap-builder';
import { computeLightUniforms } from './light-calculator';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';
import { MAX_BLUR_PX, MIN_BLUR_RADIUS } from './renderer.constants';
import { renderShadowPass } from './render-shadow-pass';
import { renderBlurPasses } from './render-blur-passes';
import { renderCompositePass } from './render-composite-pass';

const rebuildHeightmap = (pipe: ShadowPipeline, state: ShadowState, data: ScreenShadowData): void => {
  const { gl, heightmapTex } = pipe;
  if (data.heightmap.length === 0) return;
  const texData = buildHeightmapTexture(data.heightmap, {
    width: state.snesWidth, height: state.snesHeight, offsetX: state.viewOriginX, offsetY: state.viewOriginY,
  });
  gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, state.snesWidth, state.snesHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, texData);
};

const renderShadowFrame = (pipe: ShadowPipeline, state: ShadowState, gameCanvas: HTMLCanvasElement, time: number): void => {
  const { gl, gameTex } = pipe;
  const screenData = state.screenData;
  if (!state.enabled || !screenData) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return;
  }
  rebuildHeightmap(pipe, state, screenData);

  gl.bindTexture(gl.TEXTURE_2D, gameTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

  const lighting = screenData.lighting;
  const lights = computeLightUniforms(screenData.lights, gameCanvas);
  for (let i = 0; i < lights.numLights; i++) {
    lights.positions[i * 3] = (lights.positions[i * 3] ?? 0) - state.viewOriginX;
    lights.positions[i * 3 + 1] = (lights.positions[i * 3 + 1] ?? 0) - state.viewOriginY;
  }

  renderShadowPass(pipe, state, { lighting, lights, time });

  const blurRadius = lighting.shadowSoftness * MAX_BLUR_PX;
  const blurred = blurRadius > MIN_BLUR_RADIUS && !state.debugMode;
  if (blurred) renderBlurPasses(pipe, state, blurRadius);

  renderCompositePass(pipe, state, blurred ? state.blurFBO2.texture : state.shadowFBO.texture);
};

export { renderShadowFrame };
