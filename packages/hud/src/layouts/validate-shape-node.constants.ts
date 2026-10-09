/* @layer shared-hud @kind constants */
import type { HudShapeKind } from '../types/hud-shape';

const SHAPES: readonly HudShapeKind[] = ['heart', 'magic-bar'];
const SHAPE_KEYS = ['type', 'shape', 'fill', 'armor', 'bands'] as const;

export { SHAPE_KEYS, SHAPES };
