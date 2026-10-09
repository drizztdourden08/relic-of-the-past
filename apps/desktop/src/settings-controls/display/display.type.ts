/* @layer renderer-app @kind types */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ControlContext } from '../settings-controls.type';

type CascadeKey = 'linearWorldTilemap' | 'ultrawideRendering' | 'tallRendering';

interface CascadeToggleProps extends ControlContext {
  settingKey: CascadeKey;
}

interface AspectChoices {
  options: SegmentOption[];
  widePresets: SegmentOption[];
  tallPresets?: SegmentOption[];
}

export type { AspectChoices, CascadeKey, CascadeToggleProps };
