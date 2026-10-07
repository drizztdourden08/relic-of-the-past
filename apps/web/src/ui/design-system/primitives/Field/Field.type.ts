/* @layer renderer-components @kind types */
import type { CSSProperties, ReactNode } from 'react';
import type { ControlSize } from '../control-size';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** Shown under the control in place of the hint; the label and the control turn red. */
  error?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Lay the label beside the control instead of above it. */
  inline?: boolean;
  /**
   * Row density. Defaults to `md`.
   *
   * This wraps whatever it is given, so `sm` deliberately does NOT set the
   * shared `--ctl-*` control variables: a compact Field must not silently
   * shrink a control that was asked for at `md`. It tightens its own gaps
   * only, and the control inside it carries its own `size`.
   */
  size?: ControlSize;
  className?: string;
  /** Custom properties a caller measures at runtime, which a class alone
   *  cannot carry. Used by the inspector's formula promotion, which has to know
   *  the real width of the row it floats over. */
  style?: CSSProperties;
  children: ReactNode;
}

export type { FieldProps };
