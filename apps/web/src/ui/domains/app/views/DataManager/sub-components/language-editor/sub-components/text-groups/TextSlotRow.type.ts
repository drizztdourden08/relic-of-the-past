/* @layer renderer-components @kind types */
import type { TextSlot } from '@shared/game/language';

type TextSlotRowProps = {
  slot: TextSlot;
  value: string;
  readOnly?: boolean;
  onChangeValue: (key: string, value: string) => void;
};

export type { TextSlotRowProps };
