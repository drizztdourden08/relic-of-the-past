/* @layer renderer-components @kind types */
import type { ProgressVariant } from '@ds/primitives';

type SlotFit = {
  used: number;
  max: number;
  variant: ProgressVariant;
  readout: string;
  detail: string;
};

type SlotFilter = {
  query: string;
  untranslatedOnly: boolean;
};

type GroupTally = {
  translated: number;
  total: number;
  known: boolean;
};

export type { GroupTally, SlotFilter, SlotFit };
