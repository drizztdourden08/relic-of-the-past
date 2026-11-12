/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';

type TouchPatch = Partial<Omit<TouchControlsSettings, 'layouts'>>;

interface TouchControlsSettingsApi {
  touch: TouchControlsSettings;
  updateTouch: (patch: TouchPatch) => void;
  updateLayout: (orientation: TouchOrientation, layout: OrientationLayout) => void;
}

const useTouchControlsSettings = (): TouchControlsSettingsApi => {
  const { settings, patch } = useSettings<AppSettings>();
  const touch = settings.touchControls;

  const updateTouch = useCallback(
    (change: TouchPatch) => patch({ touchControls: { ...touch, ...change } }),
    [patch, touch],
  );

  const updateLayout = useCallback(
    (orientation: TouchOrientation, layout: OrientationLayout) =>
      patch({ touchControls: { ...touch, layouts: { ...touch.layouts, [orientation]: layout } } }),
    [patch, touch],
  );

  return { touch, updateTouch, updateLayout };
};

export { useTouchControlsSettings };
export type { TouchControlsSettingsApi };
