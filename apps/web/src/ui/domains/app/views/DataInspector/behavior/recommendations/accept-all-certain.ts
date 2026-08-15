/* @layer renderer-app @kind logic */
/**
 * "Accept every certain finding in what I am looking at."
 *
 * Strictly sequential, and that is the whole point of the file. Two findings
 * routinely land in the SAME dataset source file — two connections leaving one
 * screen, two tags in one namespace — and each write is a read-modify-write of
 * that file. Fired concurrently, the second one's read would predate the first
 * one's write and the file would come out holding only one of the two edits.
 * Awaiting each in turn is what makes a batch equivalent to accepting each
 * entry by hand, one after the other.
 *
 * `certain` is the gate because `likely` means the evidence only ever proved
 * presence (see the note on `Confidence`), and nothing inferred that way should
 * be written to the dataset without somebody looking at it.
 *
 * A `connection` create is the sharpest version of the same hazard: it mints
 * TWO records (see `create-connection.ts`) through one main-process allocator
 * turn, and a batch routinely holds several. Nothing here needs to special-case
 * that — the same strict sequencing that protects a shared file already means
 * one pair's allocate-and-write finishes before the next entry's begins, so
 * pairs from the same batch can never interleave their ids or their writes.
 */
import type { Recommendation } from '@shared/game/recommendations';
import type { AcceptOutcome } from './accept-recommendation';

interface BatchResult {
  accepted: number;
  /**
   * Every entry the run passed over because its proposal is incomplete rather
   * than wrong — nothing was attempted, so these are not failures. Filling one
   * in is a per-entry job for a person, which is the one thing a batch cannot do.
   */
  skipped: readonly { id: string; reason: string }[];
  /** Every entry whose write was refused, with the reason it gave. */
  failures: readonly { id: string; error: string }[];
}


const certainOnly = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.confidence === 'certain' && entry.state === 'open');

/**
 * A failure does not stop the run: the remaining findings are independent, and
 * abandoning them because one collection has no write path would make the
 * button's outcome depend on list order.
 */
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
