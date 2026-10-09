/* @layer store-site @kind constants */
import type { ReviewDecision } from '@shared/store/review-types';

const DONE: Record<ReviewDecision, string> = { approve: 'Approved.', reject: 'Rejected. The author sees your note.' };

export { DONE };
