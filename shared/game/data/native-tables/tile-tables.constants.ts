/* @layer shared-game @kind constants */
import type { TileAttrDef, TileBehavior, TileVisual } from '../types/tile-attrs-types';
import type { AttrGroup } from './attr-group.type';
import { buildAttrMaps } from './build-attr-maps';
import { NO_BYTES } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const groupsNamed = <T>(name: string): readonly AttrGroup<T>[] => pickNativeTable<readonly AttrGroup<T>[]>(name, []);

const behaviorMaps = buildAttrMaps<TileBehavior>([
  ...groupsNamed<TileBehavior>('TERRAIN_BEHAVIOR_GROUPS'),
  ...groupsNamed<TileBehavior>('STRUCTURE_BEHAVIOR_GROUPS'),
]);

const visualMaps = buildAttrMaps<TileVisual>([
  ...groupsNamed<TileVisual>('TERRAIN_VISUAL_GROUPS'),
  ...groupsNamed<TileVisual>('STRUCTURE_VISUAL_GROUPS'),
]);

const OVERWORLD_TILE_ATTRS = pickNativeTable<Readonly<Record<number, TileAttrDef>>>('OVERWORLD_TILE_ATTRS', NO_BYTES);
const INTERIOR_ATTRS = pickNativeTable<Readonly<Record<number, TileAttrDef>>>('INTERIOR_ATTRS', NO_BYTES);

const OVERWORLD_TILE_BEHAVIOR: Readonly<Record<number, TileBehavior>> = behaviorMaps.overworld;
const INTERIOR_TILE_BEHAVIOR: Readonly<Record<number, TileBehavior>> = behaviorMaps.interior;

const OVERWORLD_TILE_VISUAL: Readonly<Record<number, TileVisual>> = visualMaps.overworld;
const INTERIOR_TILE_VISUAL: Readonly<Record<number, TileVisual>> = visualMaps.interior;

export {
  INTERIOR_ATTRS, INTERIOR_TILE_BEHAVIOR, INTERIOR_TILE_VISUAL,
  OVERWORLD_TILE_ATTRS, OVERWORLD_TILE_BEHAVIOR, OVERWORLD_TILE_VISUAL,
};
