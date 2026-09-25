/* @layer shared-hud @kind logic */
/**
 * `shape` is checked the same way every other element spec is: one property
 * at a time, refusing instead of guessing at anything malformed. See
 * `hud-shape.ts` for why this leaf exists at all.
 */

import { checkKeys, isRecord } from './validate-box';
import { validateValue } from './validate-value';
import type { Issues } from './validate-box';
import type { HudShapeKind, HudShapeSpec } from '../../types/hud/hud-shape';

const SHAPES: readonly HudShapeKind[] = ['heart', 'magic-bar'];
const SHAPE_KEYS = ['type', 'shape', 'fill', 'armor', 'bands'] as const;

const isHudShapeKind = (value: string): value is HudShapeKind => (SHAPES as readonly string[]).includes(value);

const shapeSpec = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): HudShapeSpec | null => {
  checkKeys(value, SHAPE_KEYS, path, issues);
  const shape = value.shape;
  if (typeof shape !== 'string' || !isHudShapeKind(shape)) {
    issues.push(`${path}.shape: expected one of ${SHAPES.join(', ')}, got ${JSON.stringify(shape)}`);
    return null;
  }

  const context = { insideRepeat };
  const rawFill = value.fill;
  const fill = validateValue(rawFill, `${path}.fill`, issues, context);
  if (fill === undefined) {
    if (rawFill === undefined) issues.push(`${path}.fill: a shape needs a fill`);
    return null;
  }

  const armor = value.armor !== undefined ? validateValue(value.armor, `${path}.armor`, issues, context) : undefined;
  const bands = value.bands !== undefined ? validateValue(value.bands, `${path}.bands`, issues, context) : undefined;
  if (shape === 'heart' && value.bands !== undefined) issues.push(`${path}.bands: only 'magic-bar' takes bands`);
  if (shape === 'magic-bar' && value.armor !== undefined) issues.push(`${path}.armor: only 'heart' takes armor`);

  return {
    type: 'shape',
    shape,
    fill,
    ...(armor !== undefined && shape === 'heart' ? { armor } : {}),
    ...(bands !== undefined && shape === 'magic-bar' ? { bands } : {}),
  };
};

export { shapeSpec };
