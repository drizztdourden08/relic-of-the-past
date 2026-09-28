/* @layer shared-store @kind types */
/**
 * The review record every version and every listing edit carries. The reviewer and the note
 * are shown to the author, reviewers and admins only; the API strips them for anyone else.
 */
import type { Person } from './types';

/**
 * A version's life: uploading, then ready until the author sends it, then waiting in the
 * queue, then approved or rejected. Deleted is reachable from most states and final. The
 * moves between them are VERSION_FLOW in version-flow.ts.
 */
type ReviewState = 'uploading' | 'ready' | 'waiting' | 'approved' | 'rejected' | 'deleted';

/** A listing edit waits, then is approved or rejected, or withdrawn when a newer edit replaces it. */
type ListingEditState = 'waiting' | 'approved' | 'rejected' | 'withdrawn';

type Review<S extends string = ReviewState> = {
  state: S;
  /** When the author sent it for review; null while it has not been sent. */
  submittedAt: number | null;
  decidedAt: number | null;
  /** The reviewer who decided. */
  by: Person | null;
  /** The reviewer's note to the author; required to reject. */
  note: string;
};

/** What a reviewer can decide on a waiting version or listing edit. */
type ReviewDecision = 'approve' | 'reject';

export type { ReviewState, ListingEditState, Review, ReviewDecision };
