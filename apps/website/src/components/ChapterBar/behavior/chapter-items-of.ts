/* @layer website-site @kind logic */
import type { AnchorPillItem } from '../../../design';
import type { FeatureGroup } from '../../../features';

const chapterItemsOf = (groups: readonly FeatureGroup[]): AnchorPillItem[] =>
  groups.map((group) => ({ id: group.id, label: `${group.numeral} · ${group.short}` }));

export { chapterItemsOf };
