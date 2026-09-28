/* @layer store-site @kind hook */
/**
 * How large the welcome's highlight picture draws, as the size of one of its pixels: whole
 * CSS pixels only, so the pixel art stays sharp. Below the compact breakpoint (--bp-compact)
 * it shrinks to leave the text its room.
 */
import { useSyncExternalStore } from 'react';

const COMPACT_QUERY = '(width <= 820px)';
const PIXEL_SIZE = 2;
const PIXEL_SIZE_COMPACT = 1;

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const readCompact = () => window.matchMedia(COMPACT_QUERY).matches;

const useHighlightScale = (): number => {
  const compact = useSyncExternalStore(subscribe, readCompact, () => false);
  return compact ? PIXEL_SIZE_COMPACT : PIXEL_SIZE;
};

export { useHighlightScale };
