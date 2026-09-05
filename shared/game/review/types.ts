/* @layer shared-game @kind types */
/**
 * Personal curation layer over the dataset facade: a status pill, a free-text
 * note, and two timestamps, kept ONE JSON file per collection
 * (`Data/review/<kind>.json`, in the app's own data directory), never inside
 * the committed dataset (`shared/game/data/**`).
 *
 * `status` is a value from the `review-status` Enumeration category (see
 * `../data/enumeration/enumeration.ts`), generalizing the untyped 4-state pill
 * the Dataset widget's Review block used for one collection
 * (`connection-review.json`) into a real enum shared across all eleven.
 */
import type { ReviewStatus } from '../data/enumeration/generated-types';

interface ReviewEntry {
  status: ReviewStatus;
  note: string;
  /** Epoch ms of when a human last judged this record's status or note. */
  reviewedAt: number | null;
  /** Epoch ms stamped by the dataset write path on a real save. Editing the note never sets it. */
  updatedAt: number | null;
}

/** One collection's review file (`Data/review/<kind>.json`), keyed by record id. */
type ReviewFile = Record<string, ReviewEntry>;

export type { ReviewEntry, ReviewFile };
