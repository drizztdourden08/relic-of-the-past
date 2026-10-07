/* @layer renderer-components @kind types */
import type { StatTileProps } from '../../primitives/StatTile';

interface StatTileGridProps {
  /** One tile each, keyed by label, so labels are unique within a grid. */
  tiles: readonly StatTileProps[];
  className?: string;
}

export type { StatTileGridProps };
