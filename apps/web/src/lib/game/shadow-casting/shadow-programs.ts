/* @layer bridge-wasm @kind logic */
/** Shader-program compilation + uniform-location gathering for the shadow renderer. */
import { FULLSCREEN_VERT, SHADOW_FRAG, BLUR_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram } from '../webgl/gl-helpers';

const LABEL = '[ShadowCasting]';

interface ShadowPrograms {
  shadow: WebGLProgram;
  blur: WebGLProgram;
  composite: WebGLProgram;
}

/** Compile + link all three passes. Returns null if any program fails. */
const compilePrograms = (gl: WebGLRenderingContext): ShadowPrograms | null => {
  const shadow = createProgram(gl, FULLSCREEN_VERT, SHADOW_FRAG, LABEL);
  const blur = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG, LABEL);
  const composite = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG, LABEL);
  if (!shadow || !blur || !composite) return null;
  return { shadow, blur, composite };
};

const getUniformLocations = (gl: WebGLRenderingContext, p: ShadowPrograms) => ({
  shadow: {
    heightmap: gl.getUniformLocation(p.shadow, 'u_heightmap'),
    gameTexture: gl.getUniformLocation(p.shadow, 'u_gameTexture'),
    resolution: gl.getUniformLocation(p.shadow, 'u_resolution'),
    sunEnabled: gl.getUniformLocation(p.shadow, 'u_sunEnabled'),
    sunAngle: gl.getUniformLocation(p.shadow, 'u_sunAngle'),
    sunElevation: gl.getUniformLocation(p.shadow, 'u_sunElevation'),
    sunIntensity: gl.getUniformLocation(p.shadow, 'u_sunIntensity'),
    ambientIntensity: gl.getUniformLocation(p.shadow, 'u_ambientIntensity'),
    time: gl.getUniformLocation(p.shadow, 'u_time'),
    dayNightCycle: gl.getUniformLocation(p.shadow, 'u_dayNightCycle'),
    cycleSpeed: gl.getUniformLocation(p.shadow, 'u_cycleSpeed'),
    debugMode: gl.getUniformLocation(p.shadow, 'u_debugMode'),
    numLights: gl.getUniformLocation(p.shadow, 'u_numLights'),
    lightPos: gl.getUniformLocation(p.shadow, 'u_lightPos'),
    lightColor: gl.getUniformLocation(p.shadow, 'u_lightColor'),
    lightIntensity: gl.getUniformLocation(p.shadow, 'u_lightIntensity'),
    lightCastShadow: gl.getUniformLocation(p.shadow, 'u_lightCastShadow'),
  },
  blur: {
    texture: gl.getUniformLocation(p.blur, 'u_texture'),
    heightmap: gl.getUniformLocation(p.blur, 'u_heightmap'),
    resolution: gl.getUniformLocation(p.blur, 'u_resolution'),
    radius: gl.getUniformLocation(p.blur, 'u_radius'),
    direction: gl.getUniformLocation(p.blur, 'u_direction'),
  },
  composite: {
    gameTexture: gl.getUniformLocation(p.composite, 'u_gameTexture'),
    lightTexture: gl.getUniformLocation(p.composite, 'u_lightTexture'),
  },
});

export type { ShadowPrograms };
export { compilePrograms, getUniformLocations };
