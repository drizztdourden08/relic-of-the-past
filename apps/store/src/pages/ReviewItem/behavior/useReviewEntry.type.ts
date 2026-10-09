/* @layer store-site @kind types */
import type { ReviewEntry } from '@rotp/hub-contracts';

type ReviewEntryState = {
  entry: ReviewEntry | null;
  loading: boolean;
  error: string | null;
};

export type { ReviewEntryState };
