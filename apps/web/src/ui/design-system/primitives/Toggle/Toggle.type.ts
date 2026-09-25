/* @layer renderer-components @kind types */
import type { ControlSize } from '../control-size';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  link?: string;
  /** Control density. Defaults to `md`, which is the 36x20 track it draws today. */
  size?: ControlSize;
}

export type {
  ToggleProps,
};
