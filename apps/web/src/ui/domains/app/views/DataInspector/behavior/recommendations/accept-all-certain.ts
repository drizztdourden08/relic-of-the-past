/* @layer renderer-app @kind logic */
/**
 * Strictly sequential on purpose. Two findings routinely land in the same
 * dataset source file, and each write is a read-modify-write of that file;
 * fired concurrently, the file would come out holding only one edit. The same
 * sequencing keeps `connection` pairs (two records per create, see
 * `create-connection.ts`) from interleaving their ids or writes.
 *
 * `certain` is the gate: `likely` only ever proved presence (see `Confidence`)
 * and should not be written without somebody looking at it.
 */
import type { Recommendation } from '@shared/game/recommendations';
import type { AcceptOutcome } from './accept-recommendation';

interface BatchResult {
  accepted: number;
  /**
   * Every entry the run passed over because its proposal is incomplete, not
   * wrong. Nothing was attempted, so these are not failures. Filling one in is a
   * per-entry job for a person, which is the one thing a batch cannot do.
   */
  skipped: readonly { id: string; reason: string }[];
  /** Every entry whose write was refused, with the reason it gave. */
  failures: readonly { id: string; error: string }[];
}


const certainOnly = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.confidence === 'certain' && entry.state === 'open');

/** A failure does not stop the run; stopping would make the outcome depend on list order. */
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

export { acceptAllCertain, certainOnly };
export type { BatchResult };
