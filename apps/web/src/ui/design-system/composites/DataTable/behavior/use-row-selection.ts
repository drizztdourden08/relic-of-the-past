/* @layer renderer-components @kind hook */
/**
 * Multi-selection over the drawn rows. The set is the host's (`selectedIds` in,
 * `onSelectionChange` out); this hook only keeps the anchor a Shift-click ranges from.
 * With no `selectedIds` it returns null and the table keeps its single selection.
 */
import { useMemo, useRef } from 'react';
import { ghostRowSample } from './ghost-row-sample';
import { allStateOf, checkAllOf, rangeBetween, toggledId } from './row-selection-math';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { GroupedRow } from '../../../data/table/types';
import type { RowSelectionBinding } from '../DataTable.type';

interface UseRowSelectionInput<T> {
  nodes: readonly GroupedRow<T>[];
  isExpanded: (uid: string) => boolean;
  getRowId: (row: T) => string;
  selectable: boolean;
  selectedIds?: ReadonlySet<string>;
  /** Where a range starts before any row was clicked, e.g. a row opened from a link. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onSelectionChange?: (ids: ReadonlySet<string>) => void;
}

const EMPTY: ReadonlySet<string> = new Set();

/** The checkbox cells; a key pressed on one of their boxes counts as the grid's. */
const SELECT_CELL_SELECTOR = '.data-table__select';

const isToggleClick = (event: MouseEvent<HTMLElement>) => event.ctrlKey || event.metaKey;

const isGridKey = (event: KeyboardEvent<HTMLElement>) => {
  const { target, currentTarget } = event;
  return target === currentTarget || (target instanceof Element && target.closest(SELECT_CELL_SELECTOR) !== null);
};

const useRowSelection = <T,>(input: UseRowSelectionInput<T>): RowSelectionBinding | null => {
  const {
    nodes, isExpanded, getRowId, selectable, selectedIds, selectedId, onSelect, onSelectionChange,
  } = input;
  const anchorRef = useRef<string | null>(null);

  /* The rows as drawn: a collapsed branch is not on screen, so neither a range nor the header box reaches it. */
  const order = useMemo(
    () => (selectedIds
      ? ghostRowSample({ nodes, isExpanded, limit: Number.POSITIVE_INFINITY }).map(getRowId)
      : []),
    [selectedIds, nodes, isExpanded, getRowId],
  );

  return useMemo(() => {
    if (!selectedIds) return null;
    const change = (ids: ReadonlySet<string>) => onSelectionChange?.(ids);

    const extend = (id: string, keep: boolean) => {
      const from = anchorRef.current ?? selectedId ?? null;
      const range = from === null ? [id] : rangeBetween(order, from, id);
      change(new Set([...(keep ? selectedIds : EMPTY), ...range]));
    };

    const toggle = (id: string) => {
      anchorRef.current = id;
      change(toggledId(selectedIds, id));
    };

    const onRowClick = (id: string, event: MouseEvent<HTMLElement>) => {
      if (event.shiftKey) {
        extend(id, isToggleClick(event));
        return;
      }
      if (isToggleClick(event)) {
        toggle(id);
        return;
      }
      anchorRef.current = id;
      change(new Set([id]));
      onSelect?.(id);
    };

    const onRowMouseDown = (event: MouseEvent<HTMLElement>) => {
      if (event.shiftKey) event.preventDefault();
    };

    /* Only from the grid or a row's box: a key pressed in a menu or a field bubbles here too. */
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Escape' || selectedIds.size === 0 || !isGridKey(event)) return;
      event.preventDefault();
      change(EMPTY);
    };

    return {
      selectable,
      isSelected: (id: string) => selectedIds.has(id),
      onRowClick,
      onRowMouseDown,
      onCheck: (id: string, range: boolean) => (range ? extend(id, true) : toggle(id)),
      onCheckAll: () => change(checkAllOf(order, selectedIds)),
      allState: allStateOf(order, selectedIds),
      onKeyDown,
    };
  }, [selectedIds, selectedId, selectable, order, onSelect, onSelectionChange]);
};

export { useRowSelection };
export type { UseRowSelectionInput };
