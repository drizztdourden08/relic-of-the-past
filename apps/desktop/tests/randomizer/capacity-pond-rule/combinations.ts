/* @layer tests @kind helper */
import { AUTHORITIES, FAMILY_MODES, POND_MODES } from './capacity-pond-rule.constants';
import type { Combination } from './capacity-pond-rule.type';
import { selectionOf } from './selection-of';

const combinations = (): Combination[] => {
  const all: Combination[] = [];
  for (const enabled of [true, false]) {
    for (const retroBow of [false, true]) {
      for (const pondMode of POND_MODES) {
        for (const explosives of FAMILY_MODES) {
          for (const projectiles of FAMILY_MODES) {
            for (const authority of AUTHORITIES) {
              all.push({ selection: selectionOf(enabled, pondMode, explosives, projectiles, retroBow), authority });
            }
          }
        }
      }
    }
  }
  return all;
};

export { combinations };
