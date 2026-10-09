/* @layer renderer-components @kind types */
import type { Occurrence } from '@rotp/languages';

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
