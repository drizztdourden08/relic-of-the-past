/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';
import type { PollEntry } from './location-poller/location-poller.type';

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
