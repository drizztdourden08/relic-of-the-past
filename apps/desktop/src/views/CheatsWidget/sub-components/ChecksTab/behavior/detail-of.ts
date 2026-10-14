/* @layer renderer-widgets @kind logic */
import type { CheckGrantPlan } from '@app/game';

const detailOf = (plan: CheckGrantPlan): string =>
  (plan.kind === 'blocked' ? `Cannot grant: ${plan.reason}` : `Gives: ${plan.itemLabel}`);

export { detailOf };
