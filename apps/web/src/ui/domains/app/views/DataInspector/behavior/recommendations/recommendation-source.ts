/* @layer renderer-app @kind logic */
/**
 * The recommendations pseudo-collection as a `CollectionSource`, so the generic
 * table renders it with nothing added. No `serialize` and no `onSave` on
 * purpose: a finding is not a record, and the write it leads to happens to the
 * record it proposes, through that collection's writer (accept-recommendation.ts).
 */
import { RECOMMENDATIONS_KIND, RECOMMENDATIONS_NAV_ITEM } from '../../DataInspector.constants';
import { recommendationRows } from './recommendation-rows';
import type { SchemaConfig } from '@ds/data';
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';

/** The table opens grouped by which collection each finding is about. */
const RECOMMENDATION_GROUP_BY: readonly string[] = ['kind'];

const RECOMMENDATION_SCHEMA: SchemaConfig = {
  order: ['kind', 'action', 'targetId', 'reason', 'confidence', 'screenId', 'firstSeenAt'],
  labels: {
    kind: 'Collection',
    action: 'Action',
    targetId: 'Target',
    reason: 'Reason',
    confidence: 'Confidence',
    screenId: 'Screen',
    firstSeenAt: 'First seen',
  },
  hidden: ['id'],
  defaultColumns: ['kind', 'action', 'targetId', 'reason', 'confidence', 'screenId', 'firstSeenAt'],
};

/** Built per entry list, not cached: the rows change whenever a pass or a verdict lands. */
const recommendationSource = (entries: readonly Recommendation[]): InspectorSource => ({
  id: RECOMMENDATIONS_KIND,
  label: RECOMMENDATIONS_NAV_ITEM.label,
  rows: recommendationRows(entries) as readonly unknown[] as readonly InspectorRow[],
  getId: row => String(row.id),
  config: RECOMMENDATION_SCHEMA,
});

export { RECOMMENDATION_GROUP_BY, RECOMMENDATION_SCHEMA, recommendationSource };
