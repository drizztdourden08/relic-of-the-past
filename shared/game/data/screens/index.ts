/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../types';
import { ALL_LIGHT_WORLD_SCREENS } from './light-world';
import { ALL_DARK_WORLD_SCREENS } from './dark-world';

export { ALL_LIGHT_WORLD_SCREENS } from './light-world';
export { ALL_DARK_WORLD_SCREENS } from './dark-world';
export { TAG_METADATA, TAG_NAMESPACES, hasAllTags, hasAnyTag, getTagNamespace, getTagValue } from './tags';
export type { ScreenTag, EnvironmentTag, HazardTag, LootTag, RoleTag, TraversalTag, TagMetadata, TagNamespace } from './tags';
export { AREAS } from './areas';
export type { AreaDef } from './areas';
export { LOCATIONS } from './locations';
export type { LocationDef } from './locations';

const ALL_SCREENS: ScreenDefinition[] = [
  ...ALL_LIGHT_WORLD_SCREENS,
  ...ALL_DARK_WORLD_SCREENS,
];

const SCREEN_BY_ID = new Map<string, ScreenDefinition>(
  ALL_SCREENS.map(r => [r.id, r])
);

export { ALL_SCREENS, SCREEN_BY_ID };
export { getScreenLookup, resolveCurrentScreen, resolveCurrentScreenDetailed } from './detection';
export type { ScreenLookup, ScreenMatchResult, ScreenMatchMethod, VariantGameState } from './detection';
export { buildScreenBundle } from './bundles';
export { gameScreenIdOf, screenForGameId, screenIdForGameId, gameIdLabel } from './game-id';
export type { GameScreenId } from './game-id';
export { getPalaceMismatches, clearPalaceMismatches, describePalaceMismatch } from './palace-fallback';
export type { PalaceMismatch } from './palace-fallback';
export { setNameOverlay, hasNameOverlay, displayName } from './names-overlay';
export type { NameOverlay } from './names-overlay';
export { dungeonGroupOf, dungeonGroupForScreen } from './dungeon-group';
