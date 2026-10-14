/* @layer renderer-widgets @kind constants */
const LAYER_SHADES: readonly number[] = [105, 65, 90];

const UNKNOWN_LAYER_SHADE = 90;
const BLOCKED_SHADE = 50;
const UNREACHED_SHADE = 18;

const FULL_BOUNDS = { minRow: 0, maxRow: 63, minCol: 0, maxCol: 63 };

export { BLOCKED_SHADE, FULL_BOUNDS, LAYER_SHADES, UNKNOWN_LAYER_SHADE, UNREACHED_SHADE };
