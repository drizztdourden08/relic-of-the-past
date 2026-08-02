/* @layer renderer-components @kind hook */
/**
 * The column-width jobs that need the DOM rather than the state.
 *
 * A resize drag must not go through state at all while it is running — the
 * table renders every row it holds, so a setState per mouse move would
 * re-render the lot thirty times a second. It goes through the one element
 * the header and the rows hang off instead: the track list is a custom
 * property there, so a preview is a single property write and the committed
 * width is what lands in state when the pointer comes up.
 *
 * The same element answers two more questions, each with its own fallback
 * hook next door: whether the table has any room left over for a grow column
 * to take, and — now that "fit to content" is a persistent MODE rather than a
 * one-shot measurement — what a fit column is currently measuring at. Both
 * fallbacks ride alongside the column list rather than being written into it;
 * see `use-grow-fallback` and `use-fit-fallback`.
 *
 * Scoped to one table on purpose: two tables on a page must never measure or
 * resize each other.
 */
import { useCallback, useRef } from 'react';
import { trackListWith } from '../DataTable.constants';
import { useFitFallback } from './use-fit-fallback';
import { useGrowFallback } from './use-grow-fallback';
import type { RefObject } from 'react';
import type { GrowFallback } from './overflow-probe';
import type { TableColumn } from '../../../data/table/types';

/** The custom property the header and every row read their tracks from. */
const TRACKS_PROPERTY = '--dt-tracks';

interface UseColumnSizingInput {
  columns: readonly TableColumn[];
  onResize: (path: string, width: number) => void;
}

interface ColumnSizing {
  /** Put this on the element the header and rows live inside. */
  rootRef: RefObject<HTMLElement | null>;
  /** Shows a width without committing it — for the length of a drag only. */
  previewWidth: (path: string, width: number) => void;
  /**
   * What each grow column renders at while the table has no slack to give it.
   * Null while they can genuinely fill. Never written back into the column
   * list: the flag stays, so the fill returns on its own once space does.
   */
  growFallback: GrowFallback;
  /**
   * What each fit-mode column is currently measuring at. Unlike the grow
   * fallback this is not conditional on overflow — a fit column always
   * renders at its own measured width — so it is null only before the first
   * measurement lands or while no column is in fit mode.
   */
  fitFallback: GrowFallback;
}

const useColumnSizing = ({ columns, onResize }: UseColumnSizingInput): ColumnSizing => {
  const rootRef = useRef<HTMLElement>(null);
  /* Read during a drag, so it must be the CURRENT list without re-binding the handler. */
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const growFallback = useGrowFallback({ columns, rootRef });
  const growFallbackRef = useRef(growFallback);
  growFallbackRef.current = growFallback;

  const fitFallback = useFitFallback({ columns, rootRef });
  const fitFallbackRef = useRef(fitFallback);
  fitFallbackRef.current = fitFallback;

  const previewWidth = useCallback((path: string, width: number) => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = trackListWith(columnsRef.current, path, width, growFallbackRef.current, fitFallbackRef.current);
    root.style.setProperty(TRACKS_PROPERTY, tracks);
  }, []);

  return {
    rootRef, previewWidth, growFallback, fitFallback,
  };
};

export { TRACKS_PROPERTY, useColumnSizing };
export type { ColumnSizing, UseColumnSizingInput };
