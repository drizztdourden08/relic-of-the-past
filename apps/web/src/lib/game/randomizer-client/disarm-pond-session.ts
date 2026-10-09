/* @layer bridge-wasm @kind logic */
import { clearPondPlan } from '../pond-plan';
import { disarmWishPondSession } from './disarm-wish-pond-session';
import { disarmPondDemandSession } from './disarm-pond-demand-session';

const disarmPondSession = (): void => {
  clearPondPlan();
  disarmWishPondSession();
  disarmPondDemandSession();
};

export { disarmPondSession };
