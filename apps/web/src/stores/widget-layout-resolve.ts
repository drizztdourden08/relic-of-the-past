/* @layer renderer-stores @kind logic */
/**
 * A resize or even edit names its split by identity, and the tree the dock
 * rendered is a copy of the stored one with every gated widget stripped out. So
 * the split the divider belongs to is found again by shape: the stored split
 * whose children, kept to the ones still holding a rendered leaf, line up one
 * to one with the rendered split's children. The child index maps along.
 */
import type { LayoutNode, SplitNode } from '@shared/types/widget-layout';

interface ResolvedSplit {
  node: SplitNode;
  index: number;
}

const leafKeys = (node: LayoutNode): string[] =>
  node.kind === 'split' ? node.children.flatMap(leafKeys) : [node.key];

const sameSet = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((key) => b.includes(key));

const splitsOf = (node: LayoutNode): SplitNode[] =>
  node.kind === 'split' ? [node, ...node.children.flatMap(splitsOf)] : [];

/** The stored split (and child index) a rendered split and divider index stand for; null when nothing lines up. */
const resolveSplit = (stored: LayoutNode, rendered: SplitNode, index: number): ResolvedSplit | null => {
  const direct = splitsOf(stored).find((split) => split === rendered);
  if (direct) return { node: direct, index };
  const visible = new Set(leafKeys(rendered));
  const wanted = rendered.children.map(leafKeys);
  for (const split of splitsOf(stored)) {
    if (split.axis !== rendered.axis) continue;
    const kept = split.children
      .map((child, i) => ({ i, keys: leafKeys(child).filter((key) => visible.has(key)) }))
      .filter((entry) => entry.keys.length > 0);
    if (kept.length !== wanted.length) continue;
    if (!kept.every((entry, j) => sameSet(entry.keys, wanted[j]))) continue;
    return { node: split, index: kept[index].i };
  }
  return null;
};

export { resolveSplit };
export type { ResolvedSplit };
