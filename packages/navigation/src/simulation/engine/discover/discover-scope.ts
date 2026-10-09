/* @layer shared-game @kind logic */
import type { RoomInteractables, SimDoor, SimObservation, SimSprite } from '../../types';
import { isClearRoomTag } from '../../is-clear-room-tag';
import type { Reached } from '../discover-reach/discover-reach.type';
import { evaluateRoomThreat } from '../enemy-reach/evaluate-room-threat';
import type { RoomThreat } from '../enemy-reach/enemy-reach.type';
import { swordTier } from '../enemy-reach-weapons/sword-tier';
import type { EngineState } from '../state/state.type';
import type { DiscoverScope } from './discover.type';
import { EMPTY_THREAT } from './discover.constants';
import { spriteKey } from './sprite-key';

const virtualOwScreen = (screenId: string): number | null => {
  const m = /^ow:(\d+)/.exec(screenId);
  return m ? Number(m[1]) : null;
};

const roomThreatFor = (obs: SimObservation, reached: Reached, inter: RoomInteractables, state: EngineState): RoomThreat =>
  evaluateRoomThreat({
    sprites: inter.sprites,
    reached,
    grids: obs.grids,
    inventory: state.inventory,
    combat: obs.combat,
    split: obs.sectionSplit,
  });

const livingKillables = (state: EngineState, screenId: string, inter: RoomInteractables, threat: RoomThreat): SimSprite[] => {
  const gating = new Set(threat.gating.map((g) => spriteKey(g.sprite)));
  return inter.sprites.filter((sp) => (sp.carriesKey || sp.carriesBigKey
    ? !state.done.has(spriteKey(sp))
    : gating.has(spriteKey(sp)) && !state.done.has(`clear:${screenId}`)));
};

const isOpen = (door: SimDoor): boolean => door.opened;

const discoverScope = (state: EngineState, obs: SimObservation, reached: Reached, inter: RoomInteractables): DiscoverScope => {
  const screenId = state.virtual.screenId;
  const killGated = (inter.tags ?? [0, 0]).some(isClearRoomTag);
  const shutters = inter.doors.filter((d) => d.kind === 'shutter');
  const threat = killGated && !shutters.every(isOpen) ? roomThreatFor(obs, reached, inter, state) : EMPTY_THREAT;
  const living = livingKillables(state, screenId, inter, threat);
  return {
    state,
    obs,
    reached,
    inter,
    screenId,
    owScreen: virtualOwScreen(screenId),
    killGated,
    shutters,
    threat,
    living,
    trapArm: killGated && living.length > 0 && shutters.some(isOpen),
    hasBombs: state.reachTokens.has('bombs'),
    hasSword: swordTier(state.inventory) > 0,
  };
};

export { discoverScope };
