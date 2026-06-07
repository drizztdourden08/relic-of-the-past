/* @layer shared-types @kind data */
// ─── Shadow Casting & Lighting System Types ───

/** Unified shape definition — N-sided polygon with radius/stretch/rotation */
interface ShapeDefinition {
  id: string;
  type: 'polygon' | 'freehand';
  /** Number of sides for polygon (3=triangle, 4=rect, 64+=circle). Ignored for freehand. */
  sides?: number;
  /** Corner rounding radius 0–1. 0=sharp corners, 1=fully rounded (circle at 4 sides). */
  cornerRadius?: number;
  /** Horizontal stretch factor (default 1) */
  scaleX?: number;
  /** Vertical stretch factor (default 1) */
  scaleY?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Center X in screen-local coords (0–512) */
  x: number;
  /** Center Y in screen-local coords (0–448) */
  y: number;
  /** Bounding width */
  width: number;
  /** Bounding height */
  height: number;
  /** Arbitrary vertices for freehand/custom polygon shapes */
  points?: { x: number; y: number }[];
}

/** A heightmap element placed on a screen */
interface HeightmapElement {
  id: string;
  shape: ShapeDefinition;
  /** Normalized height 0.0–1.0 */
  height: number;
  /** Edge falloff/smoothing radius in pixels */
  smoothing: number;
}

/** A light source placed on a screen */
interface LightSource {
  id: string;
  type: 'point' | 'shape';
  /** Position X in screen-local coords */
  x: number;
  /** Position Y in screen-local coords */
  y: number;
  /** Light intensity 0–1 */
  intensity: number;
  /** Falloff radius in pixels */
  radius: number;
  /** 'sample' to auto-sample game pixel color at position, or hex color string */
  color: 'sample' | string;
  /** Shape definition for shape lights */
  shape?: ShapeDefinition;
  /** Whether this light casts shadows through heightmap */
  castShadows: boolean;
}

/** Global lighting configuration for a screen */
interface ScreenLightingConfig {
  sunEnabled: boolean;
  /** Sun direction angle in degrees (0=east, 90=south, etc.) */
  sunAngle: number;
  /** Sun elevation above horizon in degrees */
  sunElevation: number;
  /** Sun light intensity 0–1 */
  sunIntensity: number;
  /** Ambient light intensity 0–1 */
  ambientIntensity: number;
  /** Enable animated day/night cycle */
  dayNightCycle: boolean;
  /** Full cycle duration in seconds */
  cycleSpeed: number;
  /** Global shadow edge blur/smoothing 0–1 */
  shadowSoftness: number;
}

/** Per-screen shadow data */
interface ScreenShadowData {
  screenId: number;
  heightmap: HeightmapElement[];
  lights: LightSource[];
  lighting: ScreenLightingConfig;
}

/** Project-level shadow casting data file */
interface ShadowCastingProject {
  version: 1;
  screens: Record<number, ScreenShadowData>;
  globalDefaults: ScreenLightingConfig;
}

/** Default lighting config used when no per-screen data exists */
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

/** Empty project template */
const EMPTY_SHADOW_PROJECT: ShadowCastingProject = {
  version: 1,
  screens: {},
  globalDefaults: { ...DEFAULT_LIGHTING_CONFIG },
};

export type {
  ShapeDefinition,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
  ScreenShadowData,
  ShadowCastingProject,
};

export { DEFAULT_LIGHTING_CONFIG, EMPTY_SHADOW_PROJECT };
