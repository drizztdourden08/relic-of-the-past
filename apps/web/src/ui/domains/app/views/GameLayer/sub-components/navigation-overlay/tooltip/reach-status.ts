/* @layer renderer-components @kind logic */
import type { ReachState, TilePassability } from '@shared/game/navigation/types';

interface ReachStatus {
  label: string;
  color: string;
}

/**
 * Per-layer reach wording. An unreached above-layer tile that is not a wall reads "unsupported",
 * not "blocked": the tile is open, nothing carries the player there.
 */
const reachStatusFor = (reach: ReachState, collision: TilePassability, isAboveLayer: boolean): ReachStatus => {
  if (reach === 1) return { label: '✓ reachable', color: 'var(--c-green-bright)' };
  if (reach >= 2) return { label: '➔ traversal', color: 'var(--c-warning)' };
  if (isAboveLayer && collision.type !== 'blocked') return { label: '✗ unsupported', color: 'var(--c-danger)' };
  return { label: '✗ blocked', color: 'var(--c-danger)' };
};

export { reachStatusFor };
export type { ReachStatus };
