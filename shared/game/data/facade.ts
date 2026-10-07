/* @layer shared-game @kind logic */
/**
 * The only door into the dataset. Nothing outside this module ever imports a
 * data file directly. Every read, everywhere in the app, goes through here.
 */
import { all, get } from './registry';
import { actorByGameId, checkByGameId, dungeonByGameId, itemByGameId, screenByGameId } from './indexes';
import type {
  ActorGameId, ActorRecord, AreaRecord, CheckGameId, CheckRecord, ConnectionRecord,
  DungeonGameId, DungeonRecord, EntityKind, EntityOf, ItemGameId, ItemRecord, LocationRecord,
  ScreenGameId, ScreenRecord, TagRecord,
} from './types';

// Getters accept a plain `string`, not the branded `FooId` template-literal type:
// most callers only have a runtime string (from live game state, a Set<string>,
// a Map key) with no static guarantee of its brand. The branded types stay on
// the RECORD's own `.id` field (and on generate-ids.ts's output) where the id
// is actually produced, which is where the type safety is useful.
//
// The dataset is bundled and seeded synchronously before any getter can run, so
// there is no load in flight and no missing-fetch case to stub, and a bundled
// dataset lookup that misses on a REAL id is a bug. But two callers still
// legitimately look up ids that are not in the registry: the simulation engine
// documents "endpoints missing from the registry count as same-world" as a
// deliberate default (shared/game/simulation/engine/traversal.ts), and its
// screen-graph unit tests build small synthetic worlds (screen ids like 'A'/'B')
// that were never meant to resolve against the real dataset. So a miss cannot
// throw here. The old sources/neutral.ts echoed the id into `randomizerName`,
// which is what made it actively harmful: a genuine name-lookup bug elsewhere
// in the app rendered a plausible-looking
// label instead of something obviously broken. This keeps the same safe,
// structurally-typed stand-in but never lets a name field look like real data.
const NOT_REGISTERED = '(unregistered)';

const missingRecord = <K extends EntityKind>(kind: K, id: string): EntityOf<K> => {
  switch (kind) {
    case 'screen':
      return { id, gameId: {}, kind: 'interior', world: 'light', randomizerName: NOT_REGISTERED, areaId: 'area-000', locationId: 'location-000', tags: [] } as unknown as EntityOf<K>;
    case 'connection':
      return {
        id, screenId: 'screen-000', toConnectionId: 'connection-000', kind: 'edge',
        placement: { form: 'area', rect: { x: 0, y: 0, w: 0, h: 0 }, tiles: [] }, canExit: false, tags: [],
      } as unknown as EntityOf<K>;
    case 'check':
      return { id, gameId: {}, kind: 'chest', screenId: 'screen-000', randomizerName: NOT_REGISTERED, vanillaItemIds: [] } as unknown as EntityOf<K>;
    case 'item':
      return { id, origin: 'vanilla', category: 'junk', randomizerName: NOT_REGISTERED } as unknown as EntityOf<K>;
    case 'dungeon':
      return { id, gameId: {}, randomizerName: NOT_REGISTERED, bossCheckId: 'check-000', roomScreenIds: [] } as unknown as EntityOf<K>;
    case 'area':
      return { id, world: 'light', randomizerName: NOT_REGISTERED } as unknown as EntityOf<K>;
    case 'location':
      return { id, areaId: 'area-000', randomizerName: NOT_REGISTERED } as unknown as EntityOf<K>;
    case 'actor':
      return { id, gameId: {}, kind: 'object', randomizerName: NOT_REGISTERED } as unknown as EntityOf<K>;
    case 'tag':
      return { id, name: NOT_REGISTERED, namespace: '', value: '', label: NOT_REGISTERED, namespaceLabel: '', appliesTo: [] } as unknown as EntityOf<K>;
    default:
      return { id } as unknown as EntityOf<K>;
  }
};

const getScreen = (id: string): ScreenRecord => get('screen', id) ?? missingRecord('screen', id);
const getConnection = (id: string): ConnectionRecord => get('connection', id) ?? missingRecord('connection', id);
const getCheck = (id: string): CheckRecord => get('check', id) ?? missingRecord('check', id);
const getItem = (id: string): ItemRecord => get('item', id) ?? missingRecord('item', id);
const getDungeon = (id: string): DungeonRecord => get('dungeon', id) ?? missingRecord('dungeon', id);
const getArea = (id: string): AreaRecord => get('area', id) ?? missingRecord('area', id);
const getLocation = (id: string): LocationRecord => get('location', id) ?? missingRecord('location', id);
const getActor = (id: string): ActorRecord => get('actor', id) ?? missingRecord('actor', id);
const getTag = (id: string): TagRecord => get('tag', id) ?? missingRecord('tag', id);

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
  all, find, findOne,
  getActor, getActorByGameId, getArea, getCheck, getCheckByGameId, getConnection,
  getDungeon, getDungeonByGameId, getItem, getItemByGameId, getLocation, getScreen, getScreenByGameId,
  getTag,
};
