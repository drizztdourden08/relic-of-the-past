/* @layer renderer-lib @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { maxFloorReasonOf, maxRungFloorOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilySetting, WalletFloor } from '@rotp/randomizer';

const floorNoteOf = (
  capacityFamily: CapacityFamily, setting: FamilySetting, walletFloor: WalletFloor, t: I18n['t'],
): string | undefined => {
  if (setting.mode !== 'custom') return undefined;
  const reason = maxFloorReasonOf(capacityFamily, walletFloor);
  if (reason === undefined) return undefined;
  const floor = capacityFamily.ladder[maxRungFloorOf(capacityFamily, walletFloor)];
  return t('randomizer:capacity-row.floor-note', { reason, floor });
};

export { floorNoteOf };
