/* @layer renderer-widgets @kind types */
import type { BottleContentsValue, CapacityKind } from '@app/game';
import type { ChoiceTone } from '../../sub-components/ChoicePopover.type';

type CounterKind = 'rupees' | 'bombs' | 'arrows' | 'keys';

type CounterSpec = {
  kind: CounterKind;
  label: string;
  iconWidth: 8 | 16;
  digits: number;
  steps: readonly number[];
  capacity?: CapacityKind;
};

type BottleSlot = 0 | 1 | 2 | 3;

type BottleOption = {
  value: BottleContentsValue;
  label: string;
  tone: ChoiceTone;
};

type OpenBottle = { slot: BottleSlot; anchor: HTMLElement };

type HeartWrite = {
  health?: number;
  capacity?: number;
};

type HeartButton = 0 | 2;

type NumberEditParams = {
  value: number;
  min: number;
  max: number;
  write: (next: number) => void;
  ladder?: readonly number[];
};

type HudPieceProps = {
  scale: number;
  spritesBase: string;
};

type CounterEditorProps = HudPieceProps & {
  spec: CounterSpec;
};

type MagicLevelBarProps = {
  scale: number;
};

type NumberCellProps = HudPieceProps & {
  label: string;
  value: number;
  min?: number;
  max: number;
  digits: number;
  isMax?: boolean;
  write?: (next: number) => void;
  steps?: readonly number[];
  ladder?: readonly number[];
  lockedReason?: string;
};

export type {
  BottleOption, BottleSlot, CounterEditorProps, CounterKind, CounterSpec, HeartButton, HeartWrite, HudPieceProps, MagicLevelBarProps,
  NumberCellProps, NumberEditParams, OpenBottle,
};
