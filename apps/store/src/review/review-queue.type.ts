/* @layer store-site @kind types */
import type { ReviewEntry } from '@rotp/hub-contracts';

type EntriesLoader = () => Promise<{ entries: ReviewEntry[] }>;

export type { EntriesLoader };
