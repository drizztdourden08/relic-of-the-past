/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { ExtentMode } from '@app/hud-layout-editing/track-extents';
import type { Extent } from '@rotp/hud';

interface TrackSizeMenuProps {
  anchorRef: RefObject<HTMLElement | null>;
  mode: ExtentMode;
  extent: Extent | undefined;
  onSize?: (extent: Extent) => void;
  onClose: () => void;
}

export type { TrackSizeMenuProps };
