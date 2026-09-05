/* @layer renderer-components @kind hook */
/**
 * The profile-level haptics on/off switch. When on, every
 * controller this profile uses receives rumble; there is no per-device list
 * to curate here (see the routing itself in lib/input/haptic-bridge.ts,
 * which reads the profile's own device set live).
 */

import { useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';

interface UseHapticsToggleArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const useHapticsToggle = ({ settings, onChange }: UseHapticsToggleArgs) => {
  const hapticsEnabled = settings.hapticsEnabled;

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    onChange({ hapticsEnabled: enabled });
  }, [onChange]);

  return { hapticsEnabled, setHapticsEnabled };
};

export { useHapticsToggle };
