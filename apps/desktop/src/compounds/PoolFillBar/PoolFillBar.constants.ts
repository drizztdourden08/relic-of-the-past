/* @layer renderer-components @kind constants */
import type { SegmentEntry } from './PoolFillBar.type';

const SEGMENTS: readonly SegmentEntry[] = [
  { key: 'items', color: 'secondary', label: 'items in pool', description: 'Items the shuffle places that are neither a capacity upgrade nor filler' },
  { key: 'upgrades', color: 'violet', label: 'upgrades', description: "Capacity upgrade items, each in a filler's place" },
  { key: 'filler', color: 'warning', label: 'filler', description: 'Balance filler still in the pool' },
  { key: 'fixed', color: 'danger', label: 'fixed', description: 'Spots settled before the shuffle' },
  { key: 'prizes', color: 'info', label: 'prizes', description: 'The ten boss-reward slots, pre-placed from their own fixed pool' },
];

const TOTAL_TITLE = 'Every location this seed generates, the same total the Checks widget shows';

const BAR_LABEL = 'Item pool';

export { BAR_LABEL, SEGMENTS, TOTAL_TITLE };
