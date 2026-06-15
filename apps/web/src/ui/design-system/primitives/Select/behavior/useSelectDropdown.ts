/* @layer renderer-components @kind hook */
import { useState, useRef, useCallback, useEffect } from 'react';
import type { SelectOption } from '../Select.type';

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
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 200 });

  const filtered = search
    ? allOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : allOptions;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 200 && rect.top > spaceBelow;
    setPos({
      top: dropUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    if (contentRef.current) {
      contentRef.current.style.transform = dropUp ? 'translateY(-100%)' : '';
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setHighlightIdx(-1);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      handleClose();
    },
    [onChange, handleClose],
  );

  // Update position when opening
  useEffect(() => {
    if (open) {
      updatePosition();
      requestAnimationFrame(() => {
        if (searchable && searchRef.current) {
          searchRef.current.focus();
        }
      });
    }
  }, [open, updatePosition, searchable]);

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
