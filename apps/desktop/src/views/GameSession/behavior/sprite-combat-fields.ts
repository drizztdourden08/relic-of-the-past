/* @layer renderer-appshell @kind logic */
import type { wasmGetSpriteCombat } from '@app/game';
import { ROOM_CLEAR_EXEMPT_BIT } from './sim-run.constants';

const spriteCombatFields = (spriteCombat: ReturnType<typeof wasmGetSpriteCombat>) => ({
  health: spriteCombat?.health ?? null,
  flags4: spriteCombat?.flags4 ?? null,
  countsTowardRoomClear: spriteCombat === null ? null : (spriteCombat.flags4 & ROOM_CLEAR_EXEMPT_BIT) === 0,
  damageByClass: spriteCombat?.damageByClass ?? null,
});

export { spriteCombatFields };
