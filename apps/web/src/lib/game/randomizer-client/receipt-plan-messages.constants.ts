/* @layer bridge-wasm @kind constants */
import type { PlanPondLines } from './receipt-plan-messages.type';

const NO_POND_LINES: PlanPondLines = {
  byPrice: new Map(), byRefund: new Map(), awardMore: -1, awardLast: -1, closed: -1,
};

export { NO_POND_LINES };
