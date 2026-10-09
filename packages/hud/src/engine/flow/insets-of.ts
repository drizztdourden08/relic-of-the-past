/* @layer shared-hud @kind logic */
import type { Edges } from '../../types/hud-node';
import type { Insets } from './flow.type';

const insetsOf = (edges?: Edges): Insets => ({
  top: edges?.top ?? 0,
  right: edges?.right ?? 0,
  bottom: edges?.bottom ?? 0,
  left: edges?.left ?? 0,
});

export { insetsOf };
