/* @layer renderer-lib @kind logic */
/**
 * A family setting → everything its panel row renders: the plan (through
 * the shared derivation, never re-implemented), the formatted ladder
 * preview for the mode, the In Pool cell, the count floor and ceiling, the curve
 * dropdown entries, the free-sequence verdict and the pickup bonus. Labels
 * are the words the game itself uses for each family.
 */
import {
  CURVE_IDS, CURVE_LABELS, METER_LEVEL_LABELS, NO_WALLET_FLOOR, capacityBonusBaseKeyOf, capacityFieldsOf,
  capacityKeyOf, defaultFamilyBonus, freeSequenceProblem, ladderClamps, maxFloorReasonOf, maxRungFloorOf,
  minCountFor, planOf,
} from '@shared/randomizer/ap-world/capacity';
import { apOptionByKey } from '@shared/randomizer/ap-world/options.data';
import { offeredPresetsOf, rowStateOf } from './capacity-row-state';
import { familyImpactCell } from './impact-cell';
import type { SelectGroup } from '@ds/primitives';
import type {
  CapacityFamily, CapacityFamilyId, FamilyBonus, FamilyPlan, FamilySetting, WalletFloor,
} from '@shared/randomizer/ap-world/capacity';
import type { OptionDescription } from '@shared/randomizer/ap-world/option-description.type';
import type { CapacityRowModel } from '@domains/app/compounds/CapacityFamilyRow';
import type { LadderPreviewProps } from '@domains/app/compounds/LadderPreview';

const plural = (count: number, unit: string): string => `+${count} ${unit}${count === 1 ? '' : 's'}`;

const FAMILY_LABEL: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'Bombs',
  projectiles: 'Arrows',
  meter: 'Magic Meter',
  wallet: 'Wallet (Rupees)',
};

/**
 * What the family's modes do, taken from that family's own catalog row rather
 * than written a second time here, so the family row explains its dropdown
 * in exactly the words the plain option rows and the Run tab use.
 */
const captionOf = (id: CapacityFamilyId): OptionDescription | undefined => {
  const option = apOptionByKey.get(capacityKeyOf(id, 'mode'));
  return option === undefined ? undefined : option.details ?? option.description;
};

/** The bonus base switch's own clarifier: what the percentage is of. */
const bonusCaptionOf = (id: CapacityFamilyId): string | undefined =>
  apOptionByKey.get(capacityBonusBaseKeyOf(id))?.description;

const JUMP_LABEL: Readonly<Record<CapacityFamilyId, (jump: number) => string>> = {
  explosives: (jump) => plural(jump, 'tier'),
  projectiles: (jump) => plural(jump, 'tier'),
  meter: (jump) => plural(jump, 'tier'),
  wallet: (jump) => `+${jump * 100}`,
};

const VANILLA_NOTE: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'sold at the pond',
  projectiles: 'sold at the pond',
  meter: 'given by the bat',
  wallet: 'no upgrades',
};

const stopsOf = (capacityFamily: CapacityFamily): readonly string[] =>
  capacityFamily.id === 'meter' ? METER_LEVEL_LABELS : capacityFamily.ladder.map(String);

const PROGRESSIVE_NOTE = 'pickups climb in this order';

const previewOf = (capacityFamily: CapacityFamily, setting: FamilySetting, plan: FamilyPlan): LadderPreviewProps => {
  const stops = stopsOf(capacityFamily);
  const chipsOf = (ladder: readonly number[]) => ladder.map((value) => stops[capacityFamily.indexOf(value)]);
  const jumpsOf = (jumps: readonly number[]) => jumps.map(JUMP_LABEL[capacityFamily.id]);
  if (setting.mode === 'vanilla') {
    // The game's own ladder is exactly what "in pool" would ship as items: walk it, not the whole grid.
    const native = planOf(capacityFamily, { mode: 'vanilla-in-pool' });
    return { chips: chipsOf(native.ladder), jumps: jumpsOf(native.jumps), dim: true, note: VANILLA_NOTE[capacityFamily.id] };
  }
  const startIndex = setting.mode === 'custom' ? capacityFamily.indexOf(setting.start) : 0;
  const surplus = ladderClamps(capacityFamily.ladder, startIndex, plan.jumps);
  const count = plan.items.length;
  const note = setting.mode === 'vanilla-in-pool'
    ? `${count} upgrade item${count === 1 ? '' : 's'} to find`
    : plan.progressive && count > 0 ? PROGRESSIVE_NOTE : undefined;
  return { chips: chipsOf(plan.ladder), jumps: jumpsOf(plan.jumps), surplus, ordered: plan.progressive, note };
};

