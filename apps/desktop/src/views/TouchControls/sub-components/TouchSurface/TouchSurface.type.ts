/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';

interface TouchSurfaceProps {
  touch: TouchControlsSettings;
  updateTouch: (patch: Partial<Omit<TouchControlsSettings, 'layouts'>>) => void;
  updateLayout: (orientation: TouchOrientation, layout: OrientationLayout) => void;
}

export type { TouchSurfaceProps };
