/**
 * Light Calculator — Computes light contribution data for the shadow shader.
 * Handles color sampling from the game canvas and prepares uniform arrays.
 */

import type { LightSource } from '@shared/types/shadow-casting';

interface LightUniforms {
  numLights: number;
  positions: Float32Array;  // [x, y, radius] × MAX_LIGHTS
  colors: Float32Array;     // [r, g, b] × MAX_LIGHTS
  intensities: Float32Array; // [intensity] × MAX_LIGHTS
  castShadows: Float32Array; // [0|1] × MAX_LIGHTS
}

const MAX_LIGHTS = 16;

function computeLightUniforms(
  lights: LightSource[],
  gameCanvas: HTMLCanvasElement | null,
): LightUniforms {
  const numLights = Math.min(lights.length, MAX_LIGHTS);
  const positions = new Float32Array(MAX_LIGHTS * 3);
  const colors = new Float32Array(MAX_LIGHTS * 3);
  const intensities = new Float32Array(MAX_LIGHTS);
  const castShadows = new Float32Array(MAX_LIGHTS);

  for (let i = 0; i < numLights; i++) {
    const light = lights[i];

    positions[i * 3] = light.x;
    positions[i * 3 + 1] = light.y;
    positions[i * 3 + 2] = light.radius;

    intensities[i] = light.intensity;
    castShadows[i] = light.castShadows ? 1.0 : 0.0;

    // Resolve color
    const [r, g, b] = resolveColor(light, gameCanvas);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  return { numLights, positions, colors, intensities, castShadows };
}

function resolveColor(
  light: LightSource,
  gameCanvas: HTMLCanvasElement | null,
): [number, number, number] {
  if (light.color === 'sample') {
    return sampleGameColor(light.x, light.y, gameCanvas);
  }
  return parseHexColor(light.color);
}

function sampleGameColor(
  x: number,
  y: number,
  canvas: HTMLCanvasElement | null,
): [number, number, number] {
  if (!canvas) return [1, 1, 1];

  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [1, 1, 1];

    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return [1, 1, 1];

    const pixel = ctx.getImageData(px, py, 1, 1).data;
    return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255];
  } catch {
    return [1, 1, 1];
  }
}

function parseHexColor(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [1, 1, 1];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

export type { LightUniforms };
export { computeLightUniforms, MAX_LIGHTS };
