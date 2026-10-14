/* @layer renderer-widgets @kind types */
import type { CheckRecord } from '@rotp/game-data';
import type { CheckGrantPlan } from '@app/game';

type CheckEntryProps = {
  check: CheckRecord;
  done: boolean;
  plan: CheckGrantPlan;
};

export type { CheckEntryProps };
