/* @layer renderer-lib @kind logic */
import { buildNormalPlacement } from '@shared/randomizer/normal-placement';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

let built: Placement | null = null;

const normalPlacement = (): Placement => {
  built ??= buildNormalPlacement();
  return built;
};

export { normalPlacement };
