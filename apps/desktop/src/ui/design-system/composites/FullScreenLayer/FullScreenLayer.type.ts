/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';

interface FullScreenLayerProps {
  children: ReactNode;
  onClose: () => void;
  /** Window title — shown gold + uppercase in the header bar. */
  title?: ReactNode;
  hidden?: boolean;
}

export type {
  FullScreenLayerProps,
};
