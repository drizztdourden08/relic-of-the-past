/* @layer bridge-wasm @kind constants */
import type { RatioLimits } from '@drizztdourden08/brock-display/aspect-ratio';

const BASE_WIDTH = 256;
const BASE_HEIGHT = 224;
const PPU_EXTRA_LEFT_RIGHT = 384;
const PPU_EXTRA_TOP_BOTTOM = 384;
const EXTEND_Y_HEIGHT = 240;

const ASPECT_LIMITS: RatioLimits = {
  min: BASE_WIDTH / (BASE_HEIGHT + 2 * PPU_EXTRA_TOP_BOTTOM),
  max: (BASE_WIDTH + 2 * PPU_EXTRA_LEFT_RIGHT) / EXTEND_Y_HEIGHT,
};

export { ASPECT_LIMITS };
