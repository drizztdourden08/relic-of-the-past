/* @layer shared-game @kind logic */
import type { ActorCombatProfile } from '@rotp/game-data';
import type { SpriteCombatObservation } from '../../detection-types';

const profileFrom = (combat: SpriteCombatObservation): ActorCombatProfile => ({
  health: combat.health,
  flags4: combat.flags4,
  damageByClass: Object.fromEntries(combat.damageByClass.map((v, i) => [i, v])),
});

export { profileFrom };
