/* @layer tests @kind logic */
interface ScrollPoint { top: number; left: number }

interface ScrollNode {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  scrollTo: (options: { top?: number; left?: number }) => void;
}

const createScrollSyncController = (getNode: () => ScrollNode | null) => {
  let pending: ScrollPoint | null = null;

  const applyScrollTo = (target: Partial<ScrollPoint>): void => {
    const node = getNode();
    if (!node) return;
    const top = target.top ?? node.scrollTop;
    const left = target.left ?? node.scrollLeft;
    if (top === node.scrollTop && left === node.scrollLeft) return;
    node.scrollTo({ top, left });
    pending = { top: node.scrollTop, left: node.scrollLeft };
  };

  const handleScroll = (current: ScrollPoint, onScroll?: (position: ScrollPoint) => void): void => {
    if (pending) {
      if (current.top === pending.top && current.left === pending.left) pending = null;
      return;
    }
    onScroll?.(current);
  };

  return { applyScrollTo, handleScroll };
};

export { createScrollSyncController };
