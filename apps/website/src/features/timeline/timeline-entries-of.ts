/* @layer website-site @kind logic */
import type { FeatureGroup } from '../feature-group.type';
import type { TimelineEntry } from './timeline-entry.type';

const timelineEntriesOf = (groups: readonly FeatureGroup[]): TimelineEntry[] =>
  groups.map((group) => ({
    id: group.id,
    label: group.short,
    marker: group.numeral,
    children: group.features.map((feature, index) => ({
      id: feature.id,
      label: feature.short,
      marker: `${group.numeral}.${index + 1}`,
    })),
  }));

export { timelineEntriesOf };
