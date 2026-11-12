/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/** A light tick for a button press or the menu opening; a no-op when haptics are off. */
const useTouchHaptics = (enabled: boolean): (() => void) =>
  useCallback(() => {
    if (!enabled) return;
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }, [enabled]);

export { useTouchHaptics };
