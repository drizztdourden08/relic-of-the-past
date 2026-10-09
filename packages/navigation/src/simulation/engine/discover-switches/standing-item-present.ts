/* @layer shared-game @kind logic */
import type { SimSprite } from '../../types';
import type { PresenceGameState } from '../../presence/presence.type';
import { drainEffectForScreen } from './drain-effect-for-screen';
import { owEventSet } from './ow-event-set';

const standingItemPresent = (sprite: SimSprite, presenceState: PresenceGameState | undefined): boolean => {
  if (!sprite.outdoor || (sprite.kind !== 'standing' && sprite.kind !== 'overworld')) return true;
  const gate = drainEffectForScreen(sprite.roomId);
  return !gate || owEventSet(presenceState, gate.screen, gate.mask);
};

export { standingItemPresent };
