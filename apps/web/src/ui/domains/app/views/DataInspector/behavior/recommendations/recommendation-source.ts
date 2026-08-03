/* @layer renderer-app @kind logic */
/**
 * The recommendations pseudo-collection expressed as the same
 * `CollectionSource` the eleven real ones implement, so the existing generic
 * table renders it with nothing added: rows and a schema are the whole contract.
 *
 * It deliberately declares no `serialize` and no `onSave`. A finding is not a
 * record — there is no emitter that writes one to the dataset and no file it
 * belongs in — and the writing that a finding leads to happens to the record it
 * PROPOSES, through that collection's own writer (see accept-recommendation.ts).
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

/**
 * Built per entry list rather than cached like the real collections: those read
 * a dataset that only a write changes, this one re-reads whenever a pass or a
 * verdict lands, which is exactly when the rows have to change.
 */
const recommendationSource = (entries: readonly Recommendation[]): InspectorSource => ({
  id: RECOMMENDATIONS_KIND,
  label: RECOMMENDATIONS_NAV_ITEM.label,
  rows: recommendationRows(entries) as readonly unknown[] as readonly InspectorRow[],
  getId: row => String(row.id),
  config: RECOMMENDATION_SCHEMA,
});

export { RECOMMENDATION_GROUP_BY, RECOMMENDATION_SCHEMA, recommendationSource };
