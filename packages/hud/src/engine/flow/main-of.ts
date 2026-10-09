/* @layer shared-hud @kind logic */
import type { Size } from '../../layouts/geometry.type';

const mainOf = (size: Size, row: boolean): number => (row ? size.w : size.h);

export { mainOf };
