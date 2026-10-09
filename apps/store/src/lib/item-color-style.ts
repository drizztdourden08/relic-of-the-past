/* @layer store-site @kind logic */
import type { CSSProperties } from 'react';

const itemColorStyle = (color: string | null | undefined): CSSProperties | undefined =>
  (color ? ({ '--item-color': color } as CSSProperties) : undefined);

export { itemColorStyle };
