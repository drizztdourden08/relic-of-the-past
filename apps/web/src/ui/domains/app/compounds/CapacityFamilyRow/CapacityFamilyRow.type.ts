/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { SelectGroup } from '@drizztdourden08/tessera/primitives';
import type { CapacityFamilyId, CapacityMode, CurveId, FamilyBonus } from '@shared/randomizer/world/capacity';
import type { CurvePresetId } from '@shared/randomizer/world/capacity';
import type { OptionDescription } from '@shared/randomizer/world/option-description.type';
import type { LadderPreviewProps } from '../LadderPreview';
import type { ImpactCell } from '../PoolImpactCell';

type CurveChoice = CurveId | 'free' | `preset:${CurvePresetId}`;

interface CapacityRowState {
  mode: CapacityMode;
  range: readonly [number, number];
  count: number;
  curve: CurveChoice;
  jumps: readonly number[];
}

interface CapacityRowModel {
  id: CapacityFamilyId;
  label: string;
  caption?: OptionDescription;
  stops: readonly string[];
  offersInPool: boolean;
  hasCurve: boolean;
  rangeStep: number;
  labelEvery: number;
  state: CapacityRowState;
  span: number;
  minCount: number;
  maxCount: number;
  maxJump: number;
  curveOptions: readonly SelectGroup[];
  preview: LadderPreviewProps;
  impact: ImpactCell;
  problem?: string;
  footnote?: string;
  floorNote?: string;
  bonus?: FamilyBonus;
  bonusCaption?: string;
  forced?: string;
}

interface CapacityFamilyRowProps {
  model: CapacityRowModel;
  readOnly?: boolean;
  readout?: boolean;
  onChange?: (next: CapacityRowState) => void;
  onBonusChange?: (next: FamilyBonus) => void;
}

interface LadderControlsProps {
  model: CapacityRowModel;
  readOnly: boolean;
  readout?: boolean;
  onChange: (part: Partial<CapacityRowState>) => void;
}

interface LadderReadoutProps {
  model: CapacityRowModel;
}

interface BonusLineProps {
  bonus: FamilyBonus;
  caption?: string;
  readOnly: boolean;
  readout?: boolean;
  onChange?: (next: FamilyBonus) => void;
}

interface RowLineProps {
  label: string;
  children: ReactNode;
  note?: string;
  className?: string;
}

export type {
  BonusLineProps, CapacityFamilyRowProps, CapacityRowModel, CapacityRowState, CurveChoice, LadderControlsProps,
  LadderReadoutProps, RowLineProps,
};
