/* @layer shared-hud @kind logic */
import type { Extent, HudGridContainer } from '../../types/hud-node';

const tracksOf = (container: HudGridContainer, rows: number): { columns: Extent[]; rows: Extent[] } => ({
  columns: container.columns,
  rows: container.rows ?? Array.from({ length: Math.max(1, rows) }, () => 'auto' as const),
});

export { tracksOf };
