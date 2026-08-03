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
 */
import type { Recommendation } from '@shared/game/recommendations';
import type { AcceptOutcome } from './accept-recommendation';

interface BatchResult {
  accepted: number;
  /** Every entry whose write was refused, with the reason it gave. */
  failures: readonly { id: string; error: string }[];
}

const FAILED = 'The write failed.';

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
  let accepted = 0;

  for (const entry of certainOnly(entries)) {
    const outcome = await accept(entry);
    if (outcome.success) accepted += 1;
    else failures.push({ id: entry.id, error: outcome.error ?? FAILED });
  }

  return { accepted, failures };
};

export { acceptAllCertain, certainOnly };
export type { BatchResult };
