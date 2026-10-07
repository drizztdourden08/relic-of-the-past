/* @layer shared-game @kind logic */
/**
 * The only door into the dataset. Nothing outside this module ever imports a
 * data file directly. Every read, everywhere in the app, goes through here.
 */
import { all, get } from './registry';
import { actorByGameId, checkByGameId, dungeonByGameId, itemByGameId, screenByGameId } from './indexes';
import type {
  ActorGameId, ActorRecord, AreaId, AreaRecord, CheckGameId, CheckRecord, ConnectionRecord,
  DungeonGameId, DungeonRecord, EntityKind, EntityOf, ItemGameId, ItemRecord, LocationId, LocationRecord,
  RegionRecord, ScreenGameId, ScreenRecord, TagRecord,
} from './types';

// Getters accept a plain `string`, not the branded `FooId` template-literal type:
// most callers only have a runtime string (from live game state, a Set<string>,
// a Map key) with no static guarantee of its brand. The branded types stay on
// the RECORD's own `.id` field (and on generate-ids.ts's output) where the id
// is actually produced, which is where the type safety is useful.
//
// A miss THROWS. The records are tracked in this repository and seeded
// synchronously before any getter can run, so there is no load in flight, no
// empty-registry case and no way for a real id to be absent: a miss is a bug in
// the caller or a dangling reference in the data, and the two keep tests
// (dataset-integrity, rom-facts) exist to catch the second one before a getter
// ever sees it. What stood here was a fabricated record per kind, which the
// dataset used to need because a checkout without the private companion repo
// seeded nothing at all. It fabricated a world instead of reporting one:
// `name` read '(unregistered)', so a genuine lookup bug rendered a plausible
// label, and `world` read 'light', so a screen nobody held silently counted as
// same-world.
//
// A caller that legitimately holds an id the dataset never had asks for it
// explicitly with `get`, which answers `undefined`: the simulator keys its own
// places on the game's numbers (`room:80`) and never on a ScreenId, so
// `screenLabel` and `isCrossWorld` both read through `get` and say what an
// absent end means.

/**
 * The geography ids the one screen that sits in no place carries.
 *
 * `screens/light-world/interiors/special.ts` holds the menu and save-and-quit
 * pseudo-screen, which is not anywhere in the world, so its area and location
 * are these two and no record answers for either. They mark "no place
 * assigned", never "this record is broken", and the integrity test names them
 * as its one declared exemption.
 */
const PLACEHOLDER_AREA_ID: AreaId = 'area-000';
const PLACEHOLDER_LOCATION_ID: LocationId = 'location-000';

const noRecord = (kind: EntityKind, id: string): never => {
  throw new Error(`no ${kind} record with id '${id}'`);
};

const getScreen = (id: string): ScreenRecord => get('screen', id) ?? noRecord('screen', id);
const getConnection = (id: string): ConnectionRecord => get('connection', id) ?? noRecord('connection', id);
const getCheck = (id: string): CheckRecord => get('check', id) ?? noRecord('check', id);
const getItem = (id: string): ItemRecord => get('item', id) ?? noRecord('item', id);
const getDungeon = (id: string): DungeonRecord => get('dungeon', id) ?? noRecord('dungeon', id);
const getArea = (id: string): AreaRecord => get('area', id) ?? noRecord('area', id);
const getLocation = (id: string): LocationRecord => get('location', id) ?? noRecord('location', id);
const getRegion = (id: string): RegionRecord => get('region', id) ?? noRecord('region', id);
const getActor = (id: string): ActorRecord => get('actor', id) ?? noRecord('actor', id);
const getTag = (id: string): TagRecord => get('tag', id) ?? noRecord('tag', id);

const getScreenByGameId = (match: Partial<ScreenGameId>): ScreenRecord | undefined => screenByGameId(match);
const getCheckByGameId = (match: Partial<CheckGameId>): CheckRecord | undefined => checkByGameId(match);
const getItemByGameId = (match: Partial<ItemGameId>): ItemRecord | undefined => itemByGameId(match);
const getActorByGameId = (match: Partial<ActorGameId>): ActorRecord | undefined => actorByGameId(match);
const getDungeonByGameId = (match: Partial<DungeonGameId>): DungeonRecord | undefined => dungeonByGameId(match);

const find = <K extends EntityKind>(kind: K, predicate: (record: EntityOf<K>) => boolean): EntityOf<K>[] =>
  all(kind).filter(predicate);

const findOne = <K extends EntityKind>(kind: K, predicate: (record: EntityOf<K>) => boolean): EntityOf<K> | undefined =>
  all(kind).find(predicate);

export {
  PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID,
  all, find, findOne, get,
  getActor, getActorByGameId, getArea, getCheck, getCheckByGameId, getConnection,
  getDungeon, getDungeonByGameId, getItem, getItemByGameId, getLocation, getRegion, getScreen,
  getScreenByGameId, getTag,
};
