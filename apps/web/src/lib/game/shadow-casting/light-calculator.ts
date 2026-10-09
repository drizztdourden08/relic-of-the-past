/* @layer bridge-wasm @kind logic */
import type { LightSource } from '@shared/types/shadow-casting';
import type { LightUniforms } from './light-calculator.type';
import { MAX_LIGHTS } from './light-calculator.constants';
import { resolveLightColor } from './resolve-light-color';

const computeLightUniforms = (lights: LightSource[], gameCanvas: HTMLCanvasElement | null): LightUniforms => {
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

    const [r, g, b] = resolveLightColor(light, gameCanvas);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  return { numLights, positions, colors, intensities, castShadows };
};

export { computeLightUniforms };
export type { LightUniforms } from './light-calculator.type';
