/* @layer renderer-components @kind hook */
/**
 * Anchored-panel positioning for a "pick one visually" popover, which is a tab strip
 * over a tile grid (sprite/glyph/slot pickers alike). Promoted out of the HUD
 * layout editor, which owned the only three copies of this exact hook, into
 * Portal's own behavior so any composite that floats a panel beside a
 * trigger can share it instead of hand-rolling positioning again.
 *
 * Two-pass estimate-then-correct, on both axes: `dropPanelPositionFor` runs
 * first against a guessed size, before the panel has ever painted, so there
 * is a rect for the first frame; once it has really rendered, a second pass
 * re-clamps both `top` and `left` against its real measured box.
 *
 * `position.dropUp` is `dropPanelPositionFor`'s own flip decision, passed
 * through unchanged. The caller is expected to set `data-drop-up` on the
 * panel and let CSS apply `transform: translateY(-100%)`, exactly the way
 * `Select`/`TagInput` already flip their own dropdowns. Without that
 * transform a "dropped up" panel still renders `top`-down from a point
 * above the trigger and draws OVER it instead of above it, since `top`
 * alone has no way to know the panel's own height in advance.
 *
 * The vertical clamp knows about that transform. A flipped panel's visual box
 * is [top - height, top] where an unflipped one's is [top, top + height], so
 * clamping both against the same bounds would drag a flipped panel off its
 * trigger, and the transform would then move it a second time.
 *
 * Dismisses on an outside pointerdown or Escape, and never renders clipped by
 * an ancestor's overflow: the panel is portalled (`Portal`, `layer="popover"`)
 * onto a body-level container, so no ancestor's `overflow: hidden` can clip
 * it the way it would a plain absolutely-positioned child.
 *
 * Escape is not bound here: the panel registers with the shared dismiss stack
 * at `popover`, the inner-most level, so one press closes it and stops. See
 * `dismiss-stack.ts` for why a private listener could not be ordered reliably.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dropPanelPositionFor } from './drop-panel-position';
import { useAnchorTracking } from './use-anchor-tracking';
import { useDismissable } from './use-dismissable';
import { viewportBounds } from './anchor-position';
import type { RefObject } from 'react';

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

interface PickerPosition {
  top: number;
  left: number;
  dropUp: boolean;
}

interface UsePickerPopoverParams {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Before the panel has ever painted, so there is a rect for the first frame. */
  estimatedWidth?: number;
  estimatedHeight?: number;
}

const usePickerPopover = (params: UsePickerPopoverParams) => {
  const { open, anchorRef, onClose, estimatedWidth = 320, estimatedHeight = 360 } = params;
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const positionFor = useCallback((rect: DOMRect): PickerPosition => {
    const base = dropPanelPositionFor(rect, {
      roomForDropDown: estimatedHeight, gap: ANCHOR_GAP, minPanelWidth: estimatedWidth,
    });
    const bounds = viewportBounds();
    return {
      ...base,
      left: clamp(base.left, bounds.left + EDGE_MARGIN, bounds.right - estimatedWidth - EDGE_MARGIN),
      top: clampTop(base.top, estimatedHeight, base.dropUp),
    };
  }, [estimatedWidth, estimatedHeight]);

  const handleClose = useCallback(() => onCloseRef.current(), []);
  const { position } = useAnchorTracking({ active: open, anchorRef, compute: positionFor, onOutOfView: handleClose });

  const [corrected, setCorrected] = useState<Pick<PickerPosition, 'top' | 'left'> | null>(null);
  useLayoutEffect(() => {
    if (!open || !position || !panelRef.current) { setCorrected(null); return; }
    const rect = panelRef.current.getBoundingClientRect();
    const bounds = viewportBounds();
    const maxLeft = bounds.right - rect.width - EDGE_MARGIN;
    const left = position.left > maxLeft ? Math.max(bounds.left + EDGE_MARGIN, maxLeft) : position.left;
    const top = clampTop(position.top, rect.height, position.dropUp);
    setCorrected(left !== position.left || top !== position.top ? { left, top } : null);
  }, [open, position]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      handleClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, anchorRef, handleClose]);

  useDismissable({ active: open, level: 'popover', onDismiss: handleClose });

  const finalPosition = position && (corrected ? { ...position, ...corrected } : position);

  return { position: finalPosition, panelRef };
};

export { usePickerPopover };
export type { PickerPosition };
