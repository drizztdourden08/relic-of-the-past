/* @layer renderer-components @kind types */
import type { InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Fires with the parsed numeric value (NaN if the field is cleared). */
  onChange?: (value: number) => void;
}

export type { NumberInputProps };
