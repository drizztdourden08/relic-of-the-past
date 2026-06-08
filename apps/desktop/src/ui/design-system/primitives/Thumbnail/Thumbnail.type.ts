/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

interface ThumbnailProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source. When absent, the placeholder is rendered instead. */
  src?: string | null;
  /** Alt text for the image. */
  alt?: string;
  /** Content shown when there is no `src` (e.g. a "No Screenshot" label). */
  placeholder?: ReactNode;
}

export type { ThumbnailProps };
