/* @layer renderer-components @kind types */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ControlSize } from '../control-size';

interface ColorSwatchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** The colour to show, as `#rrggbb`. */
  color: string;
  /** Small caption inside the swatch, usually a palette index. */
  caption?: ReactNode;
  /** Draws the selection ring. */
  selected?: boolean;
  /** Marks the swatch as differing from its original value. */
  edited?: boolean;
  /** Renders a checkerboard instead of a fill, for a slot with no colour. */
  transparent?: boolean;
  /**
   * Control density. Defaults to `md`, which is 28px (the fallback in `--swatch-size`).
   *
   * `sm` sets `--swatch-size` on the swatch's own root instead of writing a
   * competing width/height rule, because `ColorPicker` already sets that same
   * variable to 16px on two of its internal grids. `md` sets nothing at all,
   * so a swatch inside the picker still inherits the picker's 16px and does
   * not snap back to 28 the moment this prop exists.
   */
  size?: ControlSize;
}

export type { ColorSwatchProps };
