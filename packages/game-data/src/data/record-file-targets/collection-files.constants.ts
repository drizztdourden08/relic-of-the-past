/* @layer shared-game @kind constants */
import type { ActorKind } from '../types';
import type { ItemCategory } from '../taxonomy/item-categories';

const ITEM_CATEGORY_FILES: Readonly<Record<ItemCategory, string>> = {
  crystal: 'prizes', medallion: 'progression', event: 'progression', bottle: 'bottles',
  key: 'keys', weapon: 'weapons', equipment: 'equipment', upgrade: 'capacity', junk: 'junk',
};

const BY_CATEGORY_ONLY: readonly ItemCategory[] = ['crystal', 'medallion', 'event', 'bottle', 'key'];

const ACTOR_KIND_FILES: Readonly<Record<ActorKind, string>> = {
  enemy: 'enemies', object: 'objects', trigger: 'triggers', boss: 'bosses',
  npc: 'npcs', obstacle: 'obstacles',
};

export { ACTOR_KIND_FILES, BY_CATEGORY_ONLY, ITEM_CATEGORY_FILES };
