/* @layer renderer-app @kind constants */
import {
  serializeActorRecord, serializeAreaRecord, serializeCheckRecord, serializeConnectionRecord,
  serializeDungeonRecord, serializeEnumerationRecord, serializeItemGroupRecord, serializeItemRecord,
  serializeLocationRecord, serializeScreenRecord, serializeTagRecord,
} from '@shared/game/data/record-codegen';
import type { EntityKind } from '@shared/game/data';
import { KIND_NAV_ITEMS } from '../../DataInspector.constants';
import type { Serializer } from '../../DataInspector.type';

const SERIALIZERS: Partial<Record<EntityKind, Serializer>> = {
  screen: row => serializeScreenRecord(row as never),
  connection: row => serializeConnectionRecord(row as never),
  check: row => serializeCheckRecord(row as never),
  item: row => serializeItemRecord(row as never),
  dungeon: row => serializeDungeonRecord(row as never),
  area: row => serializeAreaRecord(row as never),
  location: row => serializeLocationRecord(row as never),
  actor: row => serializeActorRecord(row as never),
  tag: row => serializeTagRecord(row as never),
  'item-group': row => serializeItemGroupRecord(row as never),
  enumeration: row => serializeEnumerationRecord(row as never),
};

const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  KIND_NAV_ITEMS.map(item => [item.id, item.label]),
);

export { SERIALIZERS, SOURCE_LABELS };
