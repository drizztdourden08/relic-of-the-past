/* @layer renderer-lib @kind logic */
import { NO_WALLET_FLOOR, clampCount, heldMaxRungOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilySetting, WalletFloor } from '@rotp/randomizer';
import type { CapacityRowState } from '@app/compounds/CapacityFamilyRow';
import { isPresetChoice } from './is-preset-choice';
import { presetOfChoice } from './preset-of-choice';

const settingOfRowState = (
  capacityFamily: CapacityFamily, state: CapacityRowState, walletFloor: WalletFloor = NO_WALLET_FLOOR,
): FamilySetting => {
  if (state.mode !== 'custom') return { mode: state.mode };
  const high = heldMaxRungOf(capacityFamily, state.range[1], walletFloor);
  const low = Math.min(state.range[0], high);
  const span = high - low;
  const base = { mode: 'custom' as const, start: capacityFamily.ladder[low], max: capacityFamily.ladder[high] };
  if (state.curve === 'free') {
    return { ...base, count: state.jumps.length, shape: { curve: 'free', jumps: state.jumps } };
  }
  if (isPresetChoice(state.curve)) {
    const preset = presetOfChoice(state.curve);
    return { ...base, count: clampCount(preset.countFor(span), Math.max(1, span), capacityFamily.maxJump), shape: { curve: preset.curve } };
  }
  return { ...base, count: clampCount(state.count, Math.max(1, span), capacityFamily.maxJump), shape: { curve: state.curve } };
};

export { settingOfRowState };
