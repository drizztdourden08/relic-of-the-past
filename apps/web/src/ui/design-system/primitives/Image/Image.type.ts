/* @layer renderer-components @kind types */
import type { ImgHTMLAttributes, ReactNode } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Drawn in place of the element when its `src` fails to load, so a missing
   * file shows a placeholder rather than the browser's broken-image glyph.
   * Without one the element is left as the browser renders it.
   */
  fallback?: ReactNode;
}

export type { ImageProps };
