/* @layer renderer-lib @kind types */
import type { ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { LabelSide, Nudge, OverlayPartKind } from '@app/composites/PadOverlay';
import type { LayoutFamily } from '../controller-families/controller-families.type';

type SilhouetteVariant = 'offset' | 'symmetric' | 'nintendo' | 'pad';

type SilhouetteAnchorKind = 'button' | 'dpad' | 'stick' | 'shoulder' | 'trigger';

interface SilhouetteAnchor {
  id: ControllerSlotId;
  kind: SilhouetteAnchorKind;
  x: number;
  y: number;
  r: number;
}

interface OverlaySlot {
  anchor: ControllerSlotId;
  kind: OverlayPartKind;
  glyph: string;
  label: string;
  side?: LabelSide;
  nudge?: Nudge;
  scale?: number;
}

type SlotOptions = Pick<OverlaySlot, 'side' | 'nudge' | 'scale'>;

interface FamilyOverlay {
  variant: SilhouetteVariant;
  slots: readonly OverlaySlot[];
}

type VidPid = `${string}:${string}`;

interface ControllerOverride {
  family?: LayoutFamily;
  variant?: SilhouetteVariant;
  slots?: Partial<Record<ControllerSlotId, Partial<OverlaySlot> | null>>;
}

type ControllerOverrides = Readonly<Record<VidPid, ControllerOverride>>;

export type {
  ControllerOverride, ControllerOverrides, FamilyOverlay, OverlaySlot, SilhouetteAnchor, SilhouetteAnchorKind, SilhouetteVariant,
  SlotOptions, VidPid,
};
