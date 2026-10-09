/* @layer store-site @kind types */
import type { ReviewEntry } from '@shared/store/api-types';
import type { useReviewQueue } from './useReviewQueue';

type EntriesLoader = () => Promise<{ entries: ReviewEntry[] }>;

type ReviewQueue = ReturnType<typeof useReviewQueue>;

export type { EntriesLoader, ReviewQueue };
