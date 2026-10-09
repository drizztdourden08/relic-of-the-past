/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../../world/location-key';
import type { CheckDetection } from '../check-detection';
import type { RandomizerSession } from '../session.type';

type ReportingSession = Pick<RandomizerSession, 'reportCheck'>;

interface PollEntry {
  key: LocationKey;
  checkId?: string;
  detection?: CheckDetection;
  baselineOnly?: boolean;
}

type PollerState = {
  intervalId: ReturnType<typeof setInterval> | null;
  polledEntries: readonly PollEntry[];
  rebaselinePending: boolean;
  isKnownReported: ((key: LocationKey) => boolean) | undefined;
  reported: Set<string>;
  suppressed: Set<string>;
};

export type { PollEntry, PollerState, ReportingSession };
