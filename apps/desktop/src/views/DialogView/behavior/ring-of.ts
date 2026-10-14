/* @layer renderer-hud @kind logic */
import type { DialogBorder, strokeWidthsOf } from '@rotp/game-data';

const ringOf = (borderKind: DialogBorder, widths: ReturnType<typeof strokeWidthsOf>): number => {
  if (borderKind === 'single') return widths.outer;
  return borderKind === 'double' ? widths.outer + widths.inner + widths.gap : 0;
};

export { ringOf };
