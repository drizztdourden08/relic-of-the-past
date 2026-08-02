/* @layer renderer-components @kind types */
import type { ComponentPropsWithRef } from 'react';

/** Which way the region is allowed to scroll. The other axis is clipped. */
type ScrollAxis = 'y' | 'x' | 'both';

interface ScrollAreaProps extends ComponentPropsWithRef<'div'> {
  /** Defaults to `'y'` — the common case of a tall list in a fixed-height shell. */
  axis?: ScrollAxis;
}

export type { ScrollAreaProps, ScrollAxis };
