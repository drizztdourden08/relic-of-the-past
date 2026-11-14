/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { EditHold } from '../TouchControls.type';

interface PointerOptions {
  layout: OrientationLayout;
  box: ScreenBox;
  enabled: boolean;
  hold: EditHold;
  onPress: () => void;
}

export type { PointerOptions };
