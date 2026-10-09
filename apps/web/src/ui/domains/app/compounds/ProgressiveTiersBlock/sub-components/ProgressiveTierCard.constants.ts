/* @layer renderer-components @kind constants */
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from '@shared/randomizer/world/progressive/progressive-modes.data';
import type { ProgressiveFamilyMode } from '@shared/randomizer/world/progressive/progressive.type';
import type { SegmentOption } from '@ds/primitives';

const MODE_OPTIONS: SegmentOption<ProgressiveFamilyMode>[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

export { MODE_OPTIONS };
