/* @layer shared-hud @kind logic */
const flowGaps = (gap: { x: number; y: number }, row: boolean): { main: number; cross: number } =>
  (row ? { main: gap.x, cross: gap.y } : { main: gap.y, cross: gap.x });

export { flowGaps };
