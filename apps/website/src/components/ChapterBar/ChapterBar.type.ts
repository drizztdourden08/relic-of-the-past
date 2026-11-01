/* @layer website-site @kind types */
import type { FeatureGroup } from '../../features';

type ChapterBarProps = {
  groups: readonly FeatureGroup[];
  activeGroupId: string | null;
  onSelect: (id: string) => void;
};

export type { ChapterBarProps };
