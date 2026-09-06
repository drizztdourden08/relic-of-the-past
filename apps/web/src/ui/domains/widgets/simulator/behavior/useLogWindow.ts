/* @layer renderer-widgets @kind hook */
/**
 * Windowed rendering for the simulation log. A full run keeps every event (the
 * early history is the interesting part), which is far more rows than the DOM
 * should hold, so only the NEWEST chunk is mounted and older slices load on
 * demand. Rows wrap, so their heights vary. Fixed-height virtualisation would
 * mis-measure them, while windowing keeps wrapping intact.
 *
 * Loading older rows prepends content, so the scroll offset is restored after
 * paint to keep the reader anchored. New events auto-scroll only while the
 * reader is already at the bottom, so reading history is never yanked away.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const CHUNK = 400;
/** Distance from the bottom (px) still counted as "following the tail". */
const BOTTOM_SLACK = 60;

const useLogWindow = (total: number) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(CHUNK);
  const atBottom = useRef(true);
  /** Scroll height captured before a prepend, so the offset can be restored. */
  const pendingAnchor = useRef<number | null>(null);

  // A new run (or a reset) shrinks the list: start again from the newest chunk.
  useEffect(() => {
    if (total < visible) setVisible(Math.min(CHUNK, Math.max(total, 1)));
  }, [total, visible]);

  const loadOlder = useCallback(() => {
    const el = scrollRef.current;
    pendingAnchor.current = el ? el.scrollHeight - el.scrollTop : null;
    setVisible((v) => Math.min(total, v + CHUNK));
  }, [total]);

  // Restore the reader's anchor after older rows mount above them.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || pendingAnchor.current === null) return;
    el.scrollTop = el.scrollHeight - pendingAnchor.current;
    pendingAnchor.current = null;
  }, [visible]);

  const jumpToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    atBottom.current = true;
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
  }, []);

  // Follow the tail as events stream in, but only when already parked there.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom.current && pendingAnchor.current === null) el.scrollTop = el.scrollHeight;
  }, [total, visible]);

  const shownCount = Math.min(visible, total);
  return { scrollRef, shownCount, hiddenOlder: total - shownCount, loadOlder, jumpToBottom, handleScroll };
};

export { useLogWindow };
