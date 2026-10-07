/* @layer renderer-lib @kind logic */
/**
 * Normal's placement, built once for the session.
 *
 * Nothing about it varies while the app runs: every location holds what the unmodified game puts
 * there, and no rng is drawn. Two tracker surfaces and the simulator's picker all ask for it, so
 * it is built on the first ask and kept.
 */
import { buildNormalPlacement } from '@shared/randomizer/normal-placement';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

let built: Placement | null = null;

const normalPlacement = (): Placement => {
  built ??= buildNormalPlacement();
  return built;
};

export { normalPlacement };
