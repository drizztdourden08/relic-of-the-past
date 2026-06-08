/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface StatRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Render the value in a monospace font (addresses, ids, coords). */
  mono?: boolean;
  className?: string;
}

export type { StatRowProps };
