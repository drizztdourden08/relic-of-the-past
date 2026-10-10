/* @layer bridge-wasm @kind logic */
import type { ShadowRenderer, ShadowRendererOptions } from './shadow-casting.type';
import type { ScreenShadowData } from '../shadow-casting-types';
import { createTexture } from '../webgl/gl-helpers';
import { compilePrograms } from './compile-programs';
import { getUniformLocations } from './get-uniform-locations';
import type { ShadowPipeline } from './shadow-programs.type';
import { QUAD_STRIP } from './renderer.constants';
import { createShadowState } from './create-shadow-state';
import { resizeShadowFbos } from './resize-shadow-fbos';
import { createHeightmapTexture } from './create-heightmap-texture';
import { renderShadowFrame } from './render-shadow-frame';
import { disposeShadowPipeline } from './dispose-shadow-pipeline';

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

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_STRIP), gl.STATIC_DRAW);

  const { width, height } = canvas;
  const state = createShadowState(gl, width, height);
  const heightmapTex = createHeightmapTexture(gl, width, height);
  const gameTex = createTexture(gl, gl.LINEAR);
  const pipe: ShadowPipeline = { gl, progs, uniforms, quadBuffer, heightmapTex, gameTex };

  const renderer: ShadowRenderer = {
    render: (gameCanvas, time) => renderShadowFrame(pipe, state, gameCanvas, time),
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
      resizeShadowFbos(gl, state, w, h);
    },
    setEnabled(value: boolean): void { state.enabled = value; },
    setDebugMode(value: boolean): void { state.debugMode = value; },
    dispose(): void { disposeShadowPipeline(pipe, state); },
  };

  return renderer;
};

export { createShadowRenderer };
