/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../../world/location-key';
import type { CheckDetection } from '../check-detection';

interface PollEntry {
  key: LocationKey;
  checkId?: string;
  detection?: CheckDetection;
  baselineOnly?: boolean;
}

export type { PollEntry };
