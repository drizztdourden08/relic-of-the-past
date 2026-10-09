/* @layer renderer-components @kind types */
import type { TextGroup, TextGroupId } from '@shared/game/language';

type TextGroupRailItemProps = {
  group: TextGroup;
  translated: number;
  showTally: boolean;
  selected: boolean;
  onSelect: (id: TextGroupId) => void;
};

export type { TextGroupRailItemProps };
