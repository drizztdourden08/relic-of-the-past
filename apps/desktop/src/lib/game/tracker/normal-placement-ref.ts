/* @layer renderer-lib @kind logic */
import { buildNormalPlacement } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';

let built: Placement | null = null;

const normalPlacement = (): Placement => {
  built ??= buildNormalPlacement();
  return built;
};

export { normalPlacement };
