/* @layer bridge-wasm @kind logic */
import { createFBO } from '../webgl/gl-helpers';
import type { EdgeGlowState } from './edge-glow-programs.type';

const createEdgeGlowState = (gl: WebGLRenderingContext, width: number, height: number): EdgeGlowState => ({
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
});

export { createEdgeGlowState };
