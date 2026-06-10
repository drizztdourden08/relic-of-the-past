/* @layer bridge-wasm @kind logic */
/** Shader-program compilation + uniform-location gathering for the edge-glow renderer. */
import { FULLSCREEN_VERT, MIRROR_FRAG, BLUR_H_FRAG, BLUR_V_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram } from '../webgl/gl-helpers';

const LABEL = '[EdgeGlow]';

interface EdgeGlowPrograms {
  mirror: WebGLProgram;
  blurH: WebGLProgram;
  blurV: WebGLProgram;
  composite: WebGLProgram;
}

/** Compile + link all four passes. Returns null if any program fails. */
const compilePrograms = (gl: WebGLRenderingContext): EdgeGlowPrograms | null => {
  const mirror = createProgram(gl, FULLSCREEN_VERT, MIRROR_FRAG, LABEL);
  const blurH = createProgram(gl, FULLSCREEN_VERT, BLUR_H_FRAG, LABEL);
  const blurV = createProgram(gl, FULLSCREEN_VERT, BLUR_V_FRAG, LABEL);
  const composite = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG, LABEL);
  if (!mirror || !blurH || !blurV || !composite) return null;
  return { mirror, blurH, blurV, composite };
};

const getUniformLocations = (gl: WebGLRenderingContext, p: EdgeGlowPrograms) => ({
  mirror: {
    gameTexture: gl.getUniformLocation(p.mirror, 'u_gameTexture'),
    resolution: gl.getUniformLocation(p.mirror, 'u_resolution'),
    blackLeft: gl.getUniformLocation(p.mirror, 'u_blackLeft'),
    blackRight: gl.getUniformLocation(p.mirror, 'u_blackRight'),
    blackBottom: gl.getUniformLocation(p.mirror, 'u_blackBottom'),
    swizzleBR: gl.getUniformLocation(p.mirror, 'u_swizzleBR'),
  },
  blurH: {
    texture: gl.getUniformLocation(p.blurH, 'u_texture'),
    resolution: gl.getUniformLocation(p.blurH, 'u_resolution'),
    radius: gl.getUniformLocation(p.blurH, 'u_radius'),
  },
  blurV: {
    texture: gl.getUniformLocation(p.blurV, 'u_texture'),
    resolution: gl.getUniformLocation(p.blurV, 'u_resolution'),
    radius: gl.getUniformLocation(p.blurV, 'u_radius'),
  },
  composite: {
    gameTexture: gl.getUniformLocation(p.composite, 'u_gameTexture'),
    mirrorTexture: gl.getUniformLocation(p.composite, 'u_mirrorTexture'),
    blurTexture: gl.getUniformLocation(p.composite, 'u_blurTexture'),
    time: gl.getUniformLocation(p.composite, 'u_time'),
    resolution: gl.getUniformLocation(p.composite, 'u_resolution'),
    glowIntensity: gl.getUniformLocation(p.composite, 'u_glowIntensity'),
    noiseSpeed: gl.getUniformLocation(p.composite, 'u_noiseSpeed'),
    noiseScale: gl.getUniformLocation(p.composite, 'u_noiseScale'),
    blackLeft: gl.getUniformLocation(p.composite, 'u_blackLeft'),
    blackRight: gl.getUniformLocation(p.composite, 'u_blackRight'),
    blackBottom: gl.getUniformLocation(p.composite, 'u_blackBottom'),
    dynLeft: gl.getUniformLocation(p.composite, 'u_dynLeft'),
    dynRight: gl.getUniformLocation(p.composite, 'u_dynRight'),
    dynBottom: gl.getUniformLocation(p.composite, 'u_dynBottom'),
    effectOpacity: gl.getUniformLocation(p.composite, 'u_effectOpacity'),
    pixelSize: gl.getUniformLocation(p.composite, 'u_pixelSize'),
    pixelDivisor: gl.getUniformLocation(p.composite, 'u_pixelDivisor'),
    pixelExponent: gl.getUniformLocation(p.composite, 'u_pixelExponent'),
  },
});

export type { EdgeGlowPrograms };
export { compilePrograms, getUniformLocations };
