/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import { RECOMMENDATIONS_KIND, RECOMMENDATIONS_NAV_ITEM } from '../../../DataInspector.constants';
import type { InspectorRow, InspectorSource } from '../../../DataInspector.type';
import { recommendationRows } from '../recommendation-rows';
import { RECOMMENDATION_SCHEMA } from '../recommendations.constants';

const recommendationSource = (entries: readonly Recommendation[]): InspectorSource => ({
  id: RECOMMENDATIONS_KIND,
  label: RECOMMENDATIONS_NAV_ITEM.label,
  rows: recommendationRows(entries) as readonly unknown[] as readonly InspectorRow[],
  getId: row => String(row.id),
  config: RECOMMENDATION_SCHEMA,
});

export { recommendationSource };
