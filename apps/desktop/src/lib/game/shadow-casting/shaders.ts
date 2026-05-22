/**
 * GLSL shader sources for the shadow-casting post-processing pipeline.
 *
 * Passes:
 *   1. Heightmap: Render heightmap elements into a single-channel texture
 *   2. Shadow: Ray-march from sun/lights through heightmap to compute occlusion
 *   3. Blur: Soften shadow edges based on shadowSoftness
 *   4. Composite: Multiply shadow texture over game frame (darken in shadow, brighten from lights)
 */

/** Fullscreen quad vertex shader (shared across all passes) */
const FULLSCREEN_VERT = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * Shadow computation fragment shader.
 * Takes a heightmap texture and computes shadow occlusion based on
 * directional (sun) light and point/shape lights.
 */
const SHADOW_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;

uniform sampler2D u_heightmap;
uniform sampler2D u_gameTexture;
uniform vec2 u_resolution;

// Sun parameters
uniform float u_sunEnabled;
uniform float u_sunAngle;       // radians
uniform float u_sunElevation;   // radians
uniform float u_sunIntensity;
uniform float u_ambientIntensity;

// Time for day/night cycle
uniform float u_time;
uniform float u_dayNightCycle;
uniform float u_cycleSpeed;

// Point lights (up to 16)
#define MAX_LIGHTS 16
uniform int u_numLights;
uniform vec3 u_lightPos[MAX_LIGHTS];      // x, y, radius
uniform vec3 u_lightColor[MAX_LIGHTS];    // r, g, b
uniform float u_lightIntensity[MAX_LIGHTS];
uniform float u_lightCastShadow[MAX_LIGHTS];

float getHeight(vec2 uv) {
  return texture2D(u_heightmap, uv).r;
}

float traceShadowRay(vec2 pos, vec2 lightDir, float maxDist, float sourceHeight) {
  float shadow = 0.0;
  float stepSize = 1.0 / u_resolution.x;
  float steps = min(maxDist / stepSize, 64.0);

  for (float i = 1.0; i <= 64.0; i += 1.0) {
    if (i > steps) break;
    vec2 samplePos = pos + lightDir * stepSize * i;
    if (samplePos.x < 0.0 || samplePos.x > 1.0 || samplePos.y < 0.0 || samplePos.y > 1.0) break;

    float h = getHeight(samplePos);
    float progress = i / steps;
    float expectedHeight = sourceHeight * (1.0 - progress);

    if (h > expectedHeight + 0.01) {
      shadow = max(shadow, (h - expectedHeight) * 2.0);
    }
  }

  return clamp(shadow, 0.0, 1.0);
}

void main() {
  vec2 pos = v_uv;
  float height = getHeight(pos);

  // Compute effective sun angle (with optional day/night cycle)
  float sunAngle = u_sunAngle;
  float sunElevation = u_sunElevation;
  float sunIntensity = u_sunIntensity;

  if (u_dayNightCycle > 0.5) {
    float cyclePhase = mod(u_time / u_cycleSpeed, 1.0) * 6.28318;
    sunAngle = u_sunAngle + cyclePhase;
    sunElevation = u_sunElevation * sin(cyclePhase * 0.5);
    // Dim sun when below horizon
    if (sunElevation < 0.0) {
      sunIntensity *= max(0.0, 1.0 + sunElevation * 2.0);
    }
  }

  // Directional sun shadow
  float sunShadow = 0.0;
  if (u_sunEnabled > 0.5 && sunIntensity > 0.0) {
    vec2 sunDir = vec2(cos(sunAngle), sin(sunAngle));
    float shadowLength = (1.0 - sin(max(sunElevation, 0.01))) * 0.3;
    sunShadow = traceShadowRay(pos, sunDir, shadowLength, height);
  }

  // Point/shape light contributions
  vec3 lightContrib = vec3(0.0);
  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= u_numLights) break;

    vec2 lightPos = u_lightPos[i].xy / u_resolution;
    float lightRadius = u_lightPos[i].z / u_resolution.x;
    float dist = distance(pos, lightPos);

    if (dist > lightRadius) continue;

    float attenuation = 1.0 - (dist / lightRadius);
    attenuation = attenuation * attenuation; // quadratic falloff

    float lightShadow = 0.0;
    if (u_lightCastShadow[i] > 0.5) {
      vec2 dirToLight = normalize(lightPos - pos);
      lightShadow = traceShadowRay(pos, dirToLight, dist, height);
    }

    float contribution = u_lightIntensity[i] * attenuation * (1.0 - lightShadow);
    lightContrib += u_lightColor[i] * contribution;
  }

  // Combine: ambient + sun contribution + light contributions
  float sunLight = sunIntensity * (1.0 - sunShadow);
  float totalLight = u_ambientIntensity + sunLight;
  vec3 finalLight = vec3(totalLight) + lightContrib;

  // Clamp to reasonable range
  finalLight = clamp(finalLight, 0.0, 1.5);

  // Output as a light multiplier (will be applied to game frame)
  gl_FragColor = vec4(finalLight, 1.0);
}
`;

/** Shadow blur pass — Gaussian blur for soft shadow edges */
const BLUR_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_radius;
uniform vec2 u_direction; // (1,0) for horizontal, (0,1) for vertical

void main() {
  vec2 texel = u_direction / u_resolution;
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  for (float i = -12.0; i <= 12.0; i += 1.0) {
    float offset = i * u_radius / 12.0;
    float weight = exp(-0.5 * (i / 5.0) * (i / 5.0));
    sum += texture2D(u_texture, v_uv + texel * offset) * weight;
    totalWeight += weight;
  }

  gl_FragColor = sum / totalWeight;
}
`;

/** Composite pass — multiply light texture over game frame */
const COMPOSITE_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_gameTexture;
uniform sampler2D u_lightTexture;

void main() {
  vec4 gameColor = texture2D(u_gameTexture, v_uv);
  vec4 lightColor = texture2D(u_lightTexture, v_uv);

  // Multiply: darken shadowed areas, slightly brighten lit areas
  vec3 result = gameColor.rgb * lightColor.rgb;

  gl_FragColor = vec4(result, gameColor.a);
}
`;

export { FULLSCREEN_VERT, SHADOW_FRAG, BLUR_FRAG, COMPOSITE_FRAG };
