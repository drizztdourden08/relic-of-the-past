/* @layer renderer-widgets @kind logic */
import type { ConnectionKind, ConnectionTag, ScreenRecord } from '@rotp/game-data';

const connectionKindFor = (from: ScreenRecord, to: ScreenRecord, tags: readonly ConnectionTag[]): ConnectionKind => {
  const has = (t: ConnectionTag): boolean => tags.includes(t);
  if (has('transit:hole')) return 'hole';
  if (has('transit:warp') || has('transit:mirror')) return 'teleport';
  const ctxThreshold = has('ctx:entrance') || has('ctx:exit') || has('ctx:dungeon-enter');
  if (ctxThreshold || (from.kind === 'overworld') !== (to.kind === 'overworld')) return 'entrance';
  if (has('transit:stairs')) return 'stairs';
  if (has('transit:door')) return 'door';
  return 'edge';
};

export { connectionKindFor };
