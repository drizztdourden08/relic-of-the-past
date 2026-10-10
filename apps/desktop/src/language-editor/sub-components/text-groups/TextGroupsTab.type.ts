/* @layer renderer-components @kind types */
import type { TextGroup, TextGroupId } from '@rotp/languages';

type TextGroupsTabProps = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  values: Record<string, string>;
  readOnly?: boolean;
  onSelectGroup: (id: TextGroupId) => void;
  onChangeValue: (key: string, value: string) => void;
};

export type { TextGroupsTabProps };
