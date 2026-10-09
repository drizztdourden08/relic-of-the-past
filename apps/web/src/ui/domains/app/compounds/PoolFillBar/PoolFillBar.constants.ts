/* @layer renderer-components @kind constants */
import type { SegmentEntry } from './PoolFillBar.type';

const SEGMENTS: readonly SegmentEntry[] = [
  { key: 'items', tone: 'green', label: 'items in pool', title: 'Items the shuffle places that are neither a capacity upgrade nor filler' },
  { key: 'upgrades', tone: 'upgrade', label: 'upgrades', title: 'Capacity upgrade items, each in a filler\'s place' },
  { key: 'filler', tone: 'warning', label: 'filler', title: 'Balance filler still in the pool' },
  { key: 'fixed', tone: 'danger', label: 'fixed', title: 'Spots settled before the shuffle' },
  { key: 'prizes', tone: 'info', label: 'prizes', title: 'The ten boss-reward slots, pre-placed from their own fixed pool' },
];

const TOTAL_TITLE = 'Every location this seed generates, the same total the Checks widget shows';

export { SEGMENTS, TOTAL_TITLE };
