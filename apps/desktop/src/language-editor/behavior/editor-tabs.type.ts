/* @layer renderer-components @kind types */
import type { TextGroup } from '@rotp/languages';

type EditorTabsParams = {
  dialogueCount: number;
  variableCount: number;
  groups: TextGroup[];
};

export type { EditorTabsParams };
