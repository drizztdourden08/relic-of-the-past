/* @layer shared-types @kind data */
import type { ScreenLightingConfig, ShadowCastingProject } from './shadow-casting.type';

const DEFAULT_LIGHTING_CONFIG: ScreenLightingConfig = {
  sunEnabled: true,
  sunAngle: 315,
  sunElevation: 45,
  sunIntensity: 0.8,
  ambientIntensity: 0.3,
  dayNightCycle: false,
  cycleSpeed: 120,
  shadowSoftness: 0.5,
};

const EMPTY_SHADOW_PROJECT: ShadowCastingProject = {
  version: 1,
  screens: {},
  globalDefaults: { ...DEFAULT_LIGHTING_CONFIG },
};

export { DEFAULT_LIGHTING_CONFIG, EMPTY_SHADOW_PROJECT };
