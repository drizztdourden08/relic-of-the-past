/* @layer renderer-lib @kind logic */
import { maxFloorReasonOf, maxRungFloorOf } from '@shared/randomizer/world/capacity';
import type { CapacityFamily, FamilySetting, WalletFloor } from '@shared/randomizer/world/capacity';

const floorNoteOf = (
  capacityFamily: CapacityFamily, setting: FamilySetting, walletFloor: WalletFloor,
): string | undefined => {
  if (setting.mode !== 'custom') return undefined;
  const reason = maxFloorReasonOf(capacityFamily, walletFloor);
  if (reason === undefined) return undefined;
  const floor = capacityFamily.ladder[maxRungFloorOf(capacityFamily, walletFloor)];
  return `${reason}, so the final max stops no lower than ${floor}`;
};

export { floorNoteOf };
