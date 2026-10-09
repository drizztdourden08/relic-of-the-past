/* @layer bridge-wasm @kind types */
import type { ScreenShadowData } from '../shadow-casting-types';
import type { FBO } from '../webgl/gl-helpers';
import type { getUniformLocations } from './get-uniform-locations';

interface ShadowPrograms {
  shadow: WebGLProgram;
  blur: WebGLProgram;
  composite: WebGLProgram;
}

type ShadowUniforms = ReturnType<typeof getUniformLocations>;

interface ShadowPipeline {
  gl: WebGLRenderingContext;
  progs: ShadowPrograms;
  uniforms: ShadowUniforms;
  quadBuffer: WebGLBuffer;
  heightmapTex: WebGLTexture;
  gameTex: WebGLTexture;
}

interface ShadowState {
  width: number;
  height: number;
  shadowFBO: FBO;
  blurFBO1: FBO;
  blurFBO2: FBO;
  enabled: boolean;
  debugMode: boolean;
  screenData: ScreenShadowData | null;
  viewOriginX: number;
  viewOriginY: number;
  snesWidth: number;
  snesHeight: number;
}

export type { ShadowPrograms, ShadowUniforms, ShadowPipeline, ShadowState };
