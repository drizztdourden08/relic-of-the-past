/* @layer renderer-components @kind types */
import type { ScreenLightingConfig } from '@rotp/game-core';

interface LightingSectionProps {
  screenId: number;
  lighting: ScreenLightingConfig;
  updateLighting: (screenId: number, patch: Partial<ScreenLightingConfig>) => void;
}

export type { LightingSectionProps };
