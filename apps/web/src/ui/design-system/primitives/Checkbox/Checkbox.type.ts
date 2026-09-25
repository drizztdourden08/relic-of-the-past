/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ControlSize } from '../control-size';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  /** Accessible name for a box whose visible label is drawn somewhere else. */
  ariaLabel?: string;
  disabled?: boolean;
  /** Draws the mixed state, for a box that stands for a partly checked set. */
  indeterminate?: boolean;
  className?: string;
  /** Control density. Defaults to `md`, which is the 14px box it draws today. */
  size?: ControlSize;
}

export type { CheckboxProps };
