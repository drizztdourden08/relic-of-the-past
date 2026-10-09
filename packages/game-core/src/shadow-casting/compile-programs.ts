/* @layer bridge-wasm @kind logic */
import { FULLSCREEN_VERT, SHADOW_FRAG, BLUR_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram } from '../webgl/gl-helpers';
import type { ShadowPrograms } from './shadow-programs.type';
import { SHADOW_LABEL } from './shadow-programs.constants';

const compilePrograms = (gl: WebGLRenderingContext): ShadowPrograms | null => {
  const shadow = createProgram(gl, FULLSCREEN_VERT, SHADOW_FRAG, SHADOW_LABEL);
  const blur = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG, SHADOW_LABEL);
  const composite = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG, SHADOW_LABEL);
  if (!shadow || !blur || !composite) return null;
  return { shadow, blur, composite };
};

export { compilePrograms };
