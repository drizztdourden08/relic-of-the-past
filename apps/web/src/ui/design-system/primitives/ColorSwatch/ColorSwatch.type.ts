/* @layer renderer-components @kind types */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ColorSwatchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** The colour to show, as `#rrggbb`. */
  color: string;
  /** Small caption inside the swatch — a palette index, usually. */
  caption?: ReactNode;
  /** Draws the selection ring. */
  selected?: boolean;
  /** Marks the swatch as differing from its original value. */
  edited?: boolean;
  /** Renders a checkerboard instead of a fill, for a slot with no colour. */
  transparent?: boolean;
}

export type { ColorSwatchProps };
