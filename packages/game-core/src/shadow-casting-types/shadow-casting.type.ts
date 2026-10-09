/* @layer shared-types @kind types */
interface ShapeDefinition {
  id: string;
  type: 'polygon' | 'freehand';
  sides?: number;
  cornerRadius?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: { x: number; y: number }[];
}

interface HeightmapElement {
  id: string;
  shape: ShapeDefinition;
  height: number;
  smoothing: number;
}

interface LightSource {
  id: string;
  type: 'point' | 'shape';
  x: number;
  y: number;
  intensity: number;
  radius: number;
  color: 'sample' | string;
  shape?: ShapeDefinition;
  castShadows: boolean;
}

interface ScreenLightingConfig {
  sunEnabled: boolean;
  sunAngle: number;
  sunElevation: number;
  sunIntensity: number;
  ambientIntensity: number;
  dayNightCycle: boolean;
  cycleSpeed: number;
  shadowSoftness: number;
}

interface ScreenShadowData {
  screenId: number;
  heightmap: HeightmapElement[];
  lights: LightSource[];
  lighting: ScreenLightingConfig;
}

interface ShadowCastingProject {
  version: 1;
  screens: Record<number, ScreenShadowData>;
  globalDefaults: ScreenLightingConfig;
}

export type {
  ShapeDefinition,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
  ScreenShadowData,
  ShadowCastingProject,
};
