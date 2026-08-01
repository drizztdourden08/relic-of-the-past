/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { ACTOR_COLUMNS } from './actor-columns';
import { AREA_COLUMNS } from './area-columns';
import { CHECK_COLUMNS } from './check-columns';
import { CONNECTION_COLUMNS } from './connection-columns';
import { DUNGEON_COLUMNS } from './dungeon-columns';
import { ITEM_COLUMNS } from './item-columns';
import { LOCATION_COLUMNS } from './location-columns';
import { SCREEN_COLUMNS } from './screen-columns';
import type { Column } from './columns.type';

const COLUMNS_BY_KIND: Record<EntityKind, Column[]> = {
  screen: SCREEN_COLUMNS,
  connection: CONNECTION_COLUMNS,
  check: CHECK_COLUMNS,
  item: ITEM_COLUMNS,
  dungeon: DUNGEON_COLUMNS,
  area: AREA_COLUMNS,
  location: LOCATION_COLUMNS,
  actor: ACTOR_COLUMNS,
};

/** The scannable column set for one entity kind — deliberately different per kind, not one generic dump. */
const getColumnsForKind = (kind: EntityKind): Column[] => COLUMNS_BY_KIND[kind];

export { getColumnsForKind };
