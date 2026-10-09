/* @layer renderer-hooks @kind logic */
import { describeRupees } from '@shared/randomizer/world/pond/rupee-gems';
import type { PondPlan } from '@shared/randomizer/world/pond/pond-profile.type';
import type { PondCharge } from './pond-preview.type';

const pondWalletNoteOf = (
  plan: PondPlan, charges: readonly PondCharge[], prizeCount: number,
): string | undefined => {
  if (prizeCount === 0) return undefined;
  const last = plan.throws.findIndex((entry) => entry.prize === prizeCount - 1);
  const reach = charges.slice(0, (last === -1 ? charges.length : last) + 1);
  const dearest = reach.reduce((top, charge) => Math.max(top, charge.rupees), 0);
  if (dearest === 0) return undefined;
  return `wallet must hold ${dearest}, thrown as ${describeRupees(dearest)}`;
};

export { pondWalletNoteOf };
