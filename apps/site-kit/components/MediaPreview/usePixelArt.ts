/* @layer site-kit @kind hook */
import { useCallback, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { PIXEL_ART_MAX_SIDE } from './usePixelArt.constants';

const usePixelArt = () => {
  const [pixelArt, setPixelArt] = useState(false);
  const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setPixelArt(naturalWidth <= PIXEL_ART_MAX_SIDE && naturalHeight <= PIXEL_ART_MAX_SIDE);
  }, []);
  return { pixelArt, onLoad };
};

export { usePixelArt };
