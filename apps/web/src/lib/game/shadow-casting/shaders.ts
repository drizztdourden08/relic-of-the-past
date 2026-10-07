/* @layer bridge-wasm @kind logic */
// Shadow-casting passes: heightmap (single-channel texture) -> shadow (ray-march from sun/lights)
// -> blur (shadowSoftness) -> composite (multiply over the game frame).

/** Fullscreen quad vertex shader (shared across all passes) */
const FULLSCREEN_VERT = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  // Standard FBO-compatible UVs: (0,0)=bottom-left, (1,1)=top-right
  v_uv = a_position.xy * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Shadow fragment shader: occlusion from the heightmap for the sun and point/shape lights. */
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

// Debug visualization
uniform float u_debugMode; // 0=off, 1=heightmap+edges

// Point lights (up to 16)
#define MAX_LIGHTS 16
uniform int u_numLights;
uniform vec3 u_lightPos[MAX_LIGHTS];      // x, y, radius (in viewport-local pixels)
uniform vec3 u_lightColor[MAX_LIGHTS];    // r, g, b
uniform float u_lightIntensity[MAX_LIGHTS];
uniform float u_lightCastShadow[MAX_LIGHTS];

float getHeight(vec2 uv) {
  // v_uv is in GL convention (Y-up: 0=bottom, 1=top) but the heightmap
  // was uploaded with row 0 = viewport top (stored at texture t=0 = bottom).
  // Flip Y to map screen-top to data-row-0 correctly.
  vec2 hmUV = vec2(uv.x, 1.0 - uv.y);
  if (hmUV.x < 0.0 || hmUV.x > 1.0 || hmUV.y < 0.0 || hmUV.y > 1.0) return 0.0;
  return texture2D(u_heightmap, hmUV).r;
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

    // With hard-edged heightmap: h is either 0 (ground) or full height (shape).
    // A pixel is shadowed if the ray hits something taller than it.
    float heightDiff = h - sourceHeight;
    if (heightDiff > 0.02) {
      float distFade = 1.0 - (i / steps);
      shadow = max(shadow, min(heightDiff * 3.0, 1.0) * distFade);
    }
  }

  return clamp(shadow, 0.0, 1.0);
}

void main() {
  // Heightmap is viewport-local: v_uv maps directly to the heightmap
  float height = getHeight(v_uv);

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
    sunShadow = traceShadowRay(v_uv, sunDir, shadowLength, height);
  }

  // Point/shape light contributions
  vec3 lightContrib = vec3(0.0);
  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= u_numLights) break;

    // Light positions are in viewport-local pixels, convert to UV
    vec2 lightPos = u_lightPos[i].xy / u_resolution;
    float lightRadius = u_lightPos[i].z / u_resolution.x;
    float dist = distance(v_uv, lightPos);

    if (dist > lightRadius) continue;

    float attenuation = 1.0 - (dist / lightRadius);
    attenuation = attenuation * attenuation; // quadratic falloff

    float lightShadow = 0.0;
    if (u_lightCastShadow[i] > 0.5) {
      vec2 dirToLight = normalize(lightPos - v_uv);
      lightShadow = traceShadowRay(v_uv, dirToLight, dist, height);
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

  // Debug mode: visualize heightmap, edges, and shadow regions
  if (u_debugMode > 0.5) {
    float h = getHeight(v_uv);
    float stepX = 1.0 / u_resolution.x;
    float stepY = 1.0 / u_resolution.y;

    // Sample neighbors for edge detection (Sobel-like)
    float hL = getHeight(v_uv + vec2(-stepX, 0.0));
    float hR = getHeight(v_uv + vec2( stepX, 0.0));
    float hU = getHeight(v_uv + vec2(0.0,  stepY));
    float hD = getHeight(v_uv + vec2(0.0, -stepY));
    float edgeH = abs(hR - hL);
    float edgeV = abs(hU - hD);
    float edge = clamp((edgeH + edgeV) * 8.0, 0.0, 1.0);

    // Red = heightmap value (shape interior; solid with hard edges)
    // Green = edge detection (shape boundary)
    // Blue tint = in shadow (ground pixels that are shadowed)
    float inShadow = (h < 0.01) ? sunShadow : 0.0;

    vec3 debugColor = vec3(0.0);
    debugColor.r = h; // shape fill (brighter = taller)
    debugColor.g = edge; // edges in green (shape boundary)
    debugColor.b = inShadow * 0.8; // shadow regions in blue

    // Make ground visible as dark grey
    if (h < 0.01 && inShadow < 0.01) {
      debugColor = vec3(0.1);
    }

    gl_FragColor = vec4(debugColor, 1.0);
    return;
  }

  // Output as a light multiplier (will be applied to game frame)
  gl_FragColor = vec4(finalLight, 1.0);
}
`;

/** Shadow blur pass: height-aware Gaussian blur for soft shadow edges.
 *  Skips samples inside shapes (height > 0) so shadow stays tight at shape edges. */
const BLUR_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_heightmap;
uniform vec2 u_resolution;
uniform float u_radius;
uniform vec2 u_direction; // (1,0) for horizontal, (0,1) for vertical

void main() {
  // If this pixel is inside a shape, it must NEVER receive shadow from blur.
  // The shape is a hard mask, so output the unblurred center value directly.
  float centerH = texture2D(u_heightmap, vec2(v_uv.x, 1.0 - v_uv.y)).r;
  if (centerH > 0.02) {
    gl_FragColor = texture2D(u_texture, v_uv);
    return;
  }

  vec2 texel = u_direction / u_resolution;
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  for (float i = -12.0; i <= 12.0; i += 1.0) {
    float offset = i * u_radius / 12.0;
    vec2 sampleUV = v_uv + texel * offset;
    // Skip samples inside a shape so only ground-to-ground blurs
    float h = texture2D(u_heightmap, vec2(sampleUV.x, 1.0 - sampleUV.y)).r;
    if (h > 0.02) continue;
    float weight = exp(-0.5 * (i / 5.0) * (i / 5.0));
    sum += texture2D(u_texture, sampleUV) * weight;
    totalWeight += weight;
  }

  if (totalWeight < 0.001) {
    gl_FragColor = texture2D(u_texture, v_uv);
  } else {
    gl_FragColor = sum / totalWeight;
  }
}
`;

/** Composite pass that outputs the light map only (CSS mix-blend-mode: multiply combines with game) */
const COMPOSITE_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_gameTexture;
uniform sampler2D u_lightTexture;

void main() {
  vec4 lightColor = texture2D(u_lightTexture, v_uv);

  // Output the light multiplier directly.
  // White (1,1,1) = fully lit, darker = shadowed.
  // CSS mix-blend-mode: multiply on the canvas handles combining with the game frame.
  gl_FragColor = vec4(lightColor.rgb, 1.0);
}
`;

export { FULLSCREEN_VERT, SHADOW_FRAG, BLUR_FRAG, COMPOSITE_FRAG };
