/* @layer renderer-components @kind logic */
import { solveGrid } from '@rotp/hud';
import type { MeasureContext, PlacedNode, HudGridContainer } from '@rotp/hud';
import type { GridSolve, GridSolveLookup } from './grid-solve';

const isGrid = (placed: PlacedNode): boolean =>
  placed.node.kind === 'container' && placed.node.layout === 'grid';

const solveLookup = (placed: readonly PlacedNode[], ctx: MeasureContext): GridSolveLookup => {
  const cache = new Map<string, GridSolve | null>();
  return (container: HudGridContainer): GridSolve | null => {
    const held = cache.get(container.id);
    if (held !== undefined) return held;
    const host = placed.find((p) => p.id === container.id && isGrid(p));
    const solved = host
      ? ((): GridSolve => {
        const { colSizes, rowSizes } = solveGrid(host.node as HudGridContainer, host.rect, host.scale, ctx);
        return { columns: colSizes, rows: rowSizes };
      })()
      : null;
    cache.set(container.id, solved);
    return solved;
  };
};

export { solveLookup };
