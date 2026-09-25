/* @layer renderer-components @kind types */
import type { InputHTMLAttributes } from 'react';
import type { ControlSize } from '../control-size';

/**
 * `size` is taken over from the DOM.
 *
 * `<input size>` is a native attribute meaning "show roughly N characters", and
 * `InputHTMLAttributes` types it as `number`. Leaving it in place would make
 * `size="sm"` a type error on this one component and `size={4}` mean something
 * else entirely on the rest. That is the exact confusion the compact tier is supposed
 * to remove. So the native one is omitted and the name is spent on the density
 * variant, which is what a caller in this codebase means every time.
 *
 * Nothing in `apps/` or `shared/` passed the native attribute (checked before
 * the omission), so no call site changes. `htmlSize` keeps the capability
 * addressable for the day one does need it, under a name that cannot be
 * mistaken for the tier.
 */
interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Control density. Defaults to `md`, which is the tier this input draws today. */
  size?: ControlSize;
  /** The native `size` attribute: a width in characters, not a density. */
  htmlSize?: number;
}

export type {
  TextInputProps,
};
