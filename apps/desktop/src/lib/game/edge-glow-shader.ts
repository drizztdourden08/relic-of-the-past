/**
 * Edge Glow Shader — WebGL post-processing pipeline
 *
 * Strategy: Mirror-reflection + progressive smudge + Perlin noise animation
 *
 * Architecture:
 *   1. Mirror pass: Reflect game pixels into black regions (like mirrors at edges)
 *   2. Blur passes: Progressive Gaussian blur on the mirrored texture
 *   3. Composite: Blend sharp reflection (near edge) → blurred (far from edge)
 *      with animated Perlin noise modulating blur, saturation, and opacity
 */

// ─── Shader sources ───────────────────────────────────────────────────────────

const FULLSCREEN_VERT = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Mirror pass: creates reflection of game content into black regions
const MIRROR_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_gameTexture;
uniform vec2 u_resolution;
uniform float u_blackLeft;
uniform float u_blackRight;
uniform float u_blackBottom;
uniform float u_swizzleBR;  // 1.0 = swap B/R channels (BGRA source)

void main() {
  float pixelX = v_uv.x * u_resolution.x;
  float pixelY = v_uv.y * u_resolution.y;

  // Boundaries in pixel space (render scale 2x)
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

  // True mirror reflection: flip across the edge boundary
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

// Composite: game in active area, mirror+blur+voronoi decay in black regions
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
uniform float u_blackLeft;   // max bounds (for normalization)
uniform float u_blackRight;
uniform float u_blackBottom;
uniform float u_dynLeft;     // dynamic bounds (actual game edge)
uniform float u_dynRight;
uniform float u_dynBottom;
uniform float u_effectOpacity;  // 0=show game only, 1=full effect

// ─── Voronoi noise ───
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

// ─── Desaturation ───
vec3 desaturate(vec3 color, float amount) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(color, vec3(lum), amount);
}

void main() {
  // Sample the game pixel
  vec4 game = texture2D(u_gameTexture, v_uv);
  float brightness = dot(game.rgb, vec3(0.299, 0.587, 0.114));

  // Determine if this pixel is in the black bar zone (outside game bounds)
  float pixelX = v_uv.x * u_resolution.x;
  float pixelY = v_uv.y * u_resolution.y;
  float dynLeftBound = u_dynLeft * 2.0;
  float dynRightBound = u_resolution.x - u_dynRight * 2.0;
  float dynBottomBound = u_resolution.y - u_dynBottom * 2.0;

  bool inEffectZone = (pixelX < dynLeftBound && u_dynLeft > 0.0)
                   || (pixelX > dynRightBound && u_dynRight > 0.0)
                   || (pixelY > dynBottomBound && u_dynBottom > 0.0);

  // If pixel is in the game area, always show the game pixel (including HUD black)
  if (!inEffectZone) {
    gl_FragColor = game;
    return;
  }

  // We're in the effect zone — soft blend near the boundary
  float gameAlpha = smoothstep(0.004, 0.02, brightness);
  if (gameAlpha > 0.99) {
    gl_FragColor = game;
    return;
  }

  // Sample mirror (sharp) and blur FBOs
  vec2 fboUV = vec2(v_uv.x, 1.0 - v_uv.y);
  vec4 mirror = texture2D(u_mirrorTexture, fboUV);
  vec4 blur = texture2D(u_blurTexture, fboUV);

  // Check if mirror has content — if nothing reflected, show black
  float mirrorBrightness = dot(mirror.rgb, vec3(0.299, 0.587, 0.114));
  if (mirrorBrightness < 0.002 && gameAlpha < 0.01) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Max extents (for normalizing distance to 0-1)
  float maxLeftExtent = u_blackLeft * 2.0;
  float maxRightExtent = u_blackRight * 2.0;
  float maxBottomExtent = u_blackBottom * 2.0;

  // Distance from actual game edge, normalized over max possible extent
  float dist = 0.0;
  if (pixelX < dynLeftBound && maxLeftExtent > 0.0)
    dist = max(dist, (dynLeftBound - pixelX) / maxLeftExtent);
  if (pixelX > dynRightBound && maxRightExtent > 0.0)
    dist = max(dist, (pixelX - dynRightBound) / maxRightExtent);
  if (pixelY > dynBottomBound && maxBottomExtent > 0.0)
    dist = max(dist, (pixelY - dynBottomBound) / maxBottomExtent);
  dist = clamp(dist, 0.0, 1.0);

  // Blur blend: 0% at edge, linear ramp to 100% over 50 pixels, then stays 100%
  // effectOpacity scales the blur/effects but keeps mirror visible during transitions
  float edgePixelDist = 0.0;
  if (pixelX < dynLeftBound)
    edgePixelDist = max(edgePixelDist, dynLeftBound - pixelX);
  if (pixelX > dynRightBound)
    edgePixelDist = max(edgePixelDist, pixelX - dynRightBound);
  if (pixelY > dynBottomBound)
    edgePixelDist = max(edgePixelDist, pixelY - dynBottomBound);
  float blurMix = clamp(edgePixelDist / 50.0, 0.0, 1.0) * u_effectOpacity;
  vec4 color = mix(mirror, blur, blurMix);

  // ─── Voronoi-driven patchy desaturation (pixel-distance based) ───
  vec2 voronoiUV = v_uv * u_noiseScale;
  float v = voronoi(voronoiUV, u_time * u_noiseSpeed);

  // Voronoi kicks in after 30px, full effect at 200px
  float distFactor = smoothstep(30.0, 200.0, edgePixelDist) * u_effectOpacity;
  float cellDesat = smoothstep(0.1, 0.5, v);
  float totalDesat = distFactor * cellDesat;
  color.rgb = desaturate(color.rgb, totalDesat);

  // Darken cells further out
  float cellDarken = smoothstep(0.2, 0.6, v) * distFactor;
  color.rgb *= 1.0 - cellDarken * 0.6;

  // Overall fade to black: starts at 50px, fully black at 200px (scaled by effectOpacity)
  float fade = 1.0 - smoothstep(50.0, 200.0, edgePixelDist) * u_effectOpacity;
  vec4 effectColor = vec4(color.rgb * fade * u_glowIntensity, 1.0);
  gl_FragColor = mix(effectColor, game, gameAlpha);
}
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EdgeGlowRenderer {
  render(gameCanvas: HTMLCanvasElement, time: number, cleanFrame?: { data: Uint8Array; width: number; height: number } | null): void;
  resize(width: number, height: number): void;
  setEnabled(enabled: boolean): void;
  setBlackBounds(left: number, right: number, bottom: number): void;
  setMaxBounds(left: number, right: number, bottom: number): void;
  setEffectOpacity(opacity: number): void;
  dispose(): void;
}

