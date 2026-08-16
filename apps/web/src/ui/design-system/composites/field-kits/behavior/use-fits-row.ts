/* @layer renderer-components @kind hook */
/**
 * Whether the control a row holds still fits it — measured, not guessed from
 * how many things the control offers.
 *
 * The caller keeps a preferred control and a narrower one, and swaps on the
 * answer. Two rules keep that swap from feeding itself:
 *
 * - Only the ROW is observed, never the control inside it. A re-measure that
 *   the measurement itself sets off is how a layout loop starts.
 * - The width the preferred control wants is read on a pass where it is
 *   mounted, remembered, and only ever grows within one option set. So the
 *   answer is monotone in the row's width — a control that has been swapped out
 *   cannot argue its way back in just because the narrow one fits.
 *
 * With no ResizeObserver — server rendering, or a DOM-less test — nothing is
 * measured and the answer stays "it fits", so what renders is the control the
 * caller prefers.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fitsRow } from './fit-probe';
import { measureContentWidth } from './measure-content-width';
import type { RefObject } from 'react';

/**
 * A window drag fires the observer far faster than a re-measure is worth doing.
 * Long enough to coalesce a drag into a handful of passes, short enough that
 * letting go of the edge looks instant.
 */
const MEASURE_DELAY_MS = 80;

interface UseFitsRowInput {
  /** The row the control has to sit inside; its first child is the control. */
  rowRef: RefObject<HTMLElement | null>;
  /** The text the preferred control shows — what it changes is the width it wants. */
  signature: string;
  /** Off where the caller has nothing narrower to swap in, so nothing is observed. */
  enabled: boolean;
}

const useFitsRow = ({ rowRef, signature, enabled }: UseFitsRowInput): boolean => {
  const [fits, setFits] = useState(true);
  /* What the preferred control wants, from a pass where it was the one mounted. */
  const wantedRef = useRef(-1);
  /* Read from an observer callback, so it must be current without re-observing. */
  const fitsRef = useRef(true);
  fitsRef.current = fits;
  /* Skips the observer passes where the row did not actually change width. */
  const seenWidthRef = useRef(-1);

  const measure = useCallback(() => {
    const row = rowRef.current;
    const content = row?.firstElementChild;
    if (!row || !content) return;
    const availableWidth = row.clientWidth;
    // A row of no width has not been laid out, and every control "overflows" one.
    if (availableWidth <= 0) return;
    if (fitsRef.current) wantedRef.current = Math.max(wantedRef.current, measureContentWidth(content));
    if (wantedRef.current < 0) return;
    setFits(fitsRow({ naturalWidth: wantedRef.current, availableWidth }));
  }, [rowRef]);

  /* Different text is a different width, so the preferred control gets another go. */
  useEffect(() => {
    wantedRef.current = -1;
    setFits(true);
  }, [signature]);

  /* `fits` is a dependency because a swap changes which control the row holds. */
  useEffect(() => {
    if (enabled) measure();
  }, [enabled, fits, measure, signature]);

  useEffect(() => {
    const row = rowRef.current;
    if (!enabled || !row || typeof ResizeObserver === 'undefined') return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      if (row.clientWidth === seenWidthRef.current) return;
      seenWidthRef.current = row.clientWidth;
      clearTimeout(timer);
      timer = setTimeout(measure, MEASURE_DELAY_MS);
    });
    observer.observe(row);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [enabled, measure, rowRef]);

  return enabled ? fits : true;
};

export { MEASURE_DELAY_MS, useFitsRow };
export type { UseFitsRowInput };
