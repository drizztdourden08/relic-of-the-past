/* @layer renderer-app @kind logic */
/**
 * Number limits for the editor (sibling of `id-ref-options` and
 * `tag-suggestions`). Bounds depend on the record, not just the path: the same
 * grid coordinate is bounded differently on an overworld screen and a room.
 * Indices are folded out of the path, so one rule covers every list element.
 */
import type { NumberBounds, NumberBoundsResolver } from '@ds/composites/RecordEditor';

/** The kind of screen whose grid is the outdoor map, not a room layout. */
const OVERWORLD = 'overworld';

/** The outdoor map is 8 by 8 screens per world. */
const OVERWORLD_GRID = { x: { min: 0, max: 7 }, y: { min: 0, max: 7 } };

/** An indoor grid is wider and one row shorter, which is the layout rooms are placed on. */
const ROOM_GRID = { x: { min: 0, max: 15 }, y: { min: 0, max: 14 } };

/** Floors run below and above the level you walk in at. */
const SCREEN_FLOOR: NumberBounds = { min: -7, max: 6 };

/** A spawn sits on the 64-by-64 base-tile grid one screen is drawn on. */
const SCREEN_TILE: NumberBounds = { min: 0, max: 63 };

const resolvers = new Map<string, NumberBoundsResolver>();

/** `spawns.3.tile.x` → `spawns[].tile.x`, which is how the schema names an element. */
const withoutIndices = (path: string): string =>
  path.split('.').map(segment => (/^\d+$/.test(segment) ? '[]' : segment)).join('.')
    .replace(/\.\[\]/g, '[]');

const isOverworld = (record: unknown): boolean =>
  typeof record === 'object' && record !== null
  && (record as { kind?: unknown }).kind === OVERWORLD;

const screenBounds = (path: string, record: unknown): NumberBounds | undefined => {
  const grid = isOverworld(record) ? OVERWORLD_GRID : ROOM_GRID;
  if (path === 'position.gridX') return grid.x;
  if (path === 'position.gridY') return grid.y;
  if (path === 'position.floor') return SCREEN_FLOOR;
  if (path === 'spawns[].tile.x' || path === 'spawns[].tile.y') return SCREEN_TILE;
  return undefined;
};

const BY_COLLECTION: Record<string, (path: string, record: unknown) => NumberBounds | undefined> = {
  screen: screenBounds,
};

/** What this numeric field accepts, or undefined to leave it open at both ends. */
const resolveNumberBoundsFor = (
  collectionKind: string,
  path: string,
  record: unknown,
): NumberBounds | undefined =>
  BY_COLLECTION[collectionKind]?.(withoutIndices(path), record);

/** Bound to one collection and kept, so the editor's binding memo stays stable. */
const numberBoundsResolverFor = (collectionKind: string): NumberBoundsResolver => {
  const held = resolvers.get(collectionKind);
  if (held) return held;
  const built: NumberBoundsResolver = (path, record) =>
    resolveNumberBoundsFor(collectionKind, path, record);
  resolvers.set(collectionKind, built);
  return built;
};

export { numberBoundsResolverFor, resolveNumberBoundsFor, withoutIndices };
