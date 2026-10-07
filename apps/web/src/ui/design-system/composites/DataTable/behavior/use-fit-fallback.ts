/* @layer renderer-components @kind hook */
/**
 * Keeps "fit to content" a mode: a fit column re-measures as content changes.
 * The flag is never touched; this returns a per-render override like
 * `use-grow-fallback`. Content changes are all DOM mutations in the scroller,
 * so one `MutationObserver` covers them. It watches structure and text only:
 * this hook writes a custom property (an attribute) and the measuring clones
 * go on `document.body`, so a re-measure never triggers itself.
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
  /** The scroller the header and rows live in. */
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

  /* The column set changed. */
  useEffect(() => {
    measure();
  }, [measure, signature]);

  /* The content changed: filtering, sorting, an edit, a resize elsewhere. */
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
