/* @layer website-site @kind logic */
import type { ScrollRailMark } from '../../../design';
import type { FeatureGroup } from '../../../features';

const railMarksOf = (groups: readonly FeatureGroup[]): ScrollRailMark[] =>
  groups.map((group) => ({ id: group.id, label: group.numeral, name: `${group.numeral} · ${group.short}` }));

export { railMarksOf };
