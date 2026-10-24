/* @layer bridge-wasm @kind types */
import type { LanServer } from './lan.type';

type LanEntry = {
  server: Omit<LanServer, 'via'>;
  mdnsKey: string | null;
  mdnsSeen: boolean;
  beaconAt: number | null;
};

export type { LanEntry };
