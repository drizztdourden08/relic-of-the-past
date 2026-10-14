/* @layer renderer-widgets @kind logic */
import { acceptAllCertain } from '@app/data-inspector/recommendations/accept-all-certain';
import { acceptRecommendation } from '@app/data-inspector/recommendations/accept-recommendation';
import type { BatchResult } from '@app/data-inspector/recommendations/accept-all-certain';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import type { Recommendation } from '@rotp/navigation';

const acceptAllCertainHere = (entries: readonly Recommendation[]): Promise<BatchResult> =>
  acceptAllCertain(entries, entry => acceptRecommendation(entry, entry.proposed as InspectorRow));

export { acceptAllCertainHere };
