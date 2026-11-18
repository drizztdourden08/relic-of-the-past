/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { CapacityFamilyId } from '@rotp/randomizer';
import type { CapacityKind, CheatCategory } from '@app/game';

const TABS = [
  { id: 'player', label: msg('views-cheats:tabs.player') },
  { id: 'items', label: msg('views-cheats:tabs.items') },
  { id: 'rules', label: msg('views-cheats:tabs.rules') },
  { id: 'checks', label: msg('views-cheats:tabs.checks') },
];

const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

const FAMILY_OF_KIND: Record<CapacityKind, CapacityFamilyId> = {
  bombs: 'explosives', arrows: 'projectiles', magic: 'meter', wallet: 'wallet',
};

const VANILLA_METER_RUNGS = [1, 2];

const CAPACITY_RECHECK_MS = 750;
const GATES_RECHECK_MS = 1000;

const CATEGORIES: CheatCategory[] = ['collision', 'items', 'stats', 'combat'];

const CATEGORY_OFF: Record<CheatCategory, Message> = {
  collision: msg('views-cheats:gate.off.collision'),
  items: msg('views-cheats:gate.off.items'),
  stats: msg('views-cheats:gate.off.stats'),
  combat: msg('views-cheats:gate.off.combat'),
};

const SCALE_STEP = 0.25;
const SCALE_MIN = 0.75;
const SCALE_MAX = 2.5;
const SNES_TILE = 8;

const MODULE_DUNGEON = 7;
const MODULE_OVERWORLD = 9;
const MODULE_OVERWORLD_SPECIAL_AREA = 11;
const PLAY_MODULES: ReadonlySet<number> = new Set([MODULE_DUNGEON, MODULE_OVERWORLD, MODULE_OVERWORLD_SPECIAL_AREA]);


export {
  CAPACITY_RECHECK_MS, CATEGORIES, CATEGORY_OFF, FAMILY_OF_KIND, GATES_RECHECK_MS, PLAY_MODULES, SCALE_MAX,
  SCALE_MIN, SCALE_STEP, SNES_TILE, TAB_IDS, TABS, VANILLA_METER_RUNGS,
};
