/* @layer shared-game @kind constants */
import type { PondPlan } from '../pond-profile.type';

const EMPTY_PLAN: PondPlan = {
  mode: 'capacity', throws: [], locations: [], worstPriceOfPrize: [], totalPrice: 0,
};

const NO_REFUND = 0;

const NO_PRIZE = -1;

export { EMPTY_PLAN, NO_PRIZE, NO_REFUND };
