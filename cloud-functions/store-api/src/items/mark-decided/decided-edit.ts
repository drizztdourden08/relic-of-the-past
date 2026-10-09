/* @layer store-api @kind logic */
import type { ListingEditState, Review } from '../../../../../shared/store/review-types';
import { conflict } from '../../../../hub-core/http/http-error';
import type { Decided } from './mark-decided.type';

const decidedEdit = (review: Review<ListingEditState>, state: 'approved' | 'rejected', { by, note, at }: Decided): Review<ListingEditState> => {
  if (review.state !== 'waiting') throw conflict('This is no longer waiting for review.');
  return { ...review, state, by, note, decidedAt: at };
};

export { decidedEdit };
