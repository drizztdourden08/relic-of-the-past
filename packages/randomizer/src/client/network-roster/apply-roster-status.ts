/* @layer bridge-wasm @kind logic */
import { slotOfStatusKey } from '../client-status';
import type { RosterDeps } from './network-roster.type';

const applyRosterStatus = (deps: RosterDeps, key: string, value: unknown, seed: boolean): boolean => {
  const { room, presence, isLinked } = deps;
  const slot = slotOfStatusKey(key, room.team ?? 0);
  if (slot === null) return false;
  const presenceIsOwnConnection = slot === room.slot;
  presence.setStatus(slot, value, seed && !presenceIsOwnConnection && !isLinked(slot));
  return true;
};

export { applyRosterStatus };
