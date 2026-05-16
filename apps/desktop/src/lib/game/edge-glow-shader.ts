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
    // Inside map: pass through
    gl_FragColor = texture2D(u_gameTexture, v_uv);
    return;
  }

  // Compute reflected UV
  vec2 reflectedUV = v_uv;

  if (inLeft) {
    // Distance into left black region (pixels from game edge)
    float dist = leftBound - pixelX;
    // Mirror: sample from leftBound + dist
    float mirrorX = leftBound + dist;
    reflectedUV.x = mirrorX / u_resolution.x;
  } else if (inRight) {
    float dist = pixelX - rightBound;
    float mirrorX = rightBound - dist;
    reflectedUV.x = mirrorX / u_resolution.x;
  }

  if (inBottom) {
    float dist = pixelY - bottomBound;
    float mirrorY = bottomBound - dist;
    reflectedUV.y = mirrorY / u_resolution.y;
  }

  // Clamp to valid range
  reflectedUV = clamp(reflectedUV, 0.0, 1.0);
  gl_FragColor = texture2D(u_gameTexture, reflectedUV);
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

// Composite: show mirror in black regions, game elsewhere (debug: no blur/noise)
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

void main() {
  float pixelX = v_uv.x * u_resolution.x;
  float pixelY = v_uv.y * u_resolution.y;

  float leftBound = u_blackLeft * 2.0;
  float rightBound = u_resolution.x - u_blackRight * 2.0;
  float bottomBound = u_resolution.y - u_blackBottom * 2.0;

  float dLeft = (u_blackLeft > 0.0) ? (leftBound - pixelX) : -9999.0;
  float dRight = (u_blackRight > 0.0) ? (pixelX - rightBound) : -9999.0;
  float dBottom = (u_blackBottom > 0.0) ? (pixelY - bottomBound) : -9999.0;

  float maxDist = max(max(dLeft, dRight), dBottom);

  if (maxDist <= 0.0) {
    gl_FragColor = texture2D(u_gameTexture, v_uv);
    return;
  }

  // Pure mirror - no blur, no noise, no falloff
  gl_FragColor = texture2D(u_mirrorTexture, v_uv);
}
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EdgeGlowRenderer {
  render(gameCanvas: HTMLCanvasElement, time: number): void;
  resize(width: number, height: number): void;
  setEnabled(enabled: boolean): void;
  setBlackBounds(left: number, right: number, bottom: number): void;
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
    noiseScale = 4.0,
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

  const gameTexture = createTextureNearest(gl);
  // 3 FBOs: mirror (persistent sharp reflection), A & B for blur ping-pong
  let fboMirror = createFBO(gl, width, height);
  let fboA = createFBO(gl, width, height);
  let fboB = createFBO(gl, width, height);

  // ─── Public API ───

  function render(gameCanvas: HTMLCanvasElement, time: number): void {
    if (gameCanvas.width !== width || gameCanvas.height !== height) {
      resize(gameCanvas.width, gameCanvas.height);
    }

    // Upload game canvas as texture
    gl.bindTexture(gl.TEXTURE_2D, gameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

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

    // ─── Pass 1: Mirror reflection ───
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboMirror.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(mirrorProg);
    gl.uniform1i(mirrorUniforms.gameTexture, 0);
    gl.uniform2f(mirrorUniforms.resolution, width, height);
    gl.uniform1f(mirrorUniforms.blackLeft, blackLeft);
    gl.uniform1f(mirrorUniforms.blackRight, blackRight);
    gl.uniform1f(mirrorUniforms.blackBottom, blackBottom);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gameTexture);
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
    gl.uniform1f(compositeUniforms.blackLeft, blackLeft);
    gl.uniform1f(compositeUniforms.blackRight, blackRight);
    gl.uniform1f(compositeUniforms.blackBottom, blackBottom);

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
    fboMirror = createFBO(gl, width, height);
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

  function dispose(): void {
    gl.deleteProgram(mirrorProg);
    gl.deleteProgram(blurHProg);
    gl.deleteProgram(blurVProg);
    gl.deleteProgram(compositeProg);
    gl.deleteBuffer(quadBuffer);
    gl.deleteTexture(gameTexture);
    destroyFBO(gl, fboMirror);
    destroyFBO(gl, fboA);
    destroyFBO(gl, fboB);
  }

  return { render, resize, setEnabled, setBlackBounds, dispose };
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
