/* @layer shared-game @kind logic */
import { always } from '../combinators';
import type { Rule } from '../../world.type';
import type { CoverageCount } from '../rules.type';

const closeCoverage = (names: Iterable<string>, registry: Map<string, Rule>): CoverageCount => {
  let ruled = 0;
  let open = 0;
  for (const name of names) {
    if (registry.has(name)) {
      ruled += 1;
    } else {
      registry.set(name, always);
      open += 1;
    }
  }
  return { ruled, open };
};

export { closeCoverage };
