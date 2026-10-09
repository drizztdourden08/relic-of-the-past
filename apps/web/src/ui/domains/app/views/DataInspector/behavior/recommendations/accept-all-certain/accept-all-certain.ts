/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { AcceptOutcome, BatchResult } from '../recommendations.type';
import { certainOnly } from './certain-only';

const acceptAllCertain = async (
  entries: readonly Recommendation[],
  accept: (entry: Recommendation) => Promise<AcceptOutcome>,
): Promise<BatchResult> => {
  const failures: { id: string; error: string }[] = [];
  const skipped: { id: string; reason: string }[] = [];
  let accepted = 0;

  for (const entry of certainOnly(entries)) {
    const outcome = await accept(entry);
    if (outcome.success) { accepted += 1; continue; }
    if (outcome.reason === 'needs-form') skipped.push({ id: entry.id, reason: outcome.error });
    else failures.push({ id: entry.id, error: outcome.error });
  }

  return { accepted, skipped, failures };
};

export { acceptAllCertain };
