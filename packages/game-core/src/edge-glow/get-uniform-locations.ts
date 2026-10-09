/* @layer bridge-wasm @kind logic */
import type { EdgeGlowPrograms } from './edge-glow-programs.type';

const getUniformLocations = (gl: WebGLRenderingContext, p: EdgeGlowPrograms) => ({
  mirror: {
    gameTexture: gl.getUniformLocation(p.mirror, 'u_gameTexture'),
    resolution: gl.getUniformLocation(p.mirror, 'u_resolution'),
    blackLeft: gl.getUniformLocation(p.mirror, 'u_blackLeft'),
    blackRight: gl.getUniformLocation(p.mirror, 'u_blackRight'),
    blackBottom: gl.getUniformLocation(p.mirror, 'u_blackBottom'),
    blackTop: gl.getUniformLocation(p.mirror, 'u_blackTop'),
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
    blackTop: gl.getUniformLocation(p.composite, 'u_blackTop'),
    dynLeft: gl.getUniformLocation(p.composite, 'u_dynLeft'),
    dynRight: gl.getUniformLocation(p.composite, 'u_dynRight'),
    dynBottom: gl.getUniformLocation(p.composite, 'u_dynBottom'),
    dynTop: gl.getUniformLocation(p.composite, 'u_dynTop'),
    effectOpacity: gl.getUniformLocation(p.composite, 'u_effectOpacity'),
    pixelSize: gl.getUniformLocation(p.composite, 'u_pixelSize'),
    pixelDivisor: gl.getUniformLocation(p.composite, 'u_pixelDivisor'),
    pixelExponent: gl.getUniformLocation(p.composite, 'u_pixelExponent'),
  },
});

export { getUniformLocations };
