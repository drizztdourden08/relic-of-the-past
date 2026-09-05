/* @layer renderer-components @kind hook */
/**
 * The floating panel's mechanics, built the same way the Select dropdown's
 * are: the panel lives in a portal, is positioned from the anchor's own
 * rectangle through the shared anchor tracker, and closes on an outside
 * mousedown or Escape.
 *
 * Using `useAnchorTracking` instead of measuring once on open is what keeps
 * the panel attached while the page or any container underneath it scrolls,
 * and what dismisses it outright once the field has scrolled out of sight.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { dropPanelPositionFor, useAnchorTracking } from '../../Portal';

/** Below this much room underneath, flipping above is worth considering. */
const ROOM_FOR_DROP_DOWN = 220;

/** Breathing space between the field and the panel. */
const FIELD_GAP = 4;

/** A narrow field still gets a readable list, mirroring `.tag-input__panel`. */
const MIN_PANEL_WIDTH = 200;

const tagPanelPositionFor = (rect: DOMRect) =>
  dropPanelPositionFor(rect, {
    roomForDropDown: ROOM_FOR_DROP_DOWN,
    gap: FIELD_GAP,
    minPanelWidth: MIN_PANEL_WIDTH,
  });

const useTagPopup = (disabled: boolean) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => setOpen(false), []);

  const { position } = useAnchorTracking({
    active: open,
    anchorRef,
    compute: tagPanelPositionFor,
    onOutOfView: handleClose,
  });

  // A control disabled while its panel is up has no way to close it otherwise.
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open]);

  return { open, pos: position, anchorRef, panelRef, handleOpen, handleClose };
};

export { useTagPopup };
