/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { Haptics } from '@capacitor/haptics';
import { HAPTIC_MAX_MS, HAPTIC_MIN_MS } from '../TouchControls.constants';

const useTouchHaptics = (enabled: boolean, strength: number): (() => void) =>
  useCallback(() => {
    if (!enabled || strength <= 0) return;
    const duration = Math.round(HAPTIC_MIN_MS + strength * (HAPTIC_MAX_MS - HAPTIC_MIN_MS));
    Haptics.vibrate({ duration }).catch(() => undefined);
  }, [enabled, strength]);

export { useTouchHaptics };
