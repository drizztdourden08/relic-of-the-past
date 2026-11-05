/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@rotp/randomizer';

type PollReporter = { reportCheck(location: LocationKey): void };

export type { PollReporter };
