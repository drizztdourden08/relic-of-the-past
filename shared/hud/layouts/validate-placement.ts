/* @layer shared-hud @kind logic */
/**
 * The two placement fields every node carries beside its box: `min`/`max` (a
 * floor and a ceiling on the resolved size) and `place` (a grid cell
 * reference). Split out of `validate-box.ts` purely to keep that file under
 * this repo's own line cap - both still validate exactly the shared half of
 * a node, the same as everything left in `validate-box.ts`.
 */

import { checkKeys, isRecord, numberAt } from './validate-box';
import { validateValue } from './validate-value';
import type { Issues } from './validate-box';
import type { HudPlace } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';

/** `min`/`max`: a floor and a ceiling on the box's RESOLVED size, each axis
 *  optional and each a `Value` like any other bindable number. `insideRepeat`
 *  is forwarded to `validateValue` unchanged - see `validate-node.ts`'s own
 *  note on why it exists. */
const minMaxAt = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): { w?: Value; h?: Value } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected { w?, h? }`);
    return undefined;
  }
  checkKeys(value, ['w', 'h'], path, issues);
  const context = { insideRepeat };
  const w = value.w !== undefined ? validateValue(value.w, `${path}.w`, issues, context) : undefined;
  const h = value.h !== undefined ? validateValue(value.h, `${path}.h`, issues, context) : undefined;
  return { ...(w !== undefined ? { w } : {}), ...(h !== undefined ? { h } : {}) };
};

const PLACE_KEYS = ['column', 'row', 'colSpan', 'rowSpan'] as const;

/** A grid cell reference - meaningless under a flex parent, and not checked
 *  against one here: whether it applies is `place-grid.ts`'s question, not the
 *  validator's. */
const placeAt = (value: unknown, path: string, issues: Issues): HudPlace | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected { column?, row?, colSpan?, rowSpan? }`);
    return undefined;
  }
  checkKeys(value, PLACE_KEYS, path, issues);
  const place: HudPlace = {};
  PLACE_KEYS.forEach((key) => {
    const n = numberAt(value[key], `${path}.${key}`, issues);
    if (n === undefined) return;
    if (!Number.isInteger(n) || n < 1) { issues.push(`${path}.${key}: expected an integer of 1 or more`); return; }
    place[key] = n;
  });
  return place;
};

export { minMaxAt, placeAt };
