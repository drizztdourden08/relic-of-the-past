/* @layer renderer-widgets @kind logic */
import { acceptAllCertain } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import { acceptRecommendation } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-recommendation';
import type { BatchResult } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import type { InspectorRow } from '@app/ui/domains/app/views/DataInspector/DataInspector.type';
import type { Recommendation } from '@shared/game/recommendations';

const acceptAllCertainHere = (entries: readonly Recommendation[]): Promise<BatchResult> =>
  acceptAllCertain(entries, entry => acceptRecommendation(entry, entry.proposed as InspectorRow));

export { acceptAllCertainHere };
