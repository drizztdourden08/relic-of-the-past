/* @layer bridge-wasm @kind logic */
import type { ShadowRenderer, ShadowRendererOptions } from './shadow-casting.type';
import type { ScreenShadowData } from '../shadow-casting-types';
import { createFBO, createTexture, destroyFBO } from '../webgl/gl-helpers';
import { buildHeightmapTexture } from './heightmap-builder';
import { computeLightUniforms } from './light-calculator';
import { compilePrograms } from './compile-programs';
import { getUniformLocations } from './get-uniform-locations';
import type { ShadowPipeline, ShadowState } from './shadow-programs.type';
import {
  DEFAULT_SNES_HEIGHT, DEFAULT_SNES_WIDTH, MAX_BLUR_PX, MIN_BLUR_RADIUS, QUAD_STRIP,
} from './renderer.constants';
import { createHeightmapTexture } from './create-heightmap-texture';
import { renderShadowPass } from './render-shadow-pass';
import { renderBlurPasses } from './render-blur-passes';
import { renderCompositePass } from './render-composite-pass';

const createShadowRenderer = (canvas: HTMLCanvasElement, _options: ShadowRendererOptions = {}): ShadowRenderer | null => {
  const glOrNull = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });

  if (!glOrNull) {
    console.warn('[ShadowCasting] WebGL not available');
    return null;
  }

  const gl: WebGLRenderingContext = glOrNull;

  const progs = compilePrograms(gl);
  if (!progs) {
    console.error('[ShadowCasting] Failed to compile shader programs');
    return null;
  }
  const uniforms = getUniformLocations(gl, progs);

  const quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_STRIP), gl.STATIC_DRAW);

  const width = canvas.width;
  const height = canvas.height;
  const state: ShadowState = {
    width,
    height,
    shadowFBO: createFBO(gl, width, height),
    blurFBO1: createFBO(gl, width, height),
    blurFBO2: createFBO(gl, width, height),
    enabled: false,
    debugMode: false,
    screenData: null,
    viewOriginX: 0,
    viewOriginY: 0,
    snesWidth: DEFAULT_SNES_WIDTH,
    snesHeight: DEFAULT_SNES_HEIGHT,
  };
  const heightmapTex = createHeightmapTexture(gl, width, height);
  const gameTex = createTexture(gl, gl.LINEAR);
  const pipe: ShadowPipeline = { gl, progs, uniforms, quadBuffer, heightmapTex, gameTex };

  const rebuildHeightmap = (data: ScreenShadowData): void => {
    if (data.heightmap.length === 0) return;
    const texData = buildHeightmapTexture(data.heightmap, state.snesWidth, state.snesHeight, state.viewOriginX, state.viewOriginY);
    gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, state.snesWidth, state.snesHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, texData);
  };

  const resizeFBOs = (w: number, h: number): void => {
    destroyFBO(gl, state.shadowFBO);
    destroyFBO(gl, state.blurFBO1);
    destroyFBO(gl, state.blurFBO2);
    state.shadowFBO = createFBO(gl, w, h);
    state.blurFBO1 = createFBO(gl, w, h);
    state.blurFBO2 = createFBO(gl, w, h);
    state.width = w;
    state.height = h;
  };

  const render = (gameCanvas: HTMLCanvasElement, time: number): void => {
    const screenData = state.screenData;
    if (!state.enabled || !screenData) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    rebuildHeightmap(screenData);

    gl.bindTexture(gl.TEXTURE_2D, gameTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

    const lighting = screenData.lighting;
    const lights = computeLightUniforms(screenData.lights, gameCanvas);
    for (let i = 0; i < lights.numLights; i++) {
      lights.positions[i * 3] -= state.viewOriginX;
      lights.positions[i * 3 + 1] -= state.viewOriginY;
    }

    renderShadowPass(pipe, state, lighting, lights, time);

    const blurRadius = lighting.shadowSoftness * MAX_BLUR_PX;
    const blurred = blurRadius > MIN_BLUR_RADIUS && !state.debugMode;
    if (blurred) renderBlurPasses(pipe, state, blurRadius);

    renderCompositePass(pipe, state, blurred ? state.blurFBO2.texture : state.shadowFBO.texture);
  };

  const renderer: ShadowRenderer = {
    render,
    setScreenData(data: ScreenShadowData | null): void {
      state.screenData = data;
      if (!data || (data.heightmap.length === 0 && data.lights.length === 0)) {
        state.enabled = false;
      }
    },
    setScreenOrigin(viewLeft: number, viewTop: number, viewWidth: number, viewHeight: number): void {
      state.viewOriginX = viewLeft;
      state.viewOriginY = viewTop;
      state.snesWidth = viewWidth;
      state.snesHeight = viewHeight;
    },
    resize(w: number, h: number): void {
      if (w === state.width && h === state.height) return;
      canvas.width = w;
      canvas.height = h;
      resizeFBOs(w, h);
    },
    setEnabled(value: boolean): void { state.enabled = value; },
    setDebugMode(value: boolean): void { state.debugMode = value; },
    dispose(): void {
      gl.deleteTexture(heightmapTex);
      gl.deleteTexture(gameTex);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(progs.shadow);
      gl.deleteProgram(progs.blur);
      gl.deleteProgram(progs.composite);
      destroyFBO(gl, state.shadowFBO);
      destroyFBO(gl, state.blurFBO1);
      destroyFBO(gl, state.blurFBO2);
    },
  };

  return renderer;
};

export { createShadowRenderer };
