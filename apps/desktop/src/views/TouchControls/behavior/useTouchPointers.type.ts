/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { MenuHold } from '../TouchControls.type';

interface PointerOptions {
  layout: OrientationLayout;
  box: ScreenBox;
  enabled: boolean;
  hold: MenuHold;
  onPress: () => void;
}

export type { PointerOptions };
