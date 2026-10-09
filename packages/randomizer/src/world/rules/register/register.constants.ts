/* @layer shared-game @kind constants */
import { GLOBAL_MISC_RULES } from '../tables/global-misc';
import { DEFAULT_OVERWORLD_RULES } from '../tables/default-overworld';
import { STANDARD_RULES } from '../tables/standard';
import { LAMP_RULES } from '../tables/lamps';
import { COMPLETION_RULES } from '../tables/completion';
import { FIRST_CASTLE_RULES } from '../tables/dungeon-first-castle';
import { CASTLE_TOWER_RULES } from '../tables/dungeon-castle-tower';
import { EAST_PALACE_RULES } from '../tables/dungeon-east-palace';
import { DESERT_PALACE_RULES } from '../tables/dungeon-desert-palace';
import { MOUNTAIN_TOWER_RULES } from '../tables/dungeon-mountain-tower';
import { DARK_PALACE_RULES } from '../tables/dungeon-dark-palace';
import { SWAMP_RULES } from '../tables/dungeon-swamp';
import { WOODS_RULES } from '../tables/dungeon-woods';
import { THIEVES_DEN_RULES } from '../tables/dungeon-thieves-den';
import { ICE_RULES } from '../tables/dungeon-ice';
import { MIRE_RULES } from '../tables/dungeon-mire';
import { TURTLE_RULES } from '../tables/dungeon-turtle';
import { FINAL_TOWER_RULES } from '../tables/dungeon-final-tower';
import type { RuleEntry } from '../rule-entry.type';

const RULE_TABLES: readonly (readonly RuleEntry[])[] = [
  GLOBAL_MISC_RULES,
  FIRST_CASTLE_RULES,
  CASTLE_TOWER_RULES,
  EAST_PALACE_RULES,
  DESERT_PALACE_RULES,
  MOUNTAIN_TOWER_RULES,
  DARK_PALACE_RULES,
  SWAMP_RULES,
  WOODS_RULES,
  THIEVES_DEN_RULES,
  ICE_RULES,
  MIRE_RULES,
  TURTLE_RULES,
  FINAL_TOWER_RULES,
  DEFAULT_OVERWORLD_RULES,
  STANDARD_RULES,
  COMPLETION_RULES,
  LAMP_RULES,
];

export { RULE_TABLES };
