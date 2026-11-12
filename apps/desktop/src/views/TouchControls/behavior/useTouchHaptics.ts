/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const useTouchHaptics = (enabled: boolean): (() => void) =>
  useCallback(() => {
    if (!enabled) return;
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }, [enabled]);

export { useTouchHaptics };
