/* @layer renderer-components @kind types */
import type { InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Fires with the parsed numeric value (NaN if the field is cleared). */
  onChange?: (value: number) => void;
  /**
   * When true, width is set based on the number of digits in the `max` value,
   * using character units (ch) for content-aware sizing. Falls back to flex
   * sizing if max is not provided. Optional; default is false.
   */
  sizeToContent?: boolean;
}

export type { NumberInputProps };
