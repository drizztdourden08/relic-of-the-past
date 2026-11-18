/* @layer renderer-lib @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { FINAL_FIGHT_SILVER_HITS, maxFloorReasonOf, maxRungFloorOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilySetting, WalletFloor } from '@rotp/randomizer';

const floorNoteOf = (
  capacityFamily: CapacityFamily, setting: FamilySetting, walletFloor: WalletFloor, t: I18n['t'],
): string | undefined => {
  if (setting.mode !== 'custom') return undefined;
  if (maxFloorReasonOf(capacityFamily, walletFloor) === undefined) return undefined;
  const floor = capacityFamily.ladder[maxRungFloorOf(capacityFamily, walletFloor)];
  if (floor === undefined) return undefined;
  if (capacityFamily.id === 'wallet') {
    return t('randomizer:capacity-row.floor-note.wallet', { label: walletFloor.label, need: walletFloor.need, floor });
  }
  return t('randomizer:capacity-row.floor-note.projectiles', { hits: FINAL_FIGHT_SILVER_HITS, floor });
};

export { floorNoteOf };
