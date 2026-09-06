/* @layer renderer-components @kind types */
import type { SelectGroup } from '@ds/primitives';
import type { CapacityFamilyId, CapacityMode, CurveId, FamilyBonus } from '@shared/randomizer/ap-world/capacity';
import type { CurvePresetId } from '@shared/randomizer/ap-world/capacity';
import type { OptionDescription } from '@shared/randomizer/ap-world/option-description.type';
import type { LadderPreviewProps } from '../LadderPreview';
import type { ImpactCell } from '../PoolImpactCell';

/** What the curve dropdown holds: a generator, the free sequence, or a named preset. */
type CurveChoice = CurveId | 'free' | `preset:${CurvePresetId}`;

/** The row's own shape of a family setting: indexes and choices, never ladder values. */
interface CapacityRowState {
  mode: CapacityMode;
  /** Ladder indexes of the starting max and the final max; start ≤ max. */
  range: readonly [number, number];
  count: number;
  curve: CurveChoice;
  /** The free sequence, read while `curve` is 'free'. */
  jumps: readonly number[];
}

/** Everything one row renders, derived by the view tier from the family and its setting. */
interface CapacityRowModel {
  id: CapacityFamilyId;
  /** The family in the game's own words. */
  label: string;
  /**
   * What the family does, under its name: one sentence, or a line per mode.
   * Same shape and same presentation as a plain option row's description.
   */
  caption?: OptionDescription;
  /** The family's legal tiers, formatted, in ladder order. */
  stops: readonly string[];
  /** The wallet has no vanilla upgrades to pool. */
  offersInPool: boolean;
  /** The meter's curve is fixed: no curve dropdown. */
  hasCurve: boolean;
  /** Keyboard stride of the range thumbs, in stops. */
  rangeStep: number;
  /** Tick label cadence of the range, in stops. */
  labelEvery: number;
  state: CapacityRowState;
  /** Ladder steps between start and max. */
  span: number;
  /** The smallest count that covers the span: no item carries more than `maxJump` steps. */
  minCount: number;
  /** The largest count the pool can carry for this family right now. */
  maxCount: number;
  /** The most steps one item of this family carries: the cap on every jump. */
  maxJump: number;
  curveOptions: readonly SelectGroup[];
  preview: LadderPreviewProps;
  /** The In Pool cell: the spot that becomes a check and the upgrade items. */
  impact: ImpactCell;
  /** Why the free sequence is rejected; undefined while it is exact. */
  problem?: string;
  /** A consequence worth stating under the row. */
  footnote?: string;
  /**
   * Where the final max may not stop below, and what asks for it. Printed
   * under the range so a thumb that snaps back is never a mystery.
   */
  floorNote?: string;
  /**
   * What a pickup of this family hands over beside its ceiling. Absent in
   * Vanilla, where the family hands out no upgrade item at all.
   */
  bonus?: FamilyBonus;
  /** The catalog's clarifier for the bonus base switch: what the percentage is of. */
  bonusCaption?: string;
  /**
   * Why the row is not the player's to set right now, said by the sibling
   * setting that decided it. Present, the row renders inert with the
   * sentence in red; the stored setting waits underneath.
   */
  forced?: string;
}

interface CapacityFamilyRowProps {
  model: CapacityRowModel;
  /** The Run tab: every control disabled, the preview and readouts kept. */
  readOnly?: boolean;
  onChange?: (next: CapacityRowState) => void;
  onBonusChange?: (next: FamilyBonus) => void;
}

export type { CapacityFamilyRowProps, CapacityRowModel, CapacityRowState, CurveChoice };
