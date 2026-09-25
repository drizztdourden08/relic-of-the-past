/* @layer sanctuary-site @kind hook */
/**
 * Tells a small image (a sprite, a tile sheet) from a large one once it has loaded. A
 * small image is enlarged to fill its frame, so it is drawn with hard pixel edges; a large
 * one is only ever shrunk, and keeps smooth scaling.
 */
import { useCallback, useState } from 'react';
import type { SyntheticEvent } from 'react';

/** Neither side above this many pixels counts as pixel art. */
const PIXEL_ART_MAX = 256;

const usePixelArt = () => {
  const [pixelArt, setPixelArt] = useState(false);
  const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setPixelArt(naturalWidth <= PIXEL_ART_MAX && naturalHeight <= PIXEL_ART_MAX);
  }, []);
  return { pixelArt, onLoad };
};

export { usePixelArt };
