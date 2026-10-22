/* @layer renderer-lib @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';
import type { ControllerLayoutVariant, ControllerSlotId } from '@drizztdourden08/tessera/composites';

interface FamilyLayout {
  variant: ControllerLayoutVariant;
  labels: Partial<Record<ControllerSlotId, string>>;
  glyphs: Partial<Record<ControllerSlotId, string>>;
}

type LayoutFamily = PadFamily | 'snes';

type DevicePositions = ReadonlySet<string>;

export type { DevicePositions, FamilyLayout, LayoutFamily };
