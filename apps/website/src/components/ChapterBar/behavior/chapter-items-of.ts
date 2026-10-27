/* @layer website-site @kind logic */
import type { HeaderAnchorNavItem } from '@drizztdourden08/tessera/composites';
import type { FeatureGroup } from '../../../features';

const chapterItemsOf = (groups: readonly FeatureGroup[]): HeaderAnchorNavItem[] =>
  groups.map((group) => ({ id: group.id, label: `${group.numeral} · ${group.short}` }));

export { chapterItemsOf };
