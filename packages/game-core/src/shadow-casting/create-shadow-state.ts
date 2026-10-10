/* @layer bridge-wasm @kind logic */
import { createFBO } from '../webgl/gl-helpers';
import type { ShadowState } from './shadow-programs.type';
import { DEFAULT_SNES_HEIGHT, DEFAULT_SNES_WIDTH } from './renderer.constants';

const createShadowState = (gl: WebGLRenderingContext, width: number, height: number): ShadowState => ({
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
});

export { createShadowState };
