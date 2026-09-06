/* @layer renderer-components @kind hook */
/**
 * Column-width jobs that need the DOM. A resize drag never goes through state
 * (a setState per mouse move would re-render every row); it writes the track
 * list custom property and commits on pointer up. The fallbacks ride alongside
 * the column list; see `use-grow-fallback` and `use-fit-fallback`. Scoped to
 * one table so two tables never measure each other.
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
  /** Shows a width without committing it. Lasts only as long as the drag. */
  previewWidth: (path: string, width: number) => void;
  /** What each grow column renders at while there is no slack. Null while they can fill. Never written back into the column list. */
  growFallback: GrowFallback;
  /** What each fit-mode column measures at. Null only before the first measurement or while no column is in fit mode. */
  fitFallback: GrowFallback;
}

const useColumnSizing = ({ columns, onResize }: UseColumnSizingInput): ColumnSizing => {
  const rootRef = useRef<HTMLElement>(null);
  /* Read during a drag, so it must be the current list without re-binding the handler. */
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
