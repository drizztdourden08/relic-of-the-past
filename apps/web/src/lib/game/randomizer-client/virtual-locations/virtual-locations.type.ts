/* @layer bridge-wasm @kind types */
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

interface VirtualChecksCache {
  entry: { placement: Placement; records: CheckRecord[] } | null;
}

export type { VirtualChecksCache };
