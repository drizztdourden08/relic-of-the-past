/* @layer renderer-app @kind types */
import type { CSSProperties } from 'react';

interface ProgressRingProps {
  size: number;
  progress: number;
  className?: string;
  style?: CSSProperties;
}

export type { ProgressRingProps };
