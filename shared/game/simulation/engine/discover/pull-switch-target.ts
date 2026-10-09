/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { SimSprite, TriggerAction } from '../../types';
import { drainEffectForSwitchRoom } from '../discover-switches/drain-effect-for-switch-room';
import { owEventSet } from '../discover-switches/ow-event-set';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope } from './discover.type';

const pullSwitchTarget = (scope: DiscoverScope, sprite: SimSprite, key: string, tile: GridPos | undefined): SimTarget | null => {
  const { inter, shutters, obs, screenId } = scope;
  const tagged = (inter.tags ?? [0, 0]).some((t) => t !== 0);
  const opensShutters = tagged && shutters.some((d) => !d.opened);
  const drain = drainEffectForSwitchRoom(sprite.roomId);
  const drainPending = drain !== undefined && !owEventSet(obs.presenceState, drain.screen, drain.mask);
  if (!opensShutters && !drainPending) return null;
  const action: TriggerAction = drain
    ? { type: 'pullSwitch', roomId: sprite.roomId, drain }
    : { type: 'pullSwitch', roomId: sprite.roomId };
  return { screenId, roomId: sprite.roomId, action, key, role: 'gate', label: `pull switch (room ${sprite.roomId.toString(16)})`, noun: 'pull switch', verb: 'Pulling', tile };
};

export { pullSwitchTarget };
