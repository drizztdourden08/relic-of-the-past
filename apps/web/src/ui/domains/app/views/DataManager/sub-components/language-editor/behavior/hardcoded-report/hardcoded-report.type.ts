/* @layer renderer-components @kind types */
import type { Occurrence } from '@shared/game/language';

type HardcodedGroup = {
  variableKey: string;
  label: string;
  text: string;
  exists: boolean;
  exact: Occurrence[];
  caseMisses: number;
  entryCount: number;
};

export type { HardcodedGroup };
