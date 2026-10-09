/* @layer shared-store @kind types */
import type { Person } from '../types';

type ReviewState = 'uploading' | 'ready' | 'waiting' | 'approved' | 'rejected' | 'deleted';

type ListingEditState = 'waiting' | 'approved' | 'rejected' | 'withdrawn';

type Review<S extends string = ReviewState> = {
  state: S;
  submittedAt: number | null;
  decidedAt: number | null;
  by: Person | null;
  note: string;
};

type ReviewDecision = 'approve' | 'reject';

export type { ReviewState, ListingEditState, Review, ReviewDecision };
