/* @layer shared-game @kind logic */
import type { DialogBorderThickness, StrokeWidths } from './box-style.type';

const strokeWidthsOf = (thickness: DialogBorderThickness): StrokeWidths => {
  if (thickness === 'thick') return { outer: 4, inner: 2, gap: 1.5 };
  if (thickness === 'medium') return { outer: 2, inner: 1, gap: 1 };
  return { outer: 1, inner: 0.5, gap: 0.75 };
};

export { strokeWidthsOf };
