/* @layer shared-store @kind types */
/**
 * The review record every version and every listing edit carries. The reviewer and the note
 * are shown to the author, reviewers and admins only; the API strips them for anyone else.
 */
import type { Person } from './types';

/** uploading, then waiting, then one of approved, rejected or withdrawn. */
type ReviewState = 'uploading' | 'waiting' | 'approved' | 'rejected' | 'withdrawn';

type Review = {
  state: ReviewState;
  /** When the upload completed and the version joined the queue. */
  submittedAt: number | null;
  decidedAt: number | null;
  /** The reviewer who decided. */
  by: Person | null;
  /** The reviewer's note to the author; required to reject. */
  note: string;
};

/** What a reviewer can decide on a waiting version or listing edit. */
type ReviewDecision = 'approve' | 'reject';

export type { ReviewState, Review, ReviewDecision };
