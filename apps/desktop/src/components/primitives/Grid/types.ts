/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';
import type { SpaceToken } from '../Flex';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed column count (grid-template-columns: repeat(N, 1fr)). */
  columns?: number;
  /** Responsive auto-fill columns with this min px width. Overrides `columns`. */
  minColWidth?: number;
  gap?: SpaceToken;
  children?: ReactNode;
}

export type { GridProps };
