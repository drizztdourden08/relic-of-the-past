/* @layer bridge-wasm @kind logic */
/**
 * Edge Glow Renderer — WebGL post-processing pipeline.
 *
 * Strategy: Mirror-reflection + progressive blur + Voronoi noise animation.
 *
 * Architecture:
 *   1. Mirror pass: Reflect game pixels into black bar regions
 *   2. Blur passes: Progressive Gaussian blur on the mirrored texture
 *   3. Composite: Blend sharp reflection (near edge) → blurred (far from edge)
 *      with animated Voronoi noise modulating blur, saturation, and opacity
 */

import type { EdgeGlowRenderer, EdgeGlowOptions } from './types';
import { FULLSCREEN_VERT, MIRROR_FRAG, BLUR_H_FRAG, BLUR_V_FRAG, COMPOSITE_FRAG } from './shaders';
import { createProgram, createTextureNearest, createFBO, createFBONearest, destroyFBO, drawQuad } from './gl-helpers';

const createEdgeGlowRenderer = (glCanvas: HTMLCanvasElement, options: EdgeGlowOptions = {}): EdgeGlowRenderer | null => {
  const glOrNull = glCanvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!glOrNull) {
    console.warn('[EdgeGlow] WebGL not available');
    return null;
  }

  const gl = glOrNull;

  const {
    blurRadius = 16.0,
    glowIntensity = 1.0,
    noiseSpeed = 0.8,
    noiseScale = 6.0,
    blurPasses = 3,
  } = options;

  // ─── Compile shaders & link programs ───

  const mirrorProgOrNull = createProgram(gl, FULLSCREEN_VERT, MIRROR_FRAG);
  const blurHProgOrNull = createProgram(gl, FULLSCREEN_VERT, BLUR_H_FRAG);
  const blurVProgOrNull = createProgram(gl, FULLSCREEN_VERT, BLUR_V_FRAG);
  const compositeProgOrNull = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);

  if (!mirrorProgOrNull || !blurHProgOrNull || !blurVProgOrNull || !compositeProgOrNull) {
    console.error('[EdgeGlow] Failed to compile shader programs');
    return null;
  }

  const mirrorProg = mirrorProgOrNull;
  const blurHProg = blurHProgOrNull;
  const blurVProg = blurVProgOrNull;
  const compositeProg = compositeProgOrNull;

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
    pixelSize: gl.getUniformLocation(compositeProg, 'u_pixelSize'),
    pixelDivisor: gl.getUniformLocation(compositeProg, 'u_pixelDivisor'),
    pixelExponent: gl.getUniformLocation(compositeProg, 'u_pixelExponent'),
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
  let maxLeft = 0;
  let maxRight = 0;
  let maxBottom = 0;
  let effectOpacity = 1.0;
  let pixelSizeMultiplier = 10.0;
  let pixelDivisor = 60.0;
  let pixelExponent = 1.45;

  const gameTexture = createTextureNearest(gl);
  const cleanTexture = createTextureNearest(gl);
  let fboMirror = createFBONearest(gl, width, height);
  let fboA = createFBO(gl, width, height);
  let fboB = createFBO(gl, width, height);


  // ─── Public API ───

  const render = (gameCanvas: HTMLCanvasElement, time: number, cleanFrame?: { data: Uint8Array; width: number; height: number } | null): void => {
        if (gl.isContextLost()) return;
        if (gameCanvas.width !== width || gameCanvas.height !== height) {
          resize(gameCanvas.width, gameCanvas.height);
        }

        gl.bindTexture(gl.TEXTURE_2D, gameTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gameCanvas);

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

        // Pass 1: Mirror reflection
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

        // Pass 2-N: Progressive blur
        let readTex = fboMirror.texture;

        for (let pass = 0; pass < blurPasses; pass++) {
          const radius = blurRadius * (pass + 1);

          gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.framebuffer);
          gl.viewport(0, 0, width, height);
          gl.useProgram(blurHProg);
          gl.uniform1i(blurHUniforms.texture, 0);
          gl.uniform2f(blurHUniforms.resolution, width, height);
          gl.uniform1f(blurHUniforms.radius, radius);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, readTex);
          drawQuad(gl, blurHProg, quadBuffer);

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

        // Final composite → screen
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
        const pixelSize = glCanvas.clientWidth > 0 ? (glCanvas.clientWidth / width) * pixelSizeMultiplier : pixelSizeMultiplier;
        gl.uniform1f(compositeUniforms.pixelSize, pixelSize);
        gl.uniform1f(compositeUniforms.pixelDivisor, pixelDivisor);
        gl.uniform1f(compositeUniforms.pixelExponent, pixelExponent);

        drawQuad(gl, compositeProg, quadBuffer);
      };

  const resize = (w: number, h: number): void => {
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
      };

  const setEnabled = (val: boolean): void => {
        enabled = val;
      };

  const setBlackBounds = (left: number, right: number, bottom: number): void => {
        blackLeft = left;
        blackRight = right;
        blackBottom = bottom;
      };

  const setMaxBounds = (left: number, right: number, bottom: number): void => {
        maxLeft = left;
        maxRight = right;
        maxBottom = bottom;
      };

  const setEffectOpacity = (opacity: number): void => {
        effectOpacity = opacity;
      };

  const setPixelateParams = (size: number, divisor: number, exponent: number): void => {
        pixelSizeMultiplier = size;
        pixelDivisor = divisor;
        pixelExponent = exponent;
      };

  const dispose = (): void => {
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
      };

  return { render, resize, setEnabled, setBlackBounds, setMaxBounds, setEffectOpacity, setPixelateParams, dispose };
};

export { createEdgeGlowRenderer };
