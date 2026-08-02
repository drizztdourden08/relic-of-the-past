/* @layer renderer-app @kind data */
/**
 * The per-collection diffs over the derived schema — and only where derivation
 * genuinely needs a nudge.
 *
 * Four collections are deliberately absent. Areas and locations derive three
 * top-level fields each, all of them meaningful in a cell and already in a
 * sensible order, so a config for them would restate what derivation said and
 * then have to be maintained alongside it. Item-group and enumeration are the
 * same story: item-group's three fields (`id`, `label`, `memberIds`) and
 * enumeration's five (`id`, `category`, `value`, `label`, `appliesTo`) already
 * derive in the exact shape and order a browsing session wants. A missing
 * entry here is a statement that the auto-layout was right, not an omission.
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
