/* @layer bridge-wasm @kind logic */
import { clearWishPondPlan } from '../wish-pond-plan';

const disarmWishPondSession = (): void => {
  clearWishPondPlan();
};

export { disarmWishPondSession };
