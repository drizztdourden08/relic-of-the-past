/* @layer renderer-app @kind types */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';

interface AspectChoices {
  options: SegmentOption[];
  widePresets: SegmentOption[];
  tallPresets?: SegmentOption[];
}

export type { AspectChoices };
