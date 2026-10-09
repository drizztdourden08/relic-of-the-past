/* @layer shared-game @kind logic */
import { connectionTagKeysOf, get, hasTagKey, toScreenIdOrNone } from '@rotp/game-data';
import type { ConnectionRecord, RequirementSet } from '@rotp/game-data';
import { barrierTagsToRequirements } from '../../requirements-map/barrier-tags-to-requirements';

const isCrossWorld = (conn: ConnectionRecord): boolean => {
  if (hasTagKey(conn.tags, 'ctx:cross-world') || hasTagKey(conn.tags, 'transit:warp')) return true;
  const fromWorld = get('screen', conn.screenId)?.world;
  const to = toScreenIdOrNone(conn);
  const toWorld = to === undefined ? undefined : get('screen', to)?.world;
  if (fromWorld === undefined || toWorld === undefined) return false;
  return fromWorld !== toWorld;
};

const connectionRequirements = (conn: ConnectionRecord): RequirementSet => {
  if (conn.nav?.requirements) return conn.nav.requirements;
  const fromBarriers = barrierTagsToRequirements(connectionTagKeysOf(conn.tags));
  if (fromBarriers.length > 0) return fromBarriers;
  if (isCrossWorld(conn)) return [['moonpearl']];
  return [];
};

export { connectionRequirements };