export interface EdgeGlowOptions {
  blurRadius?: number;
  glowIntensity?: number;
  noiseSpeed?: number;
  noiseScale?: number;
  blurPasses?: number;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export function createEdgeGlowRenderer(
  glCanvas: HTMLCanvasElement,
  options: EdgeGlowOptions = {},
): EdgeGlowRenderer | null {
  const gl = glCanvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    console.warn('[EdgeGlow] WebGL not available');
    return null;
  }

  const {
    blurRadius = 16.0,
    glowIntensity = 1.0,
    noiseSpeed = 0.8,
    noiseScale = 6.0,
    blurPasses = 3,
  } = options;

  // ─── Compile shaders & link programs ───

  const mirrorProg = createProgram(gl, FULLSCREEN_VERT, MIRROR_FRAG);
  const blurHProg = createProgram(gl, FULLSCREEN_VERT, BLUR_H_FRAG);
  const blurVProg = createProgram(gl, FULLSCREEN_VERT, BLUR_V_FRAG);
  const compositeProg = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);

  if (!mirrorProg || !blurHProg || !blurVProg || !compositeProg) {
    console.error('[EdgeGlow] Failed to compile shader programs');
    return null;
  }

  // ─── Uniform locations ───

  const mirrorUniforms = {
    gameTexture: gl.getUniformLocation(mirrorProg, 'u_gameTexture'),
    resolution: gl.getUniformLocation(mirrorProg, 'u_resolution'),
    blackLeft: gl.getUniformLocation(mirrorProg, 'u_blackLeft'),
    blackRight: gl.getUniformLocation(mirrorProg, 'u_blackRight'),
    blackBottom: gl.getUniformLocation(mirrorProg, 'u_blackBottom'),
    swizzleBR: gl.getUniformLocation(mirrorProg, 'u_swizzleBR'),
  };

  const blurHUniforms = {
    texture: gl.getUniformLocation(blurHProg, 'u_texture'),
    resolution: gl.getUniformLocation(blurHProg, 'u_resolution'),
    radius: gl.getUniformLocation(blurHProg, 'u_radius'),
  };

  const blurVUniforms = {
    texture: gl.getUniformLocation(blurVProg, 'u_texture'),
    resolution: gl.getUniformLocation(blurVProg, 'u_resolution'),
    radius: gl.getUniformLocation(blurVProg, 'u_radius'),
  };

  const compositeUniforms = {
    gameTexture: gl.getUniformLocation(compositeProg, 'u_gameTexture'),
    mirrorTexture: gl.getUniformLocation(compositeProg, 'u_mirrorTexture'),
    blurTexture: gl.getUniformLocation(compositeProg, 'u_blurTexture'),
    time: gl.getUniformLocation(compositeProg, 'u_time'),
    resolution: gl.getUniformLocation(compositeProg, 'u_resolution'),
    glowIntensity: gl.getUniformLocation(compositeProg, 'u_glowIntensity'),
    noiseSpeed: gl.getUniformLocation(compositeProg, 'u_noiseSpeed'),
    noiseScale: gl.getUniformLocation(compositeProg, 'u_noiseScale'),
    blackLeft: gl.getUniformLocation(compositeProg, 'u_blackLeft'),
    blackRight: gl.getUniformLocation(compositeProg, 'u_blackRight'),
    blackBottom: gl.getUniformLocation(compositeProg, 'u_blackBottom'),
    dynLeft: gl.getUniformLocation(compositeProg, 'u_dynLeft'),
    dynRight: gl.getUniformLocation(compositeProg, 'u_dynRight'),
    dynBottom: gl.getUniformLocation(compositeProg, 'u_dynBottom'),
    effectOpacity: gl.getUniformLocation(compositeProg, 'u_effectOpacity'),
  };

  // ─── Fullscreen quad geometry ───

  const quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]), gl.STATIC_DRAW);

  // ─── Textures & FBOs ───

  let width = glCanvas.width;
  let height = glCanvas.height;
  let enabled = true;
  let blackLeft = 0;
  let blackRight = 0;
  let blackBottom = 0;
  // Max bounds = fixed extent for distance gradient (no folding)
  let maxLeft = 0;
  let maxRight = 0;
  let maxBottom = 0;
  let effectOpacity = 1.0;

  const gameTexture = createTextureNearest(gl);
  // Clean frame texture (no HUD) — uploaded from WASM memory each frame
  const cleanTexture = createTextureNearest(gl);
  // Mirror FBO uses NEAREST to preserve pixel-perfect edges
  let fboMirror = createFBONearest(gl, width, height);
  let fboA = createFBO(gl, width, height);
  let fboB = createFBO(gl, width, height);

  // ─── Public API ───

  function render(gameCanvas: HTMLCanvasElement, time: number, cleanFrame?: { data: Uint8Array; width: number; height: number } | null): void {
    if (gameCanvas.width !== width || gameCanvas.height !== height) {
      resize(gameCanvas.width, gameCanvas.height);
    }

    // Upload game canvas as texture (full frame with HUD)
    gl.bindTexture(gl.TEXTURE_2D, gameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

    // Upload clean frame (no HUD) if available — used for mirror
    const mirrorSrcTexture = cleanFrame ? cleanTexture : gameTexture;
    if (cleanFrame) {
      gl.bindTexture(gl.TEXTURE_2D, cleanTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cleanFrame.width, cleanFrame.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cleanFrame.data);
    }

    if (!enabled) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(blurHProg);
      gl.uniform1i(blurHUniforms.texture, 0);
      gl.uniform2f(blurHUniforms.resolution, width, height);
      gl.uniform1f(blurHUniforms.radius, 0.0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gameTexture);
      drawQuad(gl, blurHProg, quadBuffer);
      return;
    }

    const timeSeconds = time / 1000.0;

    // ─── Pass 1: Mirror reflection (uses clean frame without HUD if available) ───
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboMirror.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(mirrorProg);
    gl.uniform1i(mirrorUniforms.gameTexture, 0);
    gl.uniform2f(mirrorUniforms.resolution, width, height);
    gl.uniform1f(mirrorUniforms.blackLeft, blackLeft);
    gl.uniform1f(mirrorUniforms.blackRight, blackRight);
    gl.uniform1f(mirrorUniforms.blackBottom, blackBottom);
    gl.uniform1f(mirrorUniforms.swizzleBR, cleanFrame ? 1.0 : 0.0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mirrorSrcTexture);
    drawQuad(gl, mirrorProg, quadBuffer);

    // ─── Pass 2-N: Progressive blur on mirrored texture ───
    let readTex = fboMirror.texture;

    for (let pass = 0; pass < blurPasses; pass++) {
      const radius = blurRadius * (pass + 1);

      // Horizontal blur
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.useProgram(blurHProg);
      gl.uniform1i(blurHUniforms.texture, 0);
      gl.uniform2f(blurHUniforms.resolution, width, height);
      gl.uniform1f(blurHUniforms.radius, radius);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readTex);
      drawQuad(gl, blurHProg, quadBuffer);

      // Vertical blur
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.useProgram(blurVProg);
      gl.uniform1i(blurVUniforms.texture, 0);
      gl.uniform2f(blurVUniforms.resolution, width, height);
      gl.uniform1f(blurVUniforms.radius, radius);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.texture);
      drawQuad(gl, blurVProg, quadBuffer);

      readTex = fboB.texture;
    }

    // ─── Final composite: game + mirror (sharp) + blur → screen ───
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(compositeProg);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gameTexture);
    gl.uniform1i(compositeUniforms.gameTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fboMirror.texture);
    gl.uniform1i(compositeUniforms.mirrorTexture, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, fboB.texture);
    gl.uniform1i(compositeUniforms.blurTexture, 2);

    gl.uniform1f(compositeUniforms.time, timeSeconds);
    gl.uniform2f(compositeUniforms.resolution, width, height);
    gl.uniform1f(compositeUniforms.glowIntensity, glowIntensity);
    gl.uniform1f(compositeUniforms.noiseSpeed, noiseSpeed);
    gl.uniform1f(compositeUniforms.noiseScale, noiseScale);
    gl.uniform1f(compositeUniforms.blackLeft, maxLeft);
    gl.uniform1f(compositeUniforms.blackRight, maxRight);
    gl.uniform1f(compositeUniforms.blackBottom, maxBottom);
    gl.uniform1f(compositeUniforms.dynLeft, blackLeft);
    gl.uniform1f(compositeUniforms.dynRight, blackRight);
    gl.uniform1f(compositeUniforms.dynBottom, blackBottom);
    gl.uniform1f(compositeUniforms.effectOpacity, effectOpacity);

    drawQuad(gl, compositeProg, quadBuffer);
  }

  function resize(w: number, h: number): void {
    width = w;
    height = h;
    glCanvas.width = w;
    glCanvas.height = h;

    destroyFBO(gl, fboMirror);
    destroyFBO(gl, fboA);
    destroyFBO(gl, fboB);
    fboMirror = createFBONearest(gl, width, height);
    fboA = createFBO(gl, width, height);
    fboB = createFBO(gl, width, height);
  }

  function setEnabled(val: boolean): void {
    enabled = val;
  }

  function setBlackBounds(left: number, right: number, bottom: number): void {
    blackLeft = left;
    blackRight = right;
    blackBottom = bottom;
  }

  function setMaxBounds(left: number, right: number, bottom: number): void {
    maxLeft = left;
    maxRight = right;
    maxBottom = bottom;
  }

  function setEffectOpacity(opacity: number): void {
    effectOpacity = opacity;
  }

  function dispose(): void {
    gl.deleteProgram(mirrorProg);
    gl.deleteProgram(blurHProg);
    gl.deleteProgram(blurVProg);
    gl.deleteProgram(compositeProg);
    gl.deleteBuffer(quadBuffer);
    gl.deleteTexture(gameTexture);
    gl.deleteTexture(cleanTexture);
    destroyFBO(gl, fboMirror);
    destroyFBO(gl, fboA);
    destroyFBO(gl, fboB);
  }

  return { render, resize, setEnabled, setBlackBounds, setMaxBounds, setEffectOpacity, dispose };
}

// ─── GL Helpers ───────────────────────────────────────────────────────────────

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[EdgeGlow] Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[EdgeGlow] Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  // Shaders can be detached after linking
  gl.detachShader(program, vert);
  gl.detachShader(program, frag);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
}

function createTexture(gl: WebGLRenderingContext): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function createTextureNearest(gl: WebGLRenderingContext): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

interface FBO {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

function createFBO(gl: WebGLRenderingContext, width: number, height: number): FBO {
  const texture = createTexture(gl);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const framebuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { framebuffer, texture };
}

function createFBONearest(gl: WebGLRenderingContext, width: number, height: number): FBO {
  const texture = createTextureNearest(gl);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const framebuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { framebuffer, texture };
}

function destroyFBO(gl: WebGLRenderingContext, fbo: FBO): void {
  gl.deleteFramebuffer(fbo.framebuffer);
  gl.deleteTexture(fbo.texture);
}

function drawQuad(gl: WebGLRenderingContext, program: WebGLProgram, buffer: WebGLBuffer): void {
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
