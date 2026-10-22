/* @layer renderer-lib @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';
import type { ControllerLayoutVariant, ControllerSlotId } from '@drizztdourden08/tessera/composites';

type ExtraSlotId =
  | 'extra.misc2' | 'extra.misc3' | 'extra.misc4' | 'extra.misc5' | 'extra.misc6'
  | 'extra.paddle.right1' | 'extra.paddle.left1' | 'extra.paddle.right2' | 'extra.paddle.left2'
  | 'extra.touchpad';

interface FamilyLayout {
  variant: ControllerLayoutVariant;
  labels: Partial<Record<ControllerSlotId, string>>;
  glyphs: Partial<Record<ControllerSlotId, string>>;
  extras: Partial<Record<ExtraSlotId, string>>;
}

type LayoutFamily = PadFamily | 'snes';

type DevicePositions = ReadonlySet<string>;

export type { DevicePositions, ExtraSlotId, FamilyLayout, LayoutFamily };
