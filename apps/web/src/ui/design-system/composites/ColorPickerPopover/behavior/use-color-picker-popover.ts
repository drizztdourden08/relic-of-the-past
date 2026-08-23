/* @layer renderer-hooks @kind hook */
/**
 * Positions and dismisses the colour picker as a floating panel anchored to
 * whichever swatch opened it — mirroring the open/outside-click/Escape/anchor-
 * tracking pattern every other anchored panel in this design system already
 * uses (see Select's `useSelectDropdown`). The one difference: a palette has
 * many possible triggers, not one fixed button, so the anchor ref is supplied
 * by the caller (set to whichever swatch was last clicked) rather than owned
 * here the way a single-trigger dropdown owns its own ref.
 *
 * Positioning is two-pass, on BOTH axes. `dropPanelPositionFor` runs first
 * against rough estimates of the panel's size, before it has ever painted, so
 * there is a rect for the very first frame. Once the panel has actually
 * rendered, a second pass re-clamps `top` AND `left` against its real
 * measured box. The estimates exist only to avoid a visible flash on open —
 * they are not trusted for the real placement, because getting either one
 * wrong is exactly what let the panel run off an edge before: the width
 * estimate did not account for `boxSizing: content-box` adding the picker's
 * own padding on top of its content width, and the height estimate did not
 * account for a swatch's own content (whether the "original colour" row is
 * showing, title length).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dropPanelPositionFor, useAnchorTracking, viewportBounds } from '@ds/primitives/Portal';
import type { RefObject } from 'react';

/** First-pass estimates, before the panel has ever painted — corrected below once it has. */
const ESTIMATED_WIDTH = 248;
const ESTIMATED_HEIGHT = 480;
const ANCHOR_GAP = 6;
const EDGE_MARGIN = 8;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const popoverPositionFor = (rect: DOMRect) => {
  const base = dropPanelPositionFor(rect, {
    roomForDropDown: ESTIMATED_HEIGHT,
    gap: ANCHOR_GAP,
    minPanelWidth: ESTIMATED_WIDTH,
  });
  const bounds = viewportBounds();
  return {
    ...base,
    left: clamp(base.left, bounds.left + EDGE_MARGIN, bounds.right - ESTIMATED_WIDTH - EDGE_MARGIN),
    top: clamp(base.top, bounds.top + EDGE_MARGIN, bounds.bottom - ESTIMATED_HEIGHT - EDGE_MARGIN),
  };
};

interface Position {
  top: number;
  left: number;
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
  const [corrected, setCorrected] = useState<Position | null>(null);
  useLayoutEffect(() => {
    if (!open || !position || !panelRef.current) { setCorrected(null); return; }
    const rect = panelRef.current.getBoundingClientRect();
    const bounds = viewportBounds();
    const maxLeft = bounds.right - rect.width - EDGE_MARGIN;
    const maxTop = bounds.bottom - rect.height - EDGE_MARGIN;
    const left = position.left > maxLeft ? Math.max(bounds.left + EDGE_MARGIN, maxLeft) : position.left;
    const top = position.top > maxTop ? Math.max(bounds.top + EDGE_MARGIN, maxTop) : position.top;
    setCorrected(left !== position.left || top !== position.top ? { left, top } : null);
  }, [open, position]);

  const finalPosition = position && (corrected ?? position);

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

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open, handleClose]);

  return { position: finalPosition, panelRef };
};

export { useColorPickerPopover };
