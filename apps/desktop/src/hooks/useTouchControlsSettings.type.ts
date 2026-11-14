/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';

type TouchPatch = Partial<Omit<TouchControlsSettings, 'layouts'>>;

interface TouchControlsSettingsApi {
  touch: TouchControlsSettings;
  updateTouch: (patch: TouchPatch) => void;
  updateLayout: (orientation: TouchOrientation, layout: OrientationLayout, change?: TouchPatch) => void;
}

export type { TouchControlsSettingsApi, TouchPatch };
