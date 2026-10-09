/* @layer renderer-app @kind constants */
import { get, KIND_ID_PREFIXES } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import { ENTITY_KINDS } from '../../DataInspector.constants';
import type { NamedRecord } from '../../DataInspector.type';
import { getEnumerationRecord } from './get-enumeration-record';
import { getItemGroupRecord } from './get-item-group-record';

const RECORD_GETTERS: Record<EntityKind, (id: string) => NamedRecord | undefined> = {
  screen: (id) => get('screen', id),
  connection: (id) => get('connection', id),
  check: (id) => get('check', id),
  item: (id) => get('item', id),
  dungeon: (id) => get('dungeon', id),
  area: (id) => get('area', id),
  location: (id) => get('location', id),
  region: (id) => get('region', id),
  actor: (id) => get('actor', id),
  tag: (id) => get('tag', id),
  'item-group': getItemGroupRecord,
  enumeration: getEnumerationRecord,
};

const PREFIX_TO_KIND: Record<string, EntityKind> = Object.fromEntries(
  ENTITY_KINDS.map(kind => [KIND_ID_PREFIXES[kind], kind]),
);

export { PREFIX_TO_KIND, RECORD_GETTERS };
