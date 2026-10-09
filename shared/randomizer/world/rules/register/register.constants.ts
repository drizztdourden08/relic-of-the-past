/* @layer shared-game @kind constants */
import { GLOBAL_MISC_RULES } from '../tables/global-misc.data';
import { DEFAULT_OVERWORLD_RULES } from '../tables/default-overworld.data';
import { STANDARD_RULES } from '../tables/standard.data';
import { LAMP_RULES } from '../tables/lamps.data';
import { COMPLETION_RULES } from '../tables/completion.data';
import { FIRST_CASTLE_RULES } from '../tables/dungeon-first-castle.data';
import { CASTLE_TOWER_RULES } from '../tables/dungeon-castle-tower.data';
import { EAST_PALACE_RULES } from '../tables/dungeon-east-palace.data';
import { DESERT_PALACE_RULES } from '../tables/dungeon-desert-palace.data';
import { MOUNTAIN_TOWER_RULES } from '../tables/dungeon-mountain-tower.data';
import { DARK_PALACE_RULES } from '../tables/dungeon-dark-palace.data';
import { SWAMP_RULES } from '../tables/dungeon-swamp.data';
import { WOODS_RULES } from '../tables/dungeon-woods.data';
import { THIEVES_DEN_RULES } from '../tables/dungeon-thieves-den.data';
import { ICE_RULES } from '../tables/dungeon-ice.data';
import { MIRE_RULES } from '../tables/dungeon-mire.data';
import { TURTLE_RULES } from '../tables/dungeon-turtle.data';
import { FINAL_TOWER_RULES } from '../tables/dungeon-final-tower.data';
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
