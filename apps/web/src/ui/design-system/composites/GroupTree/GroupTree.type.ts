/* @layer renderer-components @kind types */
/**
 * A node is either a group of nodes or a bucket of leaves — the Composite
 * shape, rendered by one recursive component. What a leaf looks like is the
 * caller's business, passed in as `renderItems`.
 */
import type { ReactNode } from 'react';

interface TreeNode<T> {
  key: string;
  label: string;
  /** Right-aligned header content — counts, chips, whatever the caller wants. */
  meta?: ReactNode;
  children: TreeNode<T>[];
  /** Leaves. Meaningful only when `children` is empty. */
  items: T[];
}

interface GroupTreeProps<T> {
  root: TreeNode<T>;
  renderItems: (items: T[]) => ReactNode;
  /** Sections at a depth below this mount expanded. 0 (default) = all collapsed. */
  expandToDepth?: number;
  className?: string;
  emptyLabel?: string;
}

export type { GroupTreeProps, TreeNode };
