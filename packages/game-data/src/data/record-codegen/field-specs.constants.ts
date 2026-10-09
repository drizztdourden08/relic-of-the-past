/* @layer shared-game @kind constants */
import type {
  ActorRecord, AreaRecord, CheckRecord, ConnectionRecord, DungeonRecord, EnumerationEntry, ItemGroupRecord, ItemRecord,
  LocationRecord, ScreenRecord, TagRecord,
} from '../types';
import type { FieldSpec } from './record-codegen.type';
import {
  ACTOR_FIELDS, AREA_FIELDS, CHECK_FIELDS, CONNECTION_FIELDS, DUNGEON_FIELDS, ENUMERATION_FIELDS, ITEM_FIELDS,
  ITEM_GROUP_FIELDS, LOCATION_FIELDS, SCREEN_FIELDS, TAG_FIELDS,
} from './record-codegen.constants';

const SCREEN_SPEC: FieldSpec<ScreenRecord> = {
  order: SCREEN_FIELDS,
  known: Object.fromEntries(SCREEN_FIELDS.map(f => [f, true])) as Record<(typeof SCREEN_FIELDS)[number], true>,
};

const CONNECTION_SPEC: FieldSpec<ConnectionRecord> = {
  order: CONNECTION_FIELDS,
  known: Object.fromEntries(CONNECTION_FIELDS.map(f => [f, true])) as Record<(typeof CONNECTION_FIELDS)[number], true>,
};

const AREA_SPEC: FieldSpec<AreaRecord> = {
  order: AREA_FIELDS,
  known: Object.fromEntries(AREA_FIELDS.map(f => [f, true])) as Record<(typeof AREA_FIELDS)[number], true>,
};

const LOCATION_SPEC: FieldSpec<LocationRecord> = {
  order: LOCATION_FIELDS,
  known: Object.fromEntries(LOCATION_FIELDS.map(f => [f, true])) as Record<(typeof LOCATION_FIELDS)[number], true>,
};

const TAG_SPEC: FieldSpec<TagRecord> = {
  order: TAG_FIELDS,
  known: Object.fromEntries(TAG_FIELDS.map(f => [f, true])) as Record<(typeof TAG_FIELDS)[number], true>,
};

const ITEM_GROUP_SPEC: FieldSpec<ItemGroupRecord> = {
  order: ITEM_GROUP_FIELDS,
  known: Object.fromEntries(ITEM_GROUP_FIELDS.map(f => [f, true])) as Record<(typeof ITEM_GROUP_FIELDS)[number], true>,
};

const ENUMERATION_SPEC: FieldSpec<EnumerationEntry> = {
  order: ENUMERATION_FIELDS,
  known: Object.fromEntries(ENUMERATION_FIELDS.map(f => [f, true])) as Record<(typeof ENUMERATION_FIELDS)[number], true>,
};

const CHECK_SPEC: FieldSpec<CheckRecord> = {
  order: CHECK_FIELDS,
  known: Object.fromEntries(CHECK_FIELDS.map(f => [f, true])) as Record<(typeof CHECK_FIELDS)[number], true>,
};

const ITEM_SPEC: FieldSpec<ItemRecord> = {
  order: ITEM_FIELDS,
  known: Object.fromEntries(ITEM_FIELDS.map(f => [f, true])) as Record<(typeof ITEM_FIELDS)[number], true>,
};

const DUNGEON_SPEC: FieldSpec<DungeonRecord> = {
  order: DUNGEON_FIELDS,
  known: Object.fromEntries(DUNGEON_FIELDS.map(f => [f, true])) as Record<(typeof DUNGEON_FIELDS)[number], true>,
};

const ACTOR_SPEC: FieldSpec<ActorRecord> = {
  order: ACTOR_FIELDS,
  known: Object.fromEntries(ACTOR_FIELDS.map(f => [f, true])) as Record<(typeof ACTOR_FIELDS)[number], true>,
};

export {
  ACTOR_SPEC, AREA_SPEC, CHECK_SPEC, CONNECTION_SPEC, DUNGEON_SPEC, ENUMERATION_SPEC, ITEM_GROUP_SPEC, ITEM_SPEC,
  LOCATION_SPEC, SCREEN_SPEC, TAG_SPEC,
};
