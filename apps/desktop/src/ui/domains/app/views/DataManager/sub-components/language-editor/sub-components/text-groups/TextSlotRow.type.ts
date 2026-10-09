/* @layer renderer-components @kind types */
import type { TextSlot } from '@rotp/languages';

type TextSlotRowProps = {
  slot: TextSlot;
  value: string;
  readOnly?: boolean;
  onChangeValue: (key: string, value: string) => void;
};

export type { TextSlotRowProps };
