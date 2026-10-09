/* @layer renderer-components @kind types */
import type { ScreenShadowData, ScreenLightingConfig } from '@shared/types/shadow-casting';

interface ShadowGlobalSettingsProps {
  screenId: number;
  screenData: ScreenShadowData;
  updateLighting: (screenId: number, patch: Partial<ScreenLightingConfig>) => void;
}

export type { ShadowGlobalSettingsProps };
