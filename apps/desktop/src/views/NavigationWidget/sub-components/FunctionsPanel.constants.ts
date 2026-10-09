/* @layer renderer-widgets @kind data */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { NavMode } from '../../../stores/navigation-overlay-store';

const MODE_OPTIONS: SegmentOption<NavMode>[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'auto', label: 'Auto' },
];

export { MODE_OPTIONS };
