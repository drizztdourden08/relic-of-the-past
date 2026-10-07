/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';
import type { SpaceToken } from '../Flex';

/**
 * A named column track, its narrowest width a size token: `tile` for stat
 * tiles (--tile-w-min), `flag` for on/off flag pills (--flag-w-min).
 */
type GridTrack = 'tile' | 'flag';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed column count (grid-template-columns: repeat(N, 1fr)). */
  columns?: number;
  /** Responsive auto-fill columns with this min px width. Overrides `columns`. */
  minColWidth?: number;
  /**
   * Responsive auto-fill columns no narrower than the track's token, so every
   * cell comes out the same width and a short row never stretches its cells.
   * Overrides `columns` and `minColWidth`.
   */
  track?: GridTrack;
  gap?: SpaceToken;
  children?: ReactNode;
}

export type { GridProps, GridTrack };
