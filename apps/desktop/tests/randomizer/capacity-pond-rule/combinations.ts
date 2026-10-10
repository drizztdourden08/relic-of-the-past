/* @layer tests @kind helper */
import { AUTHORITIES, FAMILY_MODES, POND_MODES } from './capacity-pond-rule.constants';
import type { Combination, SelectionParams } from './capacity-pond-rule.type';
import { selectionOf } from './selection-of';

const paramsFor = (enabled: boolean, retroBow: boolean): SelectionParams[] =>
  POND_MODES.flatMap((pondMode) => FAMILY_MODES.flatMap((explosives) => FAMILY_MODES.map((projectiles) =>
    ({ enabled, pondMode, explosives, projectiles, retroBow }))));

const combinations = (): Combination[] => {
  const all: Combination[] = [];
  for (const enabled of [true, false]) {
    for (const retroBow of [false, true]) {
      for (const params of paramsFor(enabled, retroBow)) {
        all.push(...AUTHORITIES.map((authority) => ({ selection: selectionOf(params), authority })));
      }
    }
  }
  return all;
};

export { combinations };
