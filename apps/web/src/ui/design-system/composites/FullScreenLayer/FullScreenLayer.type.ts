/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';

interface FullScreenLayerProps {
  children: ReactNode;
  onClose: () => void;
  /** Window title, shown gold + uppercase in the header bar. */
  title?: ReactNode;
  /** Plain-case text after the title (see WindowHeader). */
  subtitle?: ReactNode;
  /** Controls in the title bar, before the close ✕ (see WindowHeader). */
  extra?: ReactNode;
  /** Floats centred on the card's top edge, half above it (a switch between sibling windows). */
  floating?: ReactNode;
  hidden?: boolean;
}

export type {
  FullScreenLayerProps,
};
