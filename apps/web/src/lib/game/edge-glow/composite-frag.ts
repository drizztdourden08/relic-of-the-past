/* @layer bridge-wasm @kind logic */
/** Composite pass fragment shader: blend sharp reflection → blurred with Voronoi
 *  noise animation, pixelation mask, and edge fade. Split from shaders.ts for size. */
const COMPOSITE_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_gameTexture;
uniform sampler2D u_mirrorTexture;
uniform sampler2D u_blurTexture;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_glowIntensity;
uniform float u_noiseSpeed;
uniform float u_noiseScale;
uniform float u_blackLeft;
uniform float u_blackRight;
uniform float u_blackBottom;
uniform float u_dynLeft;
uniform float u_dynRight;
uniform float u_dynBottom;
uniform float u_effectOpacity;
uniform float u_pixelSize;
uniform float u_pixelDivisor;
uniform float u_pixelExponent;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float voronoi(vec2 uv, float time) {
  vec2 cell = floor(uv);
  vec2 frac = fract(uv);
  float minDist = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(cell + neighbor);
      point = 0.5 + 0.5 * sin(time * 0.3 + 6.2831 * point);
      vec2 diff = neighbor + point - frac;
      minDist = min(minDist, length(diff));
    }
  }
  return minDist;
}

vec3 desaturate(vec3 color, float amount) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(color, vec3(lum), amount);
}

void main() {
  vec4 game = texture2D(u_gameTexture, v_uv);
  float brightness = dot(game.rgb, vec3(0.299, 0.587, 0.114));

  float pixelX = v_uv.x * u_resolution.x;
  float pixelY = v_uv.y * u_resolution.y;
  float dynLeftBound = u_dynLeft * 2.0;
  float dynRightBound = u_resolution.x - u_dynRight * 2.0;
  float dynBottomBound = u_resolution.y - u_dynBottom * 2.0;

  bool inEffectZone = (pixelX < dynLeftBound && u_dynLeft > 0.0)
                   || (pixelX > dynRightBound && u_dynRight > 0.0)
                   || (pixelY > dynBottomBound && u_dynBottom > 0.0);

  if (!inEffectZone) {
    gl_FragColor = game;
    return;
  }

  float gameAlpha = smoothstep(0.004, 0.02, brightness);
  if (gameAlpha > 0.99) {
    gl_FragColor = game;
    return;
  }

  // Compute edge distance first (needed for pixelation mask)
  float edgePixelDist = 0.0;
  if (pixelX < dynLeftBound)
    edgePixelDist = max(edgePixelDist, dynLeftBound - pixelX);
  if (pixelX > dynRightBound)
    edgePixelDist = max(edgePixelDist, pixelX - dynRightBound);
  if (pixelY > dynBottomBound)
    edgePixelDist = max(edgePixelDist, pixelY - dynBottomBound);

  // Pixelation mask: transitions from no pixelation near game edge to full further out
  float pixelMask = pow(clamp(edgePixelDist / u_pixelDivisor, 0.0, 1.0), u_pixelExponent);

  vec2 fboUV = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 snappedUV = fboUV;
  if (u_pixelSize > 1.0) {
    vec2 pixelCoord = fboUV * u_resolution;
    snappedUV = (floor(pixelCoord / u_pixelSize) + 0.5) * u_pixelSize / u_resolution;
  }
  vec4 mirror = mix(texture2D(u_mirrorTexture, fboUV), texture2D(u_mirrorTexture, snappedUV), pixelMask);
  vec4 blur = mix(texture2D(u_blurTexture, fboUV), texture2D(u_blurTexture, snappedUV), pixelMask);

  float mirrorBrightness = dot(mirror.rgb, vec3(0.299, 0.587, 0.114));
  if (mirrorBrightness < 0.002 && gameAlpha < 0.01) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float maxLeftExtent = u_blackLeft * 2.0;
  float maxRightExtent = u_blackRight * 2.0;
  float maxBottomExtent = u_blackBottom * 2.0;

  float dist = 0.0;
  if (pixelX < dynLeftBound && maxLeftExtent > 0.0)
    dist = max(dist, (dynLeftBound - pixelX) / maxLeftExtent);
  if (pixelX > dynRightBound && maxRightExtent > 0.0)
    dist = max(dist, (pixelX - dynRightBound) / maxRightExtent);
  if (pixelY > dynBottomBound && maxBottomExtent > 0.0)
    dist = max(dist, (pixelY - dynBottomBound) / maxBottomExtent);
  dist = clamp(dist, 0.0, 1.0);

  float blurMix = pow(clamp(edgePixelDist / 15.0, 0.0, 1.0), 0.55) * u_effectOpacity;
  vec4 color = mix(mirror, blur, blurMix);

  // Snap Voronoi UV to same pixel grid so noise is also blocky
  vec2 voronoiBaseUV = mix(v_uv, snappedUV, pixelMask);
  vec2 voronoiUV = voronoiBaseUV * u_noiseScale;
  float v = voronoi(voronoiUV, u_time * u_noiseSpeed);

  float distFactor = smoothstep(30.0, 200.0, edgePixelDist) * u_effectOpacity;
  float cellDesat = smoothstep(0.1, 0.5, v);
  float totalDesat = distFactor * cellDesat;
  color.rgb = desaturate(color.rgb, totalDesat);

  float cellDarken = smoothstep(0.2, 0.6, v) * distFactor;
  color.rgb *= 1.0 - cellDarken * 0.6;

  float fade = 1.0 - smoothstep(50.0, 200.0, edgePixelDist) * u_effectOpacity;
  vec4 effectColor = vec4(color.rgb * fade * u_glowIntensity, 1.0);
  gl_FragColor = mix(effectColor, game, gameAlpha);
}
`;

export { COMPOSITE_FRAG };
