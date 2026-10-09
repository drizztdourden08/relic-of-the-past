/* @layer shared-hud @kind logic */
import type { Size } from '../../layouts/geometry.type';

const crossOf = (size: Size, row: boolean): number => (row ? size.h : size.w);

export { crossOf };
