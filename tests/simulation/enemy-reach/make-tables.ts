/* @layer tests @kind helper */
import type { CombatTables } from '../../../shared/game/simulation/types';
import { ANCILLA_COUNT, BLOCKING_ATTR } from './enemy-reach.constants';

const makeTables = (overrides: Partial<CombatTables> = {}): CombatTables => ({
  ancillaDamageClass: new Array(ANCILLA_COUNT).fill(0),
  projectileTileCollision: (() => {
    const table = new Array<number>(256).fill(0);
    table[BLOCKING_ATTR] = 1;
    return table;
  })(),
  ...overrides,
});

export { makeTables };
