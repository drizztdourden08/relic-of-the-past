/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { HoldRingState, TouchViewState } from '../../TouchControls.type';

interface TouchPlayLayerProps {
  layout: OrientationLayout;
  box: ScreenBox;
  strength: number;
  view: TouchViewState;
  ring: HoldRingState | null;
}

export type { TouchPlayLayerProps };
