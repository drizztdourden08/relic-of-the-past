/* @layer bridge-wasm @kind types */
import type { DrawQuadOptions, FBO } from '../webgl/gl-helpers';
import type { getUniformLocations } from './get-uniform-locations';

interface EdgeGlowPrograms {
  mirror: WebGLProgram;
  blurH: WebGLProgram;
  blurV: WebGLProgram;
  composite: WebGLProgram;
}

type EdgeGlowUniforms = ReturnType<typeof getUniformLocations>;

interface EdgeGlowBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

interface EdgeGlowSettings {
  blurRadius: number;
  glowIntensity: number;
  noiseSpeed: number;
  noiseScale: number;
  blurPasses: number;
}

interface EdgeGlowPipeline {
  gl: WebGLRenderingContext;
  glCanvas: HTMLCanvasElement;
  progs: EdgeGlowPrograms;
  uniforms: EdgeGlowUniforms;
  quadBuffer: WebGLBuffer;
  gameTexture: WebGLTexture;
  cleanTexture: WebGLTexture;
  draw: DrawQuadOptions;
  settings: EdgeGlowSettings;
}

interface EdgeGlowState {
  width: number;
  height: number;
  enabled: boolean;
  black: EdgeGlowBounds;
  max: EdgeGlowBounds;
  effectOpacity: number;
  pixelSizeMultiplier: number;
  pixelDivisor: number;
  pixelExponent: number;
  fboMirror: FBO;
  fboA: FBO;
  fboB: FBO;
}

type CleanFrame = { data: Uint8Array; width: number; height: number };

export type {
  EdgeGlowPrograms, EdgeGlowUniforms, EdgeGlowBounds, EdgeGlowSettings, EdgeGlowPipeline, EdgeGlowState, CleanFrame,
};
