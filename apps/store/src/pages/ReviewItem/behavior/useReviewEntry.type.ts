/* @layer store-site @kind types */
import type { ReviewEntry } from '@shared/store/api-types';

type ReviewEntryState = {
  entry: ReviewEntry | null;
  loading: boolean;
  error: string | null;
};

export type { ReviewEntryState };
