/* @layer renderer-app @kind logic */
import {
  getActor, getArea, getCheck, getConnection, getDungeon, getItem, getLocation, getScreen,
} from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';

const ENTITY_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor',
];

/** A named record, loosely — every kind carries some subset of these name fields. */
interface NamedRecord {
  vanillaName?: string;
  randomizerName?: string;
  name?: string;
}

const GETTERS: Record<EntityKind, (id: string) => NamedRecord> = {
  screen: getScreen,
  connection: getConnection,
  check: getCheck,
  item: getItem,
  dungeon: getDungeon,
  area: getArea,
  location: getLocation,
  actor: getActor,
};

/**
 * An id's own kind prefix ('screen-014' -> 'screen') IS its EntityKind — ids
 * are never synthesized any other way (see the screen-id convention in
 * CLAUDE.md), so parsing the prefix is exact, not a guess.
 */
const entityKindFromId = (id: string): EntityKind | undefined => {
  const prefix = id.slice(0, id.indexOf('-'));
  return ENTITY_KINDS.find(kind => kind === prefix);
};

/** The display name an id resolves to, for link text — falls back to the id itself. */
const resolveRecordLabel = (id: string): string => {
  const kind = entityKindFromId(id);
  if (!kind) return id;
  const record = GETTERS[kind](id);
  return record.vanillaName ?? record.randomizerName ?? record.name ?? id;
};

export { entityKindFromId, resolveRecordLabel };
