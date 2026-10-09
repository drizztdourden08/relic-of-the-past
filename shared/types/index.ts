/* @layer shared-types @kind barrel */
export type { SeedData, LocationEntry, GoalMode, MedallionConfig, SaveMeta } from '../game/seed';
export type { AutoSaveInfo, AutoSaveSettings, NormalSaveInfo, QuickSaveSlotInfo } from './saves';
export type {
  ShapeDefinition,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
  ScreenShadowData,
  ShadowCastingProject,
} from './shadow-casting';
export { DEFAULT_LIGHTING_CONFIG, EMPTY_SHADOW_PROJECT } from './shadow-casting';
export type { GameEvent } from './game-event.type';
