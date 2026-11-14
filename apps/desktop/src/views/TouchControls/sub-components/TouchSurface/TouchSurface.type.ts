/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';

type TouchSurfacePatch = Partial<Omit<TouchControlsSettings, 'layouts'>>;

interface TouchSurfaceProps {
  touch: TouchControlsSettings;
  updateLayout: (orientation: TouchOrientation, layout: OrientationLayout, change?: TouchSurfacePatch) => void;
}

export type { TouchSurfaceProps };
