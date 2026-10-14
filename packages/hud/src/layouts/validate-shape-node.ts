/* @layer shared-hud @kind logic */
import { checkKeys, reportMissing } from './validate-box';
import { validateValue } from './validate-value';
import { SHAPE_KEYS, SHAPES } from './validate-shape-node.constants';
import type { Issues, ValueSite } from './validate-box';
import type { HudShapeKind, HudShapeSpec } from '../types/hud-shape';

const isHudShapeKind = (value: string): value is HudShapeKind => (SHAPES as readonly string[]).includes(value);

const shapeExtras = (
  value: Record<string, unknown>, shape: HudShapeKind, site: ValueSite,
): Pick<HudShapeSpec, 'armor' | 'bands'> => {
  const { path, issues, context } = site;
  const armor = validateValue(value.armor, `${path}.armor`, issues, context);
  const bands = validateValue(value.bands, `${path}.bands`, issues, context);
  if (shape === 'heart' && value.bands !== undefined) issues.push(`${path}.bands: only 'magic-bar' takes bands`);
  if (shape === 'magic-bar' && value.armor !== undefined) issues.push(`${path}.armor: only 'heart' takes armor`);
  return {
    ...(armor !== undefined && shape === 'heart' ? { armor } : {}),
    ...(bands !== undefined && shape === 'magic-bar' ? { bands } : {}),
  };
};

const shapeSpec = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): HudShapeSpec | null => {
  checkKeys(value, SHAPE_KEYS, path, issues);
  const shape = value.shape;
  if (typeof shape !== 'string' || !isHudShapeKind(shape)) {
    issues.push(`${path}.shape: expected one of ${SHAPES.join(', ')}, got ${JSON.stringify(shape)}`);
    return null;
  }

  const site: ValueSite = { path, issues, context: { insideRepeat } };
  const fill = validateValue(value.fill, `${path}.fill`, issues, site.context);
  if (fill === undefined) {
    reportMissing(value.fill, `${path}.fill: a shape needs a fill`, issues);
    return null;
  }

  return { type: 'shape', shape, fill, ...shapeExtras(value, shape, site) };
};

export { shapeSpec };
