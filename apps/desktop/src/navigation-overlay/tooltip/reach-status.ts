/* @layer renderer-components @kind logic */
import type { ReachState, TilePassability } from '@rotp/game-core';
import type { ReachStatus } from './tooltip.type';

const reachStatusFor = (reach: ReachState, collision: TilePassability, isAboveLayer: boolean): ReachStatus => {
  if (reach === 1) return { label: 'reachable', tone: 'ok' };
  if (reach >= 2) return { label: '➔ traversal', tone: 'warn' };
  if (isAboveLayer && collision.type !== 'blocked') return { label: 'x unsupported', tone: 'bad' };
  return { label: 'x blocked', tone: 'bad' };
};

export { reachStatusFor };
export type { ReachStatus };
