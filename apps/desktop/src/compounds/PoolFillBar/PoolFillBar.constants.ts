/* @layer renderer-components @kind constants */
import type { SegmentEntry } from './PoolFillBar.type';

const SEGMENTS: readonly SegmentEntry[] = [
  { key: 'items', color: 'secondary', label: 'items in pool' },
  { key: 'upgrades', color: 'violet', label: 'upgrades' },
  { key: 'filler', color: 'warning', label: 'filler' },
  { key: 'fixed', color: 'danger', label: 'fixed' },
  { key: 'prizes', color: 'info', label: 'prizes' },
];

const TOTAL_TITLE = 'Every location this seed generates, the same total the Checks widget shows';

const BAR_LABEL = 'Item pool';

export { BAR_LABEL, SEGMENTS, TOTAL_TITLE };
