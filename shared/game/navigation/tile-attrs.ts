/* @layer shared-game @kind logic */
/**
 * Unified tile attribute map. The single source of truth for collision behavior,
 * equipment requirements, semantic labels, and category grouping.
 *
 * Tables live in overworld-attrs.ts / the native INTERIOR_ATTRS table; types in
 * tile-attrs-types.ts. This module exposes derived helpers + the public barrel.
 */
import type { TileReq, TileCat, TileAttrDef } from '../data/types/tile-attrs-types';
import { INTERIOR_ATTRS } from '../data/native-tables';
import { OVERWORLD_TILE_ATTRS } from './overworld-attrs';

/** Backward-compat alias; prefer OVERWORLD_TILE_ATTRS. */
const TILE_ATTRS = OVERWORLD_TILE_ATTRS;

/**
 * Selects the attribute map for a tile's classification rules. The engine's own
 * dispatcher (TileDetect_ExecuteInner, core/zelda3/src/tile_detect.c:256) branches
 * on a single `is_indoors` bool. House, cave and dungeon interiors all read the same
 * table until they diverge, so that is all a caller here needs to say.
 */
const tileAttrsFor = (indoors: boolean): Readonly<Record<number, TileAttrDef>> =>
  indoors ? INTERIOR_ATTRS : OVERWORLD_TILE_ATTRS;

// ─── Derived Helpers ────────────────────────────────────────────────────────

const getAttrLabel = (attr: number, indoors = false): string => {
  return tileAttrsFor(indoors)[attr]?.labels[0] ?? 'unknown';
};

const getAttrReq = (attr: number, indoors = false): TileReq | undefined => {
  return tileAttrsFor(indoors)[attr]?.req;
};

const isCategory = (attr: number, cat: TileCat, indoors = false): boolean => {
  return tileAttrsFor(indoors)[attr]?.cat === cat;
};

/**
 * Walkable floor, or a doorway Link can transit. Door thresholds count: plain
 * passages (0x80-0x8D) and the layer-toggle shutters (0x90-0xAF) are crossable
 * even though they are not floor. Callers had this as a bare hex-range
 * expression in three places; keep the ranges here with the rest of the tile
 * semantics so there is one definition to correct.
 */
const isDoorPassageAttr = (attr: number): boolean =>
  (attr >= 0x80 && attr <= 0x8d) || (attr >= 0x90 && attr <= 0xaf);

const isPassableAttr = (attr: number): boolean => attr === 0x00 || isDoorPassageAttr(attr);

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

const getHookshotTargetTiles = (indoors = false): ReadonlySet<number> => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(tileAttrsFor(indoors))) {
    if (v.hookTarget) s.add(Number(k));
  }
  return s;
};

export {
  OVERWORLD_TILE_ATTRS,
  TILE_ATTRS, tileAttrsFor, getAttrLabel, getAttrReq, isCategory, isDoorPassageAttr, isPassableAttr,
  WATER_TILES, CLIFF_TRIGGER_TILES, CLIFF_FACE_TILES, PIT_TILES, HOOKSHOT_TARGET_TILES, getHookshotTargetTiles,
};
export type { TileReq, TileLabel, TilePass, TileCat, TileAttrDef } from '../data/types/tile-attrs-types';
