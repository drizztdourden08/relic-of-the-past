/* @layer shared-game @kind logic */
/**
 * Converts a resolved native combat row into the `ActorCombatProfile` shape
 * `ActorRecord.combat` stores. Shared by the combat field probe (an existing
 * record's profile disagreeing with the native table) and the spawns set
 * probe (a freshly-proposed actor carries this profile too, when a combat row
 * proves the sprite fights) so the conversion is written once.
 */
import type { ActorCombatProfile } from '../../../data';
import type { SpriteCombatObservation } from '../../detection-types';

const profileFrom = (combat: SpriteCombatObservation): ActorCombatProfile => ({
  health: combat.health,
  flags4: combat.flags4,
  damageByClass: Object.fromEntries(combat.damageByClass.map((v, i) => [i, v])),
});

export { profileFrom };
