/* @layer renderer-hud @kind types */
import type { ImgHTMLAttributes } from 'react';

interface HudImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  pixelated?: boolean;
  block?: boolean;
  atOrigin?: boolean;
}

export type { HudImageProps };