const curveOptionsOf = (capacityFamily: CapacityFamily): readonly SelectGroup[] => [
  {
    label: 'Curves',
    options: [...CURVE_IDS, 'free' as const].map((curve) => ({ value: curve, label: CURVE_LABELS[curve] })),
  },
  {
    label: 'Presets',
    options: offeredPresetsOf(capacityFamily).map((preset) => ({ value: `preset:${preset.id}`, label: `Preset · ${preset.label}` })),
  },
];

/**
 * Where the family's final max may not stop below, said as one line: what
 * asks for it and the rung that holds it. Only a Custom row can be set under
 * a floor, so only a Custom row is told about it.
 */
const floorNoteOf = (
  capacityFamily: CapacityFamily, setting: FamilySetting, walletFloor: WalletFloor,
): string | undefined => {
  if (setting.mode !== 'custom') return undefined;
  const reason = maxFloorReasonOf(capacityFamily, walletFloor);
  if (reason === undefined) return undefined;
  const floor = capacityFamily.ladder[maxRungFloorOf(capacityFamily, walletFloor)];
  return `${reason}, so the final max stops no lower than ${floor}`;
};

interface CapacityRowInput {
  family: CapacityFamily;
  setting: FamilySetting;
  /** The filler still in the pool (null when the pool could not be built). */
  fillerHeadroom: number | null;
  /** Pickups climb the ladder in order. */
  progressive?: boolean;
  /** The sentence a sibling setting put on this family's card; the row renders inert with it in red. */
  forced?: string;
  /** What these settings let the seed charge at once: the one thing that moves the wallet's own floor. */
  walletFloor?: WalletFloor;
  /** What a pickup of this family hands over beside its ceiling. */
  bonus?: FamilyBonus;
}

/**
 * The wallet has no spot to hand a location back, so its items only ever
 * displace filler and its count stops where the filler runs out. The bonus is
 * shown whenever the family hands out upgrade items, which Vanilla never does.
 */
const capacityRowModelOf = (input: CapacityRowInput): CapacityRowModel => {
  const { family: capacityFamily, setting, fillerHeadroom, progressive = false, forced, walletFloor = NO_WALLET_FLOOR } = input;
  const { id, maxJump } = capacityFamily;
  const plan = planOf(capacityFamily, setting, progressive);
  const state = rowStateOf(capacityFamily, setting);
  const span = state.range[1] - state.range[0];
  const minCount = Math.max(1, minCountFor(span, maxJump));
  const inPool = plan.items.length;
  const headroom = id === 'wallet' && fillerHeadroom !== null ? inPool + fillerHeadroom : span;
  const isWallet = id === 'wallet';
  return {
    id,
    label: FAMILY_LABEL[id],
    caption: captionOf(id),
    stops: stopsOf(capacityFamily),
    offersInPool: !isWallet,
    hasCurve: capacityFieldsOf(id).includes('curve'),
    rangeStep: isWallet ? 10 : 1,
    labelEvery: isWallet ? 10 : 1,
    state,
    span,
    minCount,
    maxCount: Math.max(minCount, Math.min(span, headroom)),
    maxJump,
    curveOptions: curveOptionsOf(capacityFamily),
    preview: previewOf(capacityFamily, setting, plan),
    impact: familyImpactCell(plan.spotIsCheck, inPool),
    problem: setting.mode === 'custom' && setting.shape.curve === 'free'
      ? freeSequenceProblem(setting.shape.jumps, span, maxJump)
      : undefined,
    footnote: isWallet && setting.mode === 'custom' ? 'turns "Carry more rupees" on for this profile' : undefined,
    floorNote: floorNoteOf(capacityFamily, setting, walletFloor),
    bonus: setting.mode === 'vanilla' ? undefined : input.bonus ?? defaultFamilyBonus(id),
    bonusCaption: bonusCaptionOf(id),
    forced,
  };
};

export { capacityRowModelOf };
export type { CapacityRowInput };
