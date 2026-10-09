/* @layer bridge-wasm @kind logic */
import type { EdgeGlowRenderer, EdgeGlowOptions } from './edge-glow.type';
import { createTexture, createFBO, destroyFBO } from '../webgl/gl-helpers';
import { compilePrograms } from './compile-programs';
import { getUniformLocations } from './get-uniform-locations';
import { create2DFallbackRenderer } from './create-2d-fallback';
import type { CleanFrame, EdgeGlowPipeline, EdgeGlowState } from './edge-glow-programs.type';
import { QUAD_TRIANGLES, QUAD_TRIANGLE_VERTICES } from './renderer.constants';
import { renderPassthrough } from './render-passthrough';
import { renderMirrorBlur } from './render-mirror-blur';
import { renderComposite } from './render-composite';

const createEdgeGlowRenderer = (glCanvas: HTMLCanvasElement, options: EdgeGlowOptions = {}): EdgeGlowRenderer | null => {
  const glOrNull = glCanvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!glOrNull) {
    console.warn('[EdgeGlow] WebGL not available, falling back to 2D passthrough');
    return create2DFallbackRenderer(glCanvas);
  }

  const gl = glOrNull;
  const { blurRadius = 16.0, glowIntensity = 1.0, noiseSpeed = 0.8, noiseScale = 6.0, blurPasses = 3 } = options;

  const progs = compilePrograms(gl);
  if (!progs) {
    console.error('[EdgeGlow] Failed to compile shader programs');
    return null;
  }
  const uniforms = getUniformLocations(gl, progs);

  const quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_TRIANGLES), gl.STATIC_DRAW);

  const width = glCanvas.width;
  const height = glCanvas.height;
  const gameTexture = createTexture(gl, gl.NEAREST);
  const cleanTexture = createTexture(gl, gl.NEAREST);
  const state: EdgeGlowState = {
    width,
    height,
    enabled: true,
    black: { left: 0, right: 0, bottom: 0, top: 0 },
    max: { left: 0, right: 0, bottom: 0, top: 0 },
    effectOpacity: 1.0,
    pixelSizeMultiplier: 10.0,
    pixelDivisor: 60.0,
    pixelExponent: 1.45,
    fboMirror: createFBO(gl, width, height, gl.NEAREST),
    fboA: createFBO(gl, width, height),
    fboB: createFBO(gl, width, height),
  };

  const pipe: EdgeGlowPipeline = {
    gl, glCanvas, progs, uniforms, quadBuffer, gameTexture, cleanTexture,
    draw: { mode: gl.TRIANGLES, count: QUAD_TRIANGLE_VERTICES },
    settings: { blurRadius, glowIntensity, noiseSpeed, noiseScale, blurPasses },
  };

  const resize = (w: number, h: number): void => {
    state.width = w;
    state.height = h;
    glCanvas.width = w;
    glCanvas.height = h;

    destroyFBO(gl, state.fboMirror);
    destroyFBO(gl, state.fboA);
    destroyFBO(gl, state.fboB);
    state.fboMirror = createFBO(gl, w, h, gl.NEAREST);
    state.fboA = createFBO(gl, w, h);
    state.fboB = createFBO(gl, w, h);
  };

  const uploadFrames = (gameCanvas: HTMLCanvasElement, cleanFrame?: CleanFrame | null): WebGLTexture => {
    gl.bindTexture(gl.TEXTURE_2D, gameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);
    if (!cleanFrame) return gameTexture;
    gl.bindTexture(gl.TEXTURE_2D, cleanTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cleanFrame.width, cleanFrame.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cleanFrame.data);
    return cleanTexture;
  };

  const render = (gameCanvas: HTMLCanvasElement, time: number, cleanFrame?: CleanFrame | null): void => {
    if (gl.isContextLost()) return;
    if (gameCanvas.width !== state.width || gameCanvas.height !== state.height) {
      resize(gameCanvas.width, gameCanvas.height);
    }
    const mirrorSrcTexture = uploadFrames(gameCanvas, cleanFrame);
    if (!state.enabled) {
      renderPassthrough(pipe, state);
      return;
    }
    renderMirrorBlur(pipe, state, mirrorSrcTexture, !!cleanFrame);
    renderComposite(pipe, state, time / 1000.0);
  };

  const setEnabled = (val: boolean): void => { state.enabled = val; };

  const setBlackBounds = (left: number, right: number, bottom: number, top: number): void => {
    state.black = { left, right, bottom, top };
  };

  const setMaxBounds = (left: number, right: number, bottom: number, top: number): void => {
    state.max = { left, right, bottom, top };
  };

  const setEffectOpacity = (opacity: number): void => { state.effectOpacity = opacity; };

  const setPixelateParams = (size: number, divisor: number, exponent: number): void => {
    state.pixelSizeMultiplier = size;
    state.pixelDivisor = divisor;
    state.pixelExponent = exponent;
  };

  const dispose = (): void => {
    gl.deleteProgram(progs.mirror);
    gl.deleteProgram(progs.blurH);
    gl.deleteProgram(progs.blurV);
    gl.deleteProgram(progs.composite);
    gl.deleteBuffer(quadBuffer);
    gl.deleteTexture(gameTexture);
    gl.deleteTexture(cleanTexture);
    destroyFBO(gl, state.fboMirror);
    destroyFBO(gl, state.fboA);
    destroyFBO(gl, state.fboB);
  };

  return { render, resize, setEnabled, setBlackBounds, setMaxBounds, setEffectOpacity, setPixelateParams, dispose };
};

export { createEdgeGlowRenderer };
