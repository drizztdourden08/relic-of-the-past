/* @layer renderer-components @kind types */
import type { TextGroup, TextGroupId } from '@rotp/languages';

type TextGroupsState = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  values: Record<string, string>;
  selectGroup: (id: TextGroupId) => void;
  setValue: (key: string, value: string) => void;
};

export type { TextGroupsState };
