/* @layer shared-game @kind logic */
import type { SpriteCombatInfo } from '../../types';
import { ROOM_CLEAR_EXEMPT_BIT } from './enemy-reach.constants';

const isGating = (info: SpriteCombatInfo | null): boolean =>
  !info || (info.flags4 & ROOM_CLEAR_EXEMPT_BIT) === 0;

export { isGating };
