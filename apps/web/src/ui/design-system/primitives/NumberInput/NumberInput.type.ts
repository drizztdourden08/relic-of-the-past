/* @layer renderer-components @kind types */
import type { InputHTMLAttributes } from 'react';
import type { ControlSize } from '../control-size';

/**
 * `size` is taken over from the DOM here for the same reason as on `TextInput`.
 * This props type extends `InputHTMLAttributes` too, so it inherited the
 * native character-count attribute and the same collision. `htmlSize` keeps
 * that attribute reachable under a name that cannot be read as a tier.
 */
interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  /** Fires with the parsed numeric value (NaN if the field is cleared). */
  onChange?: (value: number) => void;
  /** Control density. Defaults to `md`, which is the tier this input draws today. */
  size?: ControlSize;
  /** The native `size` attribute: a width in characters, not a density. */
  htmlSize?: number;
  /**
   * When true, width is set based on the number of digits in the `max` value,
   * using character units (ch) for content-aware sizing. Falls back to flex
   * sizing if max is not provided. Optional; default is false.
   */
  sizeToContent?: boolean;
}

export type { NumberInputProps };
