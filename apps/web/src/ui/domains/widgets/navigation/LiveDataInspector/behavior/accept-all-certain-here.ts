/* @layer renderer-widgets @kind logic */
/**
 * "Accept every certain finding on this screen" — a thin wrapper, not a
 * reimplementation. `acceptAllCertain` (the Data Inspector's own batch
 * runner) is already a generic function over `entries` + an `accept`
 * callback with no page state behind it, so this only supplies that
 * callback: `entry.proposed` unedited, since the widget's cards never open a
 * draft the way the comparison view's `ProposalForm` does.
 */
import { acceptAllCertain } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import { acceptRecommendation } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-recommendation';
import type { BatchResult } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import type { InspectorRow } from '@app/ui/domains/app/views/DataInspector/DataInspector.type';
import type { Recommendation } from '@shared/game/recommendations';

const acceptAllCertainHere = (entries: readonly Recommendation[]): Promise<BatchResult> =>
  acceptAllCertain(entries, entry => acceptRecommendation(entry, entry.proposed as InspectorRow));

export { acceptAllCertainHere };
