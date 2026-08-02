/* @layer renderer-components @kind hook */
/**
 * Keeps "fit to content" honest as a MODE rather than a one-shot click: a fit
 * column keeps re-measuring the widest value it can see and rendering at
 * that width, instead of freezing at whatever it measured the moment the
 * mode was turned on.
 *
 * The flag itself is never touched — what comes out of here is a per-render
 * override the track list consults, the same shape `use-grow-fallback` next
 * door returns. The difference is what triggers a re-measure. A grow column
 * only cares whether the scroller can still give it space, so that hook
 * watches the scroller and deliberately ignores content. A fit column has no
 * such condition — it always renders at its content width — so it has to
 * watch the content instead: a filtered-out row, a re-sorted order, an edited
 * cell's text and an added or removed column are all a DOM mutation inside
 * the scroller, so one `MutationObserver` covers every one of them without
 * this hook needing to know which actually happened.
 *
 * That observer only has to watch structure and text, never attributes — the
 * one thing this hook itself writes back is a custom property on the
 * scroller's own `style`, and the offscreen clones `measuredFitWidths` reads
 * are appended to `document.body`, not here. Neither shows up as a childList
 * or characterData change in this subtree, so a re-measure can never trigger
 * a re-measure of its own.
 */
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { measuredFitWidths } from './measure-column';
import { sameFallback } from './overflow-probe';
import type { RefObject } from 'react';
import type { GrowFallback } from './overflow-probe';
import type { TableColumn } from '../../../data/table/types';

/** Coalesces a burst of edits (typing, a fast filter change) into one measurement. */
const MEASURE_DELAY_MS = 80;

interface UseFitFallbackInput {
  columns: readonly TableColumn[];
  /** The scroller the header and rows live in — everything measurable is inside it. */
  rootRef: RefObject<HTMLElement | null>;
}

const fitPathsOf = (columns: readonly TableColumn[]): string[] =>
  columns.filter((column) => column.fit).map((column) => column.path);

/** Widths, modes and the order columns sit in all change what needs measuring. */
const columnsSignature = (columns: readonly TableColumn[]): string => JSON.stringify(columns);

const useFitFallback = ({ columns, rootRef }: UseFitFallbackInput): GrowFallback => {
  const [fallback, setFallback] = useState<GrowFallback>(null);

  const signature = columnsSignature(columns);
  const fitPaths = useMemo(() => fitPathsOf(columns), [signature]);
  /* Read from an observer callback, so it must be current without re-observing. */
  const pathsRef = useRef(fitPaths);
  pathsRef.current = fitPaths;

  const measure = useCallback(() => {
    const root = rootRef.current;
    const paths = pathsRef.current;
    if (!root) return;
    if (paths.length === 0) {
      setFallback((previous) => (previous === null ? previous : null));
      return;
    }
    const next = new Map(measuredFitWidths(root, paths).map(({ path, width }) => [path, width]));
    setFallback((previous) => (sameFallback(previous, next) ? previous : next));
  }, [rootRef]);

  /* The column set moved — a fit column arrived, left, or the set to measure changed. */
  useEffect(() => {
    measure();
  }, [measure, signature]);

  /* What the columns are showing moved — filtering, sorting, an edit, a resize elsewhere. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === 'undefined') return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, MEASURE_DELAY_MS);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [measure, rootRef]);

  return fallback;
};

export { MEASURE_DELAY_MS, useFitFallback };
export type { UseFitFallbackInput };
