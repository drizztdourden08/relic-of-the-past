/* @layer renderer-components @kind logic */
import type { HudGridContainer } from '@shared/types/hud';
import type { Occupant } from './lattice-geometry.type';

const rowCountFor = (container: HudGridContainer, occupants: readonly Occupant[]): number =>
  Math.max(container.rows?.length ?? 0, 1, ...occupants.map((o) => o.row + o.rowSpan - 1));

export { rowCountFor };
