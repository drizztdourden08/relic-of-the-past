/* @layer renderer-components @kind logic */
import type { ReachState, TilePassability } from '@rotp/game-core';
import type { ReachStatus } from './tooltip.type';

const reachStatusFor = (reach: ReachState, collision: TilePassability, isAboveLayer: boolean): ReachStatus => {
  if (reach === 1) return { label: '✓ reachable', color: 'var(--c-secondary-bright)' };
  if (reach >= 2) return { label: '➔ traversal', color: 'var(--c-warning)' };
  if (isAboveLayer && collision.type !== 'blocked') return { label: '✗ unsupported', color: 'var(--c-danger)' };
  return { label: '✗ blocked', color: 'var(--c-danger)' };
};

export { reachStatusFor };
export type { ReachStatus };
