/* @layer renderer-components @kind hook */
import { useState, useRef, useCallback, useEffect } from 'react';
import { dropPanelPositionFor, useAnchorTracking } from '../../Portal';
import type { SelectOption } from '../Select.type';

/** Below this much room underneath, flipping above is worth considering. */
const ROOM_FOR_DROP_DOWN = 200;

/** Breathing space between the trigger and the panel. */
const TRIGGER_GAP = 4;

/** A narrow trigger still gets a readable list, mirroring `.select-content`'s min-width. */
const MIN_PANEL_WIDTH = 180;

const selectPositionFor = (rect: DOMRect) =>
  dropPanelPositionFor(rect, {
    roomForDropDown: ROOM_FOR_DROP_DOWN,
    gap: TRIGGER_GAP,
    minPanelWidth: MIN_PANEL_WIDTH,
  });

interface UseSelectDropdownParams {
  disabled: boolean;
  searchable: boolean;
  allOptions: SelectOption[];
  onChange: (value: string) => void;
}

const useSelectDropdown = (params: UseSelectDropdownParams) => {
  const { disabled, searchable, allOptions, onChange } = params;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? allOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : allOptions;

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setHighlightIdx(-1);
  }, [disabled]);

  /**
   * Dismissal that leaves focus alone. Restoring focus to a trigger the user
   * has just scrolled off screen would drag it straight back into view, so the
   * scroll path uses this while every deliberate close uses `handleClose`.
   */
  const handleDismiss = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const handleClose = useCallback(() => {
    handleDismiss();
    triggerRef.current?.focus();
  }, [handleDismiss]);

  // The panel is portalled and positioned in viewport coordinates, so it only
  // stays attached to the trigger if it is re-measured as things scroll.
  const { position: pos } = useAnchorTracking({
    active: open,
    anchorRef: triggerRef,
    compute: selectPositionFor,
    onOutOfView: handleDismiss,
  });

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      handleClose();
    },
    [onChange, handleClose],
  );

  // Focus the search box once the panel has been laid out
  useEffect(() => {
    if (!open || !searchable) return undefined;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, searchable]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        contentRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, handleClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open, handleClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIdx((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < filtered.length) {
            handleSelect(filtered[highlightIdx].value);
          }
          break;
      }
    },
    [open, highlightIdx, filtered, handleOpen, handleSelect],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || highlightIdx < 0) return;
    const el = contentRef.current?.querySelector(`[data-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  return {
    open,
    search,
    setSearch,
    highlightIdx,
    setHighlightIdx,
    filtered,
    pos,
    triggerRef,
    contentRef,
    searchRef,
    handleOpen,
    handleClose,
    handleSelect,
    handleKeyDown,
  };
};

export { useSelectDropdown };
export type { UseSelectDropdownParams };
