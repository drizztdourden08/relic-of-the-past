/* @layer store-site @kind logic */
/**
 * An item's colour as the `--item-color` custom property, for the card border and the
 * placeholder picture. No colour leaves the property unset, so the styles fall back to gold.
 */
import type { CSSProperties } from 'react';

const itemColorStyle = (color: string | null | undefined): CSSProperties | undefined =>
  (color ? ({ '--item-color': color } as CSSProperties) : undefined);

export { itemColorStyle };
