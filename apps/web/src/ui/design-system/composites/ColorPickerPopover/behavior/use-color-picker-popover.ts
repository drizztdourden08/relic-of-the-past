/* @layer renderer-hooks @kind hook */
/**
 * Positions and dismisses the colour picker as a floating panel, like Select's
 * `useSelectDropdown`. The anchor ref is supplied by the caller because a
 * palette has many triggers. Positioning is two-pass on both axes: estimates
 * give a rect for the first frame, then the real measured box re-clamps `top`
 * and `left`. The estimates are not trusted; content-box padding and variable
 * content let the panel run off an edge before.
 *
 * `dropUp` SURVIVES BOTH PASSES, and the vertical clamp knows about it. A
 * flipped panel is shifted up over its own height by CSS after layout, so its
 * visual box is [top - height, top] where an unflipped one's is [top, top +
 * height]. Clamping both the same way pulls a flipped panel off its trigger
 * and then the transform moves it again, so the two cases get their own
 * bounds. The correction also merges onto the first-pass position instead of
 * replacing it: replacing it dropped the flag, and a panel that had decided to
 * flip stopped saying so the moment it was corrected.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dropPanelPositionFor, useAnchorTracking, useDismissable, viewportBounds } from '@ds/primitives/Portal';
import type { RefObject } from 'react';

/** First-pass estimates, before the panel has painted; corrected below once it has. */
const ESTIMATED_WIDTH = 248;
const ESTIMATED_HEIGHT = 480;
const ANCHOR_GAP = 6;
const EDGE_MARGIN = 8;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/** The range `top` may sit in, for a panel of this height, flipped or not.
 *  `Math.max` on the upper bound keeps the lower one winning when the panel is
 *  taller than the viewport: better anchored to the top edge than pushed off it. */
const clampTop = (top: number, height: number, dropUp: boolean): number => {
  const bounds = viewportBounds();
  const min = dropUp ? bounds.top + EDGE_MARGIN + height : bounds.top + EDGE_MARGIN;
  const max = dropUp ? bounds.bottom - EDGE_MARGIN : bounds.bottom - height - EDGE_MARGIN;
  return clamp(top, min, Math.max(min, max));
};

const popoverPositionFor = (rect: DOMRect): Position => {
  const base = dropPanelPositionFor(rect, {
    roomForDropDown: ESTIMATED_HEIGHT,
    gap: ANCHOR_GAP,
    minPanelWidth: ESTIMATED_WIDTH,
  });
  const bounds = viewportBounds();
  return {
    top: clampTop(base.top, ESTIMATED_HEIGHT, base.dropUp),
    left: clamp(base.left, bounds.left + EDGE_MARGIN, bounds.right - ESTIMATED_WIDTH - EDGE_MARGIN),
    dropUp: base.dropUp,
  };
};

interface Position {
  top: number;
  left: number;
  /** Passed to the panel as `data-drop-up`; CSS does the actual lift. */
  dropUp: boolean;
}

interface UseColorPickerPopoverParams {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

const useColorPickerPopover = (params: UseColorPickerPopoverParams) => {
  const { open, anchorRef, onClose } = params;
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { position } = useAnchorTracking({
    active: open,
    anchorRef,
    compute: popoverPositionFor,
    onOutOfView: () => onCloseRef.current(),
  });

  // Second pass: once the panel has its real size, pull it back onto screen on
  // whichever axis the estimate undershot. Runs before paint so there is no
  // visible jump from the estimated position to the corrected one.
  const [corrected, setCorrected] = useState<Pick<Position, 'top' | 'left'> | null>(null);
  useLayoutEffect(() => {
    if (!open || !position || !panelRef.current) { setCorrected(null); return; }
    const rect = panelRef.current.getBoundingClientRect();
    const bounds = viewportBounds();
    const maxLeft = bounds.right - rect.width - EDGE_MARGIN;
    const left = position.left > maxLeft ? Math.max(bounds.left + EDGE_MARGIN, maxLeft) : position.left;
    const top = clampTop(position.top, rect.height, position.dropUp);
    setCorrected(left !== position.left || top !== position.top ? { left, top } : null);
  }, [open, position]);

  // Merged, not replaced: `dropUp` is decided in the first pass and the second
  // one has nothing to say about it, so it has to be carried across.
  const finalPosition = position && (corrected ? { ...position, ...corrected } : position);

  const handleClose = useCallback(() => onCloseRef.current(), []);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, anchorRef, handleClose]);

  // Escape goes through the shared dismiss stack instead of a listener of this
  // hook's own: a swatch opened from inside a dialog or a full-screen layer has
  // to beat both, and only the stack can promise that regardless of mount order.
  useDismissable({ active: open, level: 'popover', onDismiss: handleClose });

  return { position: finalPosition, panelRef };
};

export { useColorPickerPopover };
