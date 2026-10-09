/* @layer renderer-lib @kind logic */
import { FAMILIES, NO_WALLET_FLOOR, planOf } from '@rotp/randomizer';
import type { CapacityFamily, CapacityFamilyId, CapacityProfile, FamilySetting, WalletFloor, WalletSetting } from '@rotp/randomizer';
import type { CapacityRowState } from '@app/compounds/CapacityFamilyRow';
import { isPresetChoice } from './is-preset-choice';
import { presetOfChoice } from './preset-of-choice';
import { rowStateOf } from './row-state-of';
import { settingOfRowState } from './setting-of-row-state';

const detachedFromReading = (
  capacityFamily: CapacityFamily, current: FamilySetting, next: CapacityRowState,
): CapacityRowState => {
  if (!isPresetChoice(next.curve) || rowStateOf(capacityFamily, current).curve !== next.curve) return next;
  return { ...next, curve: presetOfChoice(next.curve).curve };
};

const applyRowChange = (
  profile: CapacityProfile, family: CapacityFamilyId, next: CapacityRowState,
  walletFloor: WalletFloor = NO_WALLET_FLOOR,
): CapacityProfile => {
  const capacityFamily = FAMILIES.find((candidate) => candidate.id === family);
  if (capacityFamily === undefined) return profile;
  const current = profile[family];
  const detached = detachedFromReading(capacityFamily, current, next);
  const seeded = detached.curve === 'free' && detached.jumps.length === 0 && current.mode === 'custom'
    ? { ...detached, jumps: planOf(capacityFamily, { ...current, start: capacityFamily.ladder[detached.range[0]], max: capacityFamily.ladder[detached.range[1]] }).jumps }
    : detached;
  const setting = settingOfRowState(capacityFamily, seeded, walletFloor);
  if (family === 'wallet') return { ...profile, wallet: (setting.mode === 'vanilla-in-pool' ? { mode: 'vanilla' } : setting) as WalletSetting };
  return { ...profile, [family]: setting };
};

export { applyRowChange };
