/* @layer bridge-wasm @kind types */
import type { CheckRecord } from '@rotp/game-data';
import type { Placement } from '../../world/fill/placement.type';

interface VirtualChecksCache {
  entry: { placement: Placement; records: CheckRecord[] } | null;
}

export type { VirtualChecksCache };
