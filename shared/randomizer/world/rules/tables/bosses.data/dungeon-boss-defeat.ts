/* @layer shared-game @kind logic */
import { getDungeon } from '@shared/game/data';
import { BOSS_RULES } from './bosses.constants';
import type { DungeonId } from '@shared/game/data/types/ids';
import type { Rule } from '../../../world.type';

const dungeonBossDefeat = (dungeonId: DungeonId): Rule => {
  const boss = getDungeon(dungeonId).bossActorId;
  if (boss === undefined) throw new Error(`no boss for dungeon: ${dungeonId}`);
  const rule = BOSS_RULES.get(boss);
  if (rule === undefined) throw new Error(`no defeat rule for boss: ${boss}`);
  return rule;
};

export { dungeonBossDefeat };
