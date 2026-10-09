/* @layer renderer-components @kind types */
import type { TextGroup, TextGroupId } from '@shared/game/language';

type TextGroupsState = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  values: Record<string, string>;
  selectGroup: (id: TextGroupId) => void;
  setValue: (key: string, value: string) => void;
};

export type { TextGroupsState };
