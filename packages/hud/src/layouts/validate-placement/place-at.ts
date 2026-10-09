/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, numberAt } from '../validate-box';
import { PLACE_KEYS } from './validate-placement.constants';
import type { Issues } from '../validate-box';
import type { HudPlace } from '../../types/hud-node';

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

export { placeAt };
