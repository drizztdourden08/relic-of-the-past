/* @layer shared-types @kind barrel */
export type { SeedData, LocationEntry, GoalMode, MedallionConfig, SaveMeta } from '@rotp/game-data';
export type { AutoSaveInfo, AutoSaveSettings, NormalSaveInfo, QuickSaveSlotInfo } from '../save-types';
export type {
  ShapeDefinition,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
  ScreenShadowData,
  ShadowCastingProject,
} from '../shadow-casting-types';
export { DEFAULT_LIGHTING_CONFIG, EMPTY_SHADOW_PROJECT } from '../shadow-casting-types';
export type { GameEvent } from './game-event.type';
