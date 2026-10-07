/* @layer shared-game @kind types */
/**
 * What a person has looked at, recorded ON the record and carried in its own
 * file, so the mark travels with the data instead of sitting in one machine's
 * app folder.
 *
 * It GATES NOTHING. No generation, no report, no seed reads it to decide
 * anything: a mark says what was examined and by what means, and a record with
 * no mark reads as untouched, which is why the field is optional and an
 * `untouched` mark is never written out.
 *
 * `status` is the `review-status` Enumeration category (see
 * `../records/enumeration/enumeration.ts`), so the pill's labels come from the
 * same place every other closed set's do.
 */
import type { ReviewStatus } from '../enumeration/generated-types';

/** Who or what looked: a person in the inspector, the cartridge check, or the running game. */
type ReviewSource = 'person' | 'rom' | 'live';

interface ReviewMark {
  status: ReviewStatus;
  source: ReviewSource;
  /** What the look found, in one line. */
  note?: string;
  /** ISO date of the look. */
  at: string;
}

export type { ReviewMark, ReviewSource, ReviewStatus };
