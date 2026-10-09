/* @layer bridge-wasm @kind logic */
import { FULLSCREEN_VERT, MIRROR_FRAG, BLUR_H_FRAG, BLUR_V_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram } from '../webgl/gl-helpers';
import type { EdgeGlowPrograms } from './edge-glow-programs.type';
import { EDGE_GLOW_LABEL } from './edge-glow-programs.constants';

const compilePrograms = (gl: WebGLRenderingContext): EdgeGlowPrograms | null => {
  const mirror = createProgram(gl, FULLSCREEN_VERT, MIRROR_FRAG, EDGE_GLOW_LABEL);
  const blurH = createProgram(gl, FULLSCREEN_VERT, BLUR_H_FRAG, EDGE_GLOW_LABEL);
  const blurV = createProgram(gl, FULLSCREEN_VERT, BLUR_V_FRAG, EDGE_GLOW_LABEL);
  const composite = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG, EDGE_GLOW_LABEL);
  if (!mirror || !blurH || !blurV || !composite) return null;
  return { mirror, blurH, blurV, composite };
};

export { compilePrograms };
