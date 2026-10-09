/* @layer store-site @kind logic */
import type { ReviewRow } from './review-row.type';

const reviewRowId = (row: ReviewRow) => row.id;

export { reviewRowId };
