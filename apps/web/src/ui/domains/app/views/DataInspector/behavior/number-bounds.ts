/* @layer renderer-app @kind logic */
/**
 * The limits half of the editing handoff, and the third sibling of
 * `id-ref-options` and `tag-suggestions`.
 *
 * A schema derived from values can say a field holds a number; it cannot say
 * how far that number is allowed to go, because the answer is a fact about the
 * world the data describes and not about the data. Worse, it is not even a fact
 * about the FIELD: the same grid coordinate is bounded one way on a screen that
 * is part of the outdoor map and another way on a screen that is a room inside
 * something, so no static table keyed by path alone can answer it. That is why
 * the resolver takes the record — the rule needs to look at what the record IS.
 *
 * Indices are folded out of the path on the way in, so one rule covers every
 * element of a list: `spawns.3.tile.x` asks the same question as `spawns.0`.
 */
import type { NumberBounds, NumberBoundsResolver } from '@ds/composites/RecordEditor';

/** The kind of screen whose grid is the outdoor map rather than a room layout. */
const OVERWORLD = 'overworld';

/** The outdoor map is 8 by 8 screens per world — every row in the set sits inside it. */
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

/**
 * A screen's coordinates. The outdoor map is a square of screens; a room's grid
 * is the wider layout a dungeon floor is drawn on, and the floor itself runs
 * below and above the entrance level.
 */
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
