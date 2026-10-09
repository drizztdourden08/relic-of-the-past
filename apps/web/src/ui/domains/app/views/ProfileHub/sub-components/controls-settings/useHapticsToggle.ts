/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { UseHapticsToggleArgs } from './controls-settings.type';

const useHapticsToggle = ({ settings, onChange }: UseHapticsToggleArgs) => {
  const hapticsEnabled = settings.hapticsEnabled;

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    onChange({ hapticsEnabled: enabled });
  }, [onChange]);

  return { hapticsEnabled, setHapticsEnabled };
};

export { useHapticsToggle };
