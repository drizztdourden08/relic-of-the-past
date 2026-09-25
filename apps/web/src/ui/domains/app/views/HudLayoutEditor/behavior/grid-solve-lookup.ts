/* @layer renderer-components @kind logic */
/**
 * The lookup behind `GridSolveContext`: every grid on the stage, solved once,
 * keyed by the container's id.
 *
 * IT IS THE STAGE'S OWN SOLVE, NOT A SECOND ONE. `solveGrid` is handed the
 * container's real placed rectangle and the same `MeasureContext`
 * `StageGridEcho` and `ContainerOverlay` read, so a panel cell and a stage cell are
 * the same rectangle by construction instead of by two pieces of arithmetic
 * agreeing. The solve's `unit` is the container's OWN placed scale - the factor
 * its children were laid out at - so a grid inside a scaled subtree (the compact
 * layout runs at 0.75) solves against the area it really has; a hard-coded 1 was
 * only right at the root. Track sizes come back in authored px, which is what
 * makes them scale-free: the panel draws them as `fr` weights and the
 * stage draws them at the display scale, from one set of numbers.
 *
 * A REPEAT'S INSTANCES ALL SOLVE. They share one authored id, and the FIRST is
 * taken. The alternative is drawing the panel's lattice differently depending
 * on which instance happened to come back first, which is worse than picking
 * one and saying so.
 */
import { solveGrid } from '@shared/hud/engine/place-grid';
import type { MeasureContext } from '@shared/hud/engine/engine.type';
import type { PlacedNode } from '@shared/hud/engine';
import type { HudGridContainer } from '@shared/types/hud';
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
