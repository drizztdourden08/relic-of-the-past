/* @layer renderer-app @kind data */
import type { EntityKind } from '@rotp/game-data';
import type { SchemaConfig } from '@drizztdourden08/tessera/data';
import { ACTOR_CONFIG } from './actor-config';
import { CHECK_CONFIG } from './check-config';
import { CONNECTION_CONFIG } from './connection-config';
import { DUNGEON_CONFIG } from './dungeon-config';
import { ITEM_CONFIG } from './item-config';
import { SCREEN_CONFIG } from './screen-config.constants';
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
