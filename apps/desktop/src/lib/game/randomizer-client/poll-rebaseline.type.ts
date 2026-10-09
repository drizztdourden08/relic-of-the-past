/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { PollEntry } from './location-poller';

interface RebaselineInput {
  entries: readonly PollEntry[];
  isComplete: (entry: PollEntry) => boolean;
  suppressed: ReadonlySet<string>;
  isKnownReported?: (key: LocationKey) => boolean;
}

interface RebaselineResult {
  reported: Set<string>;
  toReport: LocationKey[];
}

export type { RebaselineInput, RebaselineResult };
