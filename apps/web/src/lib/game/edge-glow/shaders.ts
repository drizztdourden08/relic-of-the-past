/* @layer bridge-wasm @kind logic */
/**
 * GLSL shader sources for the edge-glow post-processing pipeline.
 *
 * Passes:
 *   1. Mirror: reflect game pixels into black bar regions
 *   2. Blur H/V: progressive Gaussian blur on mirrored texture
 *   3. Composite: blend sharp reflection → blurred with Voronoi noise animation
 *      (lives in composite-frag.ts — the largest source — re-exported below)
 */
import { COMPOSITE_FRAG } from './composite-frag';

const FULLSCREEN_VERT = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const MIRROR_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_gameTexture;
uniform vec2 u_resolution;
uniform float u_blackLeft;
uniform float u_blackRight;
uniform float u_blackBottom;
uniform float u_swizzleBR;

void main() {
  float pixelX = v_uv.x * u_resolution.x;
  float pixelY = v_uv.y * u_resolution.y;

  float leftBound = u_blackLeft * 2.0;
  float rightBound = u_resolution.x - u_blackRight * 2.0;
  float bottomBound = u_resolution.y - u_blackBottom * 2.0;

  bool inLeft = pixelX < leftBound && u_blackLeft > 0.0;
  bool inRight = pixelX > rightBound && u_blackRight > 0.0;
  bool inBottom = pixelY > bottomBound && u_blackBottom > 0.0;

  if (!inLeft && !inRight && !inBottom) {
    vec4 c = texture2D(u_gameTexture, v_uv);
    if (u_swizzleBR > 0.5) c = vec4(c.b, c.g, c.r, c.a);
    gl_FragColor = c;
    return;
  }

  vec2 mirrorUV = v_uv;

  if (inLeft) {
    float mirrorX = 2.0 * leftBound - pixelX;
    mirrorUV.x = mirrorX / u_resolution.x;
  } else if (inRight) {
    float mirrorX = 2.0 * rightBound - pixelX;
    mirrorUV.x = mirrorX / u_resolution.x;
  }

  if (inBottom) {
    float mirrorY = 2.0 * bottomBound - pixelY;
    mirrorUV.y = mirrorY / u_resolution.y;
  }

  mirrorUV = clamp(mirrorUV, 0.0, 1.0);
  vec4 c = texture2D(u_gameTexture, mirrorUV);
  if (u_swizzleBR > 0.5) c = vec4(c.b, c.g, c.r, c.a);
  gl_FragColor = c;
}
`;

const BLUR_H_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_radius;

void main() {
  vec2 texel = vec2(1.0 / u_resolution.x, 0.0);
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  for (float i = -20.0; i <= 20.0; i += 1.0) {
    float offset = i * u_radius / 20.0;
    float weight = exp(-0.5 * (i / 8.0) * (i / 8.0));
    sum += texture2D(u_texture, v_uv + texel * offset) * weight;
    totalWeight += weight;
  }

  gl_FragColor = sum / totalWeight;
}
`;

const BLUR_V_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_radius;

void main() {
  vec2 texel = vec2(0.0, 1.0 / u_resolution.y);
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  for (float i = -20.0; i <= 20.0; i += 1.0) {
    float offset = i * u_radius / 20.0;
    float weight = exp(-0.5 * (i / 8.0) * (i / 8.0));
    sum += texture2D(u_texture, v_uv + texel * offset) * weight;
    totalWeight += weight;
  }

  gl_FragColor = sum / totalWeight;
}
`;

export { FULLSCREEN_VERT, MIRROR_FRAG, BLUR_H_FRAG, BLUR_V_FRAG, COMPOSITE_FRAG };
