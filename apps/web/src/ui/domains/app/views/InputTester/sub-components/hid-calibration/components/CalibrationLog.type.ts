/* @layer renderer-components @kind types */
import type React from 'react';

interface CalibrationLogProps {
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

export type { CalibrationLogProps };
