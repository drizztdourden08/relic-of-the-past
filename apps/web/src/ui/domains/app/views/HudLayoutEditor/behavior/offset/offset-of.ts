/* @layer renderer-components @kind logic */
import type { Edges } from '@shared/types/hud';
import type { Offset } from './offset.type';

const offsetOf = (margin: Edges | undefined): Offset => ({
  x: margin?.left ?? 0,
  y: margin?.top ?? 0,
});

export { offsetOf };
