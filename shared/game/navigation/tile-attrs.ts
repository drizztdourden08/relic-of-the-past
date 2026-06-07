/* @layer shared-game @kind logic */
/**
 * Unified tile attribute map — single source of truth for collision behavior,
 * equipment requirements, semantic labels, and category grouping.
 *
 * Tables live in overworld-attrs.ts / interior-attrs.ts; types in
 * tile-attrs-types.ts. This module exposes derived helpers + the public barrel.
 */
import type { TileReq, TileCat, TileAttrContext, TileAttrDef } from './tile-attrs-types';
import { OVERWORLD_TILE_ATTRS } from './overworld-attrs';
import { INTERIOR_HOUSE_TILE_ATTRS, INTERIOR_CAVE_TILE_ATTRS, INTERIOR_DUNGEON_TILE_ATTRS, getTileAttrsMap } from './interior-attrs';

/** Backward-compat alias; prefer OVERWORLD_TILE_ATTRS. */
const TILE_ATTRS = OVERWORLD_TILE_ATTRS;

// ─── Derived Helpers ────────────────────────────────────────────────────────

const getAttrLabel = (attr: number, context: TileAttrContext = 'overworld'): string => {
  return getTileAttrsMap(context)[attr]?.labels[0] ?? 'unknown';
};

const getAttrReq = (attr: number, context: TileAttrContext = 'overworld'): TileReq | undefined => {
  return getTileAttrsMap(context)[attr]?.req;
};

const isCategory = (attr: number, cat: TileCat, context: TileAttrContext = 'overworld'): boolean => {
  return getTileAttrsMap(context)[attr]?.cat === cat;
};

// ─── Category Sets (derived from the map) ───────────────────────────────────

const attrsOfCat = (map: Readonly<Record<number, TileAttrDef>>, cat: TileCat): ReadonlySet<number> => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(map)) {
    if (v.cat === cat) s.add(Number(k));
  }
  return s;
};

const WATER_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'water');
const CLIFF_TRIGGER_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'cliff-trigger');
const CLIFF_FACE_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'cliff-face');
const PIT_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'pit');

/** Tiles the hookshot can grab onto (pulls Link to them from range). */
const HOOKSHOT_TARGET_TILES: ReadonlySet<number> = (() => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(OVERWORLD_TILE_ATTRS)) {
    if (v.hookTarget) s.add(Number(k));
  }
  return s;
})();

const getHookshotTargetTiles = (context: TileAttrContext = 'overworld'): ReadonlySet<number> => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(getTileAttrsMap(context))) {
    if (v.hookTarget) s.add(Number(k));
  }
  return s;
};

export {
  OVERWORLD_TILE_ATTRS, INTERIOR_HOUSE_TILE_ATTRS, INTERIOR_CAVE_TILE_ATTRS, INTERIOR_DUNGEON_TILE_ATTRS,
  TILE_ATTRS, getTileAttrsMap, getAttrLabel, getAttrReq, isCategory,
  WATER_TILES, CLIFF_TRIGGER_TILES, CLIFF_FACE_TILES, PIT_TILES, HOOKSHOT_TARGET_TILES, getHookshotTargetTiles,
};
export type { TileReq, TileLabel, TilePass, TileCat, TileAttrContext, TileAttrDef } from './tile-attrs-types';
