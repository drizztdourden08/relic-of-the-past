/* @layer shared-game @kind constants */
import type { EntityKind } from './ids.type';

const ID_PAD_WIDTH = 3;

const KIND_ID_PREFIXES: Record<EntityKind, string> = {
  screen: 'screen',
  connection: 'connection',
  check: 'check',
  item: 'item',
  dungeon: 'dungeon',
  area: 'area',
  location: 'location',
  region: 'region',
  actor: 'actor',
  tag: 'tag',
  'item-group': 'ig',
  enumeration: 'enum',
};

export { ID_PAD_WIDTH, KIND_ID_PREFIXES };
