/* @layer renderer-lib @kind logic */
/**
 * The row's state model ⇄ a family setting. The row works in ladder indexes
 * and dropdown choices (a preset is a choice of its own); the setting is what
 * the snapshot stores. A preset choice writes curve + count and nothing
 * else, and reads back as the preset whenever (curve, count) still equals
 * what it would write — editing either detaches it.
 */
import {
  CURVE_PRESETS, FAMILIES, NO_WALLET_FLOOR, capacityFieldsOf, clampCount, heldMaxRungOf, maxSpanOf, planOf,
  presetMatching,
} from '@shared/randomizer/ap-world/capacity';
import type {
  CapacityFamily, CapacityFamilyId, CapacityProfile, CurvePreset, CurvePresetId, CustomFamilySetting, FamilySetting,
  WalletFloor, WalletSetting,
} from '@shared/randomizer/ap-world/capacity';
import type { CapacityRowState, CurveChoice } from '@domains/app/compounds/CapacityFamilyRow';

/** The wallet has no reference ladder, so the Reference preset is not offered there. */
const hiddenPresetsOf = (capacityFamily: CapacityFamily): readonly CurvePresetId[] =>
  capacityFamily.id === 'wallet' ? ['reference'] : [];

const offeredPresetsOf = (capacityFamily: CapacityFamily) =>
  CURVE_PRESETS.filter((preset) => !hiddenPresetsOf(capacityFamily).includes(preset.id));

const isPresetChoice = (curve: CurveChoice): curve is `preset:${CurvePresetId}` => curve.startsWith('preset:');

const presetOfChoice = (choice: `preset:${CurvePresetId}`): CurvePreset => {
  const id = choice.slice('preset:'.length) as CurvePresetId;
  return CURVE_PRESETS.find((candidate) => candidate.id === id) ?? CURVE_PRESETS[0];
};

/**
 * The Custom values a family starts from when its mode is switched to Custom:
 * the vanilla rung up to the top of the ladder, so switching modes changes
 * nothing until a thumb moves. The empty rung below stays one drag away.
 */
const customDefaultOf = (capacityFamily: CapacityFamily): CustomFamilySetting => {
  const { ladder, defaultCount, vanillaRung } = capacityFamily;
  return {
    mode: 'custom',
    start: ladder[vanillaRung],
    max: ladder[ladder.length - 1],
    count: Math.min(defaultCount, maxSpanOf(capacityFamily) - vanillaRung),
    shape: { curve: 'equal' },
  };
};

const curveChoiceOf = (capacityFamily: CapacityFamily, setting: CustomFamilySetting, span: number): CurveChoice => {
  // A family without a curve row (the meter) has no dropdown, so no preset to name.
  if (!capacityFieldsOf(capacityFamily.id).includes('curve')) return 'equal';
  if (setting.shape.curve === 'free') return 'free';
  const preset = presetMatching(setting.shape.curve, setting.count, span);
  if (preset !== undefined && !hiddenPresetsOf(capacityFamily).includes(preset.id)) return `preset:${preset.id}`;
  return setting.shape.curve;
};

const rowStateOf = (capacityFamily: CapacityFamily, setting: FamilySetting): CapacityRowState => {
  const custom = setting.mode === 'custom' ? setting : customDefaultOf(capacityFamily);
  const range: readonly [number, number] = [capacityFamily.indexOf(custom.start), capacityFamily.indexOf(custom.max)];
  return {
    mode: setting.mode,
    range,
    count: custom.count,
    curve: curveChoiceOf(capacityFamily, custom, range[1] - range[0]),
    jumps: custom.shape.curve === 'free' ? custom.shape.jumps : [],
  };
};

/**
 * The final max may not stop below the family's floor (capacity/max-floor.ts:
 * the projectiles must hold the ending's silver shots, the wallet whatever
 * these settings let the seed charge at once), so a thumb dragged under it
 * snaps back onto it and the start follows if it sat above.
 */
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

/**
 * A preset choice is an instruction only when it is new. The row hands back
 * the reading it was given with one part changed, so a preset that already
 * named the current (curve, count) is that reading, not a pick: the edit is
 * to the range or the count, and it goes through as the plain curve with the
 * count as edited. Only a freshly chosen preset writes its own count.
 */
const detachedFromReading = (
  capacityFamily: CapacityFamily, current: FamilySetting, next: CapacityRowState,
): CapacityRowState => {
  if (!isPresetChoice(next.curve) || rowStateOf(capacityFamily, current).curve !== next.curve) return next;
  return { ...next, curve: presetOfChoice(next.curve).curve };
};

/**
 * One row edit applied to the profile. Switching the curve to "free" seeds
 * the chips from the jumps the current curve produces, so the editor starts
 * from a valid sequence rather than from nothing.
 */
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

export { applyRowChange, customDefaultOf, offeredPresetsOf, rowStateOf, settingOfRowState };
