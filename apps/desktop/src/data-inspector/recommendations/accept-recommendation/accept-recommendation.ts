/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import { decideRecommendation } from '../recommendation-cache';
import type { AcceptOutcome } from '../recommendations.type';
import { applyTo } from './apply-to';
import { threw } from './threw';

const acceptRecommendation = async (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  let outcome: AcceptOutcome;
  try {
    outcome = await applyTo(entry, proposed);
  } catch (error: unknown) {
    outcome = threw(error);
  }
  if (!outcome.success) return outcome;

  await decideRecommendation(entry.kind, entry.id, 'accepted');
  return outcome;
};

export { acceptRecommendation };
