/* @layer renderer-components @kind logic */
import type { ReachState, TilePassability } from '@shared/game/navigation/types';

interface ReachStatus {
  label: string;
  color: string;
}

/**
 * Per-layer reach wording, pinned top-right of that layer's own block (never
 * a single shared status at tooltip level — see TileTooltipContent).
 *
 * An above-layer tile whose own attribute is not a structural wall, yet the
 * BFS never reached it, reads "unsupported" rather than "blocked": the tile
 * is open, nothing carries the player there. Only the above layer gets this
 * wording — a ground-layer tile that the BFS didn't reach is a plain block.
 */
const reachStatusFor = (reach: ReachState, collision: TilePassability, isAboveLayer: boolean): ReachStatus => {
  if (reach === 1) return { label: '✓ reachable', color: 'var(--c-green-bright)' };
  if (reach >= 2) return { label: '➔ traversal', color: 'var(--c-warning)' };
  if (isAboveLayer && collision.type !== 'blocked') return { label: '✗ unsupported', color: 'var(--c-danger)' };
  return { label: '✗ blocked', color: 'var(--c-danger)' };
};

export { reachStatusFor };
export type { ReachStatus };
