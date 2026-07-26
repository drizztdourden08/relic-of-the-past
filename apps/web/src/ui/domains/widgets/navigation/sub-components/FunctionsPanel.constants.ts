/* @layer renderer-widgets @kind data */
import type { SegmentOption } from '../../../../design-system/primitives/SegmentedControl/SegmentedControl.type';
import type { NavMode } from '../../../../../stores/navigation-overlay-store';

/** Module-level so the array identity is stable across renders. */
const MODE_OPTIONS: SegmentOption<NavMode>[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'auto', label: 'Auto' },
];

export { MODE_OPTIONS };
