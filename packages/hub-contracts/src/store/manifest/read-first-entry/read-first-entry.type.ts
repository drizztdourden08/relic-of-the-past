/* @layer shared-store @kind types */
import type { HeaderFailure } from '../zip-local-header';

type FirstEntry = {
  name: string;
  text: string;
  manifest: unknown;
};

type FirstEntryFailure = HeaderFailure | 'method' | 'too-large' | 'inflate' | 'json';

type FirstEntryResult =
  | { ok: true; entry: FirstEntry }
  | { ok: false; reason: FirstEntryFailure; needBytes?: number };

export type { FirstEntry, FirstEntryFailure, FirstEntryResult };
