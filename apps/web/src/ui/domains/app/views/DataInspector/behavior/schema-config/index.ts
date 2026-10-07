/* @layer renderer-app @kind data */
/**
 * Per-collection diffs over the derived schema. Area, location, item-group and
 * enumeration are absent on purpose: their derived layout is already right,
 * and a config would only restate it.
 */
import type { EntityKind } from '@shared/game/data';
import type { SchemaConfig } from '@ds/data';
import { ACTOR_CONFIG } from './actor-config';
import { CHECK_CONFIG } from './check-config';
import { CONNECTION_CONFIG } from './connection-config';
import { DUNGEON_CONFIG } from './dungeon-config';
import { ITEM_CONFIG } from './item-config';
import { SCREEN_CONFIG } from './screen-config';
import { TAG_CONFIG } from './tag-config';

const SCHEMA_CONFIGS: Partial<Record<EntityKind, SchemaConfig>> = {
  screen: SCREEN_CONFIG,
  connection: CONNECTION_CONFIG,
  check: CHECK_CONFIG,
  item: ITEM_CONFIG,
  dungeon: DUNGEON_CONFIG,
  actor: ACTOR_CONFIG,
  tag: TAG_CONFIG,
};

export { SCHEMA_CONFIGS };
