/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import type { OrientationLayout, TouchOrientation } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import type { TouchControlsSettingsApi, TouchPatch } from './useTouchControlsSettings.type';

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
