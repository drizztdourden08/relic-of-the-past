/* @layer shared-game @kind logic */
import { ROOM_CLEAR_KILL_ITEM } from '../engine.constants';
import type { SimTarget } from '../state/state.type';
import { itemAt } from '../../../checked-access';
import type { DiscoverScope } from './discover.type';

const clearRoomTarget = ({ state, screenId, killGated, shutters, threat }: DiscoverScope): SimTarget | null => {
  if (!killGated || !shutters.some((d) => !d.opened) || !threat.clearable || threat.gating.length === 0) return null;
  const key = `clear:${screenId}`;
  if (state.done.has(key) || state.failed.has(key)) return null;
  const rep = threat.gating.find((g) => !g.sprite.carriesKey && !g.sprite.carriesBigKey) ?? itemAt(threat.gating, 0);
  const tile = rep.from ?? rep.sprite.tile;
  const action = { type: 'kill', roomId: rep.sprite.roomId, itemId: ROOM_CLEAR_KILL_ITEM, opensShutters: true } as const;
  return { screenId, roomId: rep.sprite.roomId, action, key, role: 'gate', label: `guards (room ${rep.sprite.roomId.toString(16)})`, noun: 'guards', verb: 'Defeating', tile };
};

export { clearRoomTarget };
