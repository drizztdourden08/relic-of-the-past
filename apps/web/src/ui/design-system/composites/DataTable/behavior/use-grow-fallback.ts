/* @layer renderer-components @kind hook */
/**
 * Keeps "expand to available space" honest: it only fills while there is space
 * to fill, and sizes itself to its content while there is not.
 *
 * The flag itself is never touched. What comes out of here is a per-render
 * override the track list consults, so a column the user asked to expand STAYS
 * asked-to-expand — close a column, widen the window, and it goes back to
 * filling on its own, with nothing to click again.
 *
 * Two things can change the answer and each has its own trigger: the columns
 * (a signature effect, since a width or a removal changes what the table needs)
 * and the scroller (a ResizeObserver, since the window changes what it can
 * show). Nothing observes the CONTENT — a re-measure that the measurement
 * itself could set off is how a layout loop starts.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { measuredFitWidths, renderedHeaderWidth } from './measure-column';
import { isOverflowing, sameFallback } from './overflow-probe';
import type { RefObject } from 'react';
import type { GrowFallback } from './overflow-probe';
import type { TableColumn } from '../../../data/table/types';

/**
 * A window drag fires the observer far faster than a re-measure is worth doing.
 * Long enough to coalesce a drag into a handful of passes, short enough that
 * letting go of the edge looks instant.
 */
const MEASURE_DELAY_MS = 80;

interface UseGrowFallbackInput {
  columns: readonly TableColumn[];
  /** The scroller the header and rows live in — the thing that overflows. */
  rootRef: RefObject<HTMLElement | null>;
}

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const growPathsOf = (columns: readonly TableColumn[]): string[] =>
  columns.filter((column) => column.grow).map((column) => column.path);

/** Widths and the order they sit in both change what the table needs. */
const columnsSignature = (columns: readonly TableColumn[]): string => JSON.stringify(columns);

const useGrowFallback = ({ columns, rootRef }: UseGrowFallbackInput): GrowFallback => {
  const [fallback, setFallback] = useState<GrowFallback>(null);

  const signature = columnsSignature(columns);
  const growPaths = useMemo(() => growPathsOf(columns), [signature]);
  /* Read from an observer callback, so it must be current without re-observing. */
  const pathsRef = useRef(growPaths);
  pathsRef.current = growPaths;
  /* Skips the observer passes where the scroller did not actually change width. */
  const seenWidthRef = useRef(-1);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const paths = pathsRef.current;
    if (!root) return;
    if (paths.length === 0) {
      setFallback((previous) => (previous === null ? previous : null));
      return;
    }
    const fitted = new Map(measuredFitWidths(root, paths).map(({ path, width }) => [path, width]));
    const overflowing = isOverflowing({
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      flexibleRendered: sum(paths.map((path) => renderedHeaderWidth(root, path))),
      flexibleFitted: sum([...fitted.values()]),
    });
    const next = overflowing ? fitted : null;
    setFallback((previous) => (sameFallback(previous, next) ? previous : next));
  }, [rootRef]);

  /* The column set moved, so what the table needs did too. */
  useEffect(() => {
    measure();
  }, [measure, signature]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      if (root.clientWidth === seenWidthRef.current) return;
      seenWidthRef.current = root.clientWidth;
      clearTimeout(timer);
      timer = setTimeout(measure, MEASURE_DELAY_MS);
    });
    observer.observe(root);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [measure, rootRef]);

  return fallback;
};

export { MEASURE_DELAY_MS, useGrowFallback };
export type { UseGrowFallbackInput };
