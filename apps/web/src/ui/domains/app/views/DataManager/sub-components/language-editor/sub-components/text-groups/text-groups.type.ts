/* @layer renderer-components @kind types */
import type { ProgressTone } from '@drizztdourden08/tessera/primitives';

type SlotFit = {
  used: number;
  max: number;
  variant: ProgressTone;
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
