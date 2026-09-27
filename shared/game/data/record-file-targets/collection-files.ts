/* @layer shared-game @kind logic */
/**
 * Where an item, an actor, a dungeon, an area, a location or a region is filed: each by
 * what it is (a category, a kind, a world), and a dungeon's own items with the dungeon.
 */
import { findOne, getArea } from '../facade';
import type { ActorKind, AreaRecord, DungeonRecord, ItemRecord, LocationRecord, RegionRecord } from '../types';
import type { ItemCategory } from '../taxonomy/item-categories';
import { worldFolder } from './layout';
import type { FileTarget } from './layout';
import { worldOfDungeon } from './screen-files';

/** The file each category of item is kept in, for an item that names no dungeon. */
const ITEM_CATEGORY_FILES: Readonly<Record<ItemCategory, string>> = {
  crystal: 'prizes', medallion: 'progression', event: 'progression', bottle: 'bottles',
  key: 'keys', weapon: 'weapons', equipment: 'equipment', upgrade: 'capacity', junk: 'junk',
};

/** The categories a seed-only item never leaves, whatever its origin says. */
const BY_CATEGORY_ONLY: readonly ItemCategory[] = ['crystal', 'medallion', 'event', 'bottle', 'key'];

type ItemHome = Pick<ItemRecord, 'category'> & Partial<Pick<ItemRecord, 'dungeonId' | 'origin' | 'gameId'>>;

/**
 * A dungeon's own map, compass or key files with that dungeon. An item the game has no
 * receive index for, and no vanilla counterpart, is a seed-only item and files with the rest
 * of them. Everything else files by category.
 */
const itemRecordFile = (item: ItemHome): FileTarget => {
  const dungeonId = item.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `items/dungeon-items/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
  }
  const file = ITEM_CATEGORY_FILES[item.category];
  if (!file) return { relativePath: null, unresolved: `no file is declared for ${item.category} items` };
  const seedOnly = item.origin === 'randomizer'
    && item.gameId?.receiveItemId === undefined
    && !BY_CATEGORY_ONLY.includes(item.category);
  return { relativePath: `items/${seedOnly ? 'randomizer' : file}.ts` };
};

/** The file each kind of actor is kept in. */
const ACTOR_KIND_FILES: Readonly<Record<ActorKind, string>> = {
  enemy: 'enemies', object: 'objects', trigger: 'triggers', boss: 'bosses',
  npc: 'npcs', obstacle: 'obstacles',
};

const actorRecordFile = (actor: { kind: ActorKind }): FileTarget => {
  const file = ACTOR_KIND_FILES[actor.kind];
  return file
    ? { relativePath: `actors/${file}.ts` }
    : { relativePath: null, unresolved: `no file is declared for ${actor.kind} actors` };
};

/** A dungeon is one record in one file, under its world. */
const dungeonRecordFile = (dungeon: Pick<DungeonRecord, 'fileStem' | 'roomScreenIds'>): FileTarget => {
  if (!dungeon.fileStem) return { relativePath: null, unresolved: 'the dungeon names no file stem' };
  return { relativePath: `dungeons/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
};

/** The mountain area spans both worlds; its record files with the light side, as its twin does with the dark. */
const areaRecordFile = (area: Pick<AreaRecord, 'world'>): FileTarget =>
  ({ relativePath: `areas/${worldFolder(area.world)}.ts` });

const locationRecordFile = (location: Pick<LocationRecord, 'areaId'>): FileTarget => {
  const area = getArea(location.areaId);
  return { relativePath: `locations/${worldFolder(area.world)}.ts` };
};

/**
 * A region files under its world, by what it is: a dungeon wing with its dungeon, a cave or
 * house with the other interiors, anything else with the overworld.
 */
const regionRecordFile = (region: Pick<RegionRecord, 'world' | 'type' | 'dungeonId'>): FileTarget => {
  const folder = `regions/${worldFolder(region.world)}`;
  const dungeonId = region.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `${folder}/${dungeon.fileStem}.ts` };
  }
  if (region.type === 'dungeon') {
    return { relativePath: null, unresolved: 'a dungeon region that names no dungeon is filed by hand' };
  }
  return { relativePath: `${folder}/${region.type === 'cave' ? 'interiors' : 'overworld'}.ts` };
};

export { actorRecordFile, areaRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile, regionRecordFile };
export type { ItemHome };
