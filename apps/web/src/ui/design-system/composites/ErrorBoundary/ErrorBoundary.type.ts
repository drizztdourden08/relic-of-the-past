/* @layer renderer-components @kind types */
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** The headline of the inline notice; the thrown message follows it. */
  label?: string;
  /** A way out, rendered under the notice (a reset control, typically). */
  action?: ReactNode;
  /** When this value changes, the caught error is dropped and the children render again. */
  resetKey?: unknown;
  onError?: (error: unknown, info: ErrorInfo) => void;
  className?: string;
}

interface ErrorBoundaryState {
  caught: boolean;
  error: unknown;
}

export type { ErrorBoundaryProps, ErrorBoundaryState };
