/* @layer shared-game @kind constants */
import { checkShapes } from './invariant-shape';
import { checkUniqueBits } from './invariant-unique';
import { checkDungeonRefs } from './check-dungeon-refs';
import { checkItemRefs } from './check-item-refs';
import { checkNames } from './check-names';
import { checkSourceFuncs } from './check-source-funcs';

const INVARIANT_RULES = [checkShapes, checkUniqueBits, checkItemRefs, checkDungeonRefs, checkNames, checkSourceFuncs] as const;

export { INVARIANT_RULES };
