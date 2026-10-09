/* @layer renderer-components @kind types */
import type { TextGroup, TextGroupId } from '@shared/game/language';

type TextGroupRailProps = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  values: Record<string, string>;
  onSelectGroup: (id: TextGroupId) => void;
};

export type { TextGroupRailProps };
