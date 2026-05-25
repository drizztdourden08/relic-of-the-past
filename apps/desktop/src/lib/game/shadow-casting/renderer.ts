/**
 * Shadow Casting Renderer — WebGL post-processing pipeline.
 *
 * Architecture:
 *   1. Heightmap texture: CPU-rasterized from shape elements, uploaded when data changes
 *   2. Shadow pass: Ray-march through heightmap for sun + point lights
 *   3. Blur pass: Soften shadow edges (H + V separable blur)
 *   4. Composite pass: Multiply light map over game frame
 */

import type { ShadowRenderer, ShadowRendererOptions } from './types';
import type { ScreenShadowData } from '@shared/types/shadow-casting';
import { DEFAULT_LIGHTING_CONFIG } from '@shared/types/shadow-casting';
import { FULLSCREEN_VERT, SHADOW_FRAG, BLUR_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram, createFBO, destroyFBO, drawQuad, type FBO } from './gl-helpers';
import { buildHeightmapTexture } from './heightmap-builder';
import { computeLightUniforms, MAX_LIGHTS } from './light-calculator';

function createShadowRenderer(
  canvas: HTMLCanvasElement,
  _options: ShadowRendererOptions = {},
): ShadowRenderer | null {
  const glOrNull = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });

  if (!glOrNull) {
    console.warn('[ShadowCasting] WebGL not available');
    return null;
  }

  const gl: WebGLRenderingContext = glOrNull;

  // ─── Compile shaders ───
  const shadowProg = createProgram(gl, FULLSCREEN_VERT, SHADOW_FRAG);
  const blurProg = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG);
  const compositeProg = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);

  if (!shadowProg || !blurProg || !compositeProg) {
    console.error('[ShadowCasting] Failed to compile shader programs');
    return null;
  }

  // ─── Uniform locations ───
  const shadowUniforms = {
    heightmap: gl.getUniformLocation(shadowProg, 'u_heightmap'),
    gameTexture: gl.getUniformLocation(shadowProg, 'u_gameTexture'),
    resolution: gl.getUniformLocation(shadowProg, 'u_resolution'),
    sunEnabled: gl.getUniformLocation(shadowProg, 'u_sunEnabled'),
    sunAngle: gl.getUniformLocation(shadowProg, 'u_sunAngle'),
    sunElevation: gl.getUniformLocation(shadowProg, 'u_sunElevation'),
    sunIntensity: gl.getUniformLocation(shadowProg, 'u_sunIntensity'),
    ambientIntensity: gl.getUniformLocation(shadowProg, 'u_ambientIntensity'),
    time: gl.getUniformLocation(shadowProg, 'u_time'),
    dayNightCycle: gl.getUniformLocation(shadowProg, 'u_dayNightCycle'),
    cycleSpeed: gl.getUniformLocation(shadowProg, 'u_cycleSpeed'),
    debugMode: gl.getUniformLocation(shadowProg, 'u_debugMode'),
    numLights: gl.getUniformLocation(shadowProg, 'u_numLights'),
    lightPos: gl.getUniformLocation(shadowProg, 'u_lightPos'),
    lightColor: gl.getUniformLocation(shadowProg, 'u_lightColor'),
    lightIntensity: gl.getUniformLocation(shadowProg, 'u_lightIntensity'),
    lightCastShadow: gl.getUniformLocation(shadowProg, 'u_lightCastShadow'),
  };

  const blurUniforms = {
    texture: gl.getUniformLocation(blurProg, 'u_texture'),
    heightmap: gl.getUniformLocation(blurProg, 'u_heightmap'),
    resolution: gl.getUniformLocation(blurProg, 'u_resolution'),
    radius: gl.getUniformLocation(blurProg, 'u_radius'),
    direction: gl.getUniformLocation(blurProg, 'u_direction'),
  };

  const compositeUniforms = {
    gameTexture: gl.getUniformLocation(compositeProg, 'u_gameTexture'),
    lightTexture: gl.getUniformLocation(compositeProg, 'u_lightTexture'),
  };

  // ─── Quad buffer ───
  const quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  // ─── Framebuffers ───
  let width = canvas.width;
  let height = canvas.height;
  let shadowFBO = createFBO(gl, width, height);
  let blurFBO1 = createFBO(gl, width, height);
  let blurFBO2 = createFBO(gl, width, height);

  // ─── Textures ───
  // Heightmap is rebuilt every frame at viewport dimensions (matches game canvas exactly)
  const heightmapTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(width * height));

  const gameTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, gameTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // ─── State ───
  let enabled = false;
  let debugMode = false;
  let screenData: ScreenShadowData | null = null;

  // Viewport world-space origin (viewLeft, viewTop) — updated every frame
  let viewOriginX = 0;
  let viewOriginY = 0;
  // Viewport size in SNES pixels
  let snesWidth = 512;
  let snesHeight = 240;

  function rebuildHeightmap(): void {
    if (!screenData || screenData.heightmap.length === 0) return;
    // Build heightmap in viewport-local space, exactly matching the ConnectionOverlay's coords.
    // offset = (viewLeft, viewTop) converts world coords → viewport-local coords.
    const texData = buildHeightmapTexture(screenData.heightmap, snesWidth, snesHeight, viewOriginX, viewOriginY);
    gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
    // LUMINANCE = 1 byte/pixel; width may not be multiple of 4, so disable row alignment
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, snesWidth, snesHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, texData);
  }

  function resizeFBOs(w: number, h: number): void {
    destroyFBO(gl, shadowFBO);
    destroyFBO(gl, blurFBO1);
    destroyFBO(gl, blurFBO2);
    shadowFBO = createFBO(gl, w, h);
    blurFBO1 = createFBO(gl, w, h);
    blurFBO2 = createFBO(gl, w, h);
    width = w;
    height = h;
  }

  const renderer: ShadowRenderer = {
    render(gameCanvas: HTMLCanvasElement, time: number): void {
      if (!enabled || !screenData) {
        // Clear to fully transparent so it doesn't affect the game
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }

      // Rebuild heightmap every frame at current viewport position
      // (matches ConnectionOverlay's coordinate approach exactly)
      rebuildHeightmap();

      // Upload game canvas as texture
      gl.bindTexture(gl.TEXTURE_2D, gameTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

      const lighting = screenData.lighting;
      const lightUniforms = computeLightUniforms(screenData.lights, gameCanvas);

      // Offset light positions to viewport-local space
      for (let i = 0; i < lightUniforms.numLights; i++) {
        lightUniforms.positions[i * 3] -= viewOriginX;
        lightUniforms.positions[i * 3 + 1] -= viewOriginY;
      }

      // ─── Pass 1: Shadow computation ───
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFBO.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.useProgram(shadowProg);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
      gl.uniform1i(shadowUniforms.heightmap, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, gameTex);
      gl.uniform1i(shadowUniforms.gameTexture, 1);

      gl.uniform2f(shadowUniforms.resolution, snesWidth, snesHeight);
      gl.uniform1f(shadowUniforms.sunEnabled, lighting.sunEnabled ? 1.0 : 0.0);
      gl.uniform1f(shadowUniforms.sunAngle, lighting.sunAngle * Math.PI / 180);
      gl.uniform1f(shadowUniforms.sunElevation, lighting.sunElevation * Math.PI / 180);
      gl.uniform1f(shadowUniforms.sunIntensity, lighting.sunIntensity);
      gl.uniform1f(shadowUniforms.ambientIntensity, lighting.ambientIntensity);
      gl.uniform1f(shadowUniforms.time, time / 1000);
      gl.uniform1f(shadowUniforms.dayNightCycle, lighting.dayNightCycle ? 1.0 : 0.0);
      gl.uniform1f(shadowUniforms.cycleSpeed, lighting.cycleSpeed);
      gl.uniform1f(shadowUniforms.debugMode, debugMode ? 1.0 : 0.0);

      // Upload light uniforms
      gl.uniform1i(shadowUniforms.numLights, lightUniforms.numLights);
      gl.uniform3fv(shadowUniforms.lightPos, lightUniforms.positions);
      gl.uniform3fv(shadowUniforms.lightColor, lightUniforms.colors);
      gl.uniform1fv(shadowUniforms.lightIntensity, lightUniforms.intensities);
      gl.uniform1fv(shadowUniforms.lightCastShadow, lightUniforms.castShadows);

      drawQuad(gl, shadowProg, quadBuffer);

      // ─── Pass 2: Blur H ───
      const blurRadius = lighting.shadowSoftness * 8.0; // 0–8px blur
      if (blurRadius > 0.1 && !debugMode) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, blurFBO1.framebuffer);
        gl.viewport(0, 0, width, height);
        gl.useProgram(blurProg);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shadowFBO.texture);
        gl.uniform1i(blurUniforms.texture, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
        gl.uniform1i(blurUniforms.heightmap, 1);
        gl.uniform2f(blurUniforms.resolution, width, height);
        gl.uniform1f(blurUniforms.radius, blurRadius);
        gl.uniform2f(blurUniforms.direction, 1.0, 0.0);

        drawQuad(gl, blurProg, quadBuffer);

        // ─── Pass 3: Blur V ───
        gl.bindFramebuffer(gl.FRAMEBUFFER, blurFBO2.framebuffer);
        gl.viewport(0, 0, width, height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, blurFBO1.texture);
        gl.uniform1i(blurUniforms.texture, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, heightmapTex);
        gl.uniform1i(blurUniforms.heightmap, 1);
        gl.uniform2f(blurUniforms.direction, 0.0, 1.0);

        drawQuad(gl, blurProg, quadBuffer);
      }

      // ─── Pass 4: Composite ───
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(compositeProg);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gameTex);
      gl.uniform1i(compositeUniforms.gameTexture, 0);

      gl.activeTexture(gl.TEXTURE1);
      const lightTex = (blurRadius > 0.1 && !debugMode) ? blurFBO2.texture : shadowFBO.texture;
      gl.bindTexture(gl.TEXTURE_2D, lightTex);
      gl.uniform1i(compositeUniforms.lightTexture, 1);

      drawQuad(gl, compositeProg, quadBuffer);
    },

    setScreenData(data: ScreenShadowData | null): void {
      screenData = data;
      if (!data || (data.heightmap.length === 0 && data.lights.length === 0)) {
        enabled = false;
      }
    },

    setScreenOrigin(viewLeft: number, viewTop: number, viewWidth: number, viewHeight: number): void {
      viewOriginX = viewLeft;
      viewOriginY = viewTop;
      snesWidth = viewWidth;
      snesHeight = viewHeight;
    },

    resize(w: number, h: number): void {
      if (w === width && h === height) return;
      canvas.width = w;
      canvas.height = h;
      resizeFBOs(w, h);
    },

    setEnabled(value: boolean): void {
      enabled = value;
    },

    setDebugMode(value: boolean): void {
      debugMode = value;
    },

    dispose(): void {
      gl.deleteTexture(heightmapTex);
      gl.deleteTexture(gameTex);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(shadowProg);
      gl.deleteProgram(blurProg);
      gl.deleteProgram(compositeProg);
      destroyFBO(gl, shadowFBO);
      destroyFBO(gl, blurFBO1);
      destroyFBO(gl, blurFBO2);
    },
  };

  return renderer;
}

export { createShadowRenderer };
