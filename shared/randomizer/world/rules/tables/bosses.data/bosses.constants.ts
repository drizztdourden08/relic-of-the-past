/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem,
} from '../../combinators';
import {
  arrows, bombs, canGetGoodBee, hasBeamSword, hasFireSource, hasMeleeWeapon, hasSword, magic,
} from '../../helper-rules';
import { compileRule } from '../../rule-eval';
import { all, has, option } from '../../rule-node-build';
import { FINAL_FIGHT_SILVER_HITS } from '../../../final-fight.constants';
import type { ActorId } from '@shared/game/data/types/ids';
import type { Rule } from '../../../world.type';

const armosDefeat: Rule = anyOf(
  hasMeleeWeapon,
  arrows(),
  allOf(hasItem(ITEM.caneOfSomaria), magic(10)),
  allOf(hasItem(ITEM.caneOfByrna), magic(16)),
  allOf(hasItem(ITEM.iceRod), magic(32)),
  allOf(hasItem(ITEM.fireRod), magic(32)),
  hasItem(ITEM.blueBoomerang),
  hasItem(ITEM.redBoomerang),
);

const lanmolasDefeat: Rule = anyOf(
  hasMeleeWeapon,
  hasItem(ITEM.fireRod),
  hasItem(ITEM.iceRod),
  hasItem(ITEM.caneOfSomaria),
  hasItem(ITEM.caneOfByrna),
  arrows(),
);

const moldormDefeat: Rule = hasMeleeWeapon;

const helmasaurDefeat: Rule = allOf(
  anyOf(bombs(5), hasItem(ITEM.hammer)),
  anyOf(hasSword, arrows()),
);

const arrghusDefeat: Rule = allOf(
  hasItem(ITEM.hookshot),
  anyOf(
    hasMeleeWeapon,
    allOf(hasItem(ITEM.fireRod), anyOf(arrows(), magic(12))),
    allOf(hasItem(ITEM.iceRod), anyOf(arrows(), magic(16))),
  ),
);

const mothulaDefeat: Rule = anyOf(
  hasMeleeWeapon,
  allOf(hasItem(ITEM.fireRod), magic(10)),
  allOf(hasItem(ITEM.caneOfSomaria), magic(16)),
  allOf(hasItem(ITEM.caneOfByrna), magic(16)),
  canGetGoodBee,
);

const blindDefeat: Rule = anyOf(hasMeleeWeapon, hasItem(ITEM.caneOfSomaria), hasItem(ITEM.caneOfByrna));

const kholdstareDefeat: Rule = allOf(
  anyOf(hasItem(ITEM.fireRod), allOf(hasItem(ITEM.bombos), hasSword)),
  anyOf(hasMeleeWeapon, allOf(hasItem(ITEM.fireRod), magic(20))),
);

const vitreousDefeat: Rule = anyOf(
  allOf(arrows(), bombs(10)),
  arrows(35),
  hasItem(ITEM.silverBow),
  hasMeleeWeapon,
);

const trinexxDefeat: Rule = allOf(
  hasItem(ITEM.fireRod),
  hasItem(ITEM.iceRod),
  anyOf(
    hasItem(ITEM.hammer),
    hasItem(ITEM.temperedSword),
    hasItem(ITEM.goldenSword),
    allOf(hasItem(ITEM.masterSword), magic(16)),
    allOf(hasSword, magic(32)),
  ),
);

const agahnimDefeat: Rule = anyOf(hasSword, hasItem(ITEM.hammer), hasItem(ITEM.bugCatchingNet));

const lastFightTakesHammer: Rule = compileRule(all(option('itemPower.hammerLastFight', true), has(ITEM.hammer)));

const ganonDefeat: Rule = allOf(
  anyOf(hasBeamSword, lastFightTakesHammer),
  hasFireSource,
  hasItem(ITEM.silverBow),
  arrows(FINAL_FIGHT_SILVER_HITS),
);

const BOSS_RULES: ReadonlyMap<ActorId, Rule> = new Map<ActorId, Rule>([
  ['actor-138', armosDefeat],
  ['actor-139', lanmolasDefeat],
  ['actor-137', moldormDefeat],
  ['actor-143', helmasaurDefeat],
  ['actor-142', arrghusDefeat],
  ['actor-141', mothulaDefeat],
  ['actor-149', blindDefeat],
  ['actor-144', kholdstareDefeat],
  ['actor-145', vitreousDefeat],
  ['actor-146', trinexxDefeat],
  ['actor-147', trinexxDefeat],
  ['actor-148', trinexxDefeat],
  ['actor-140', agahnimDefeat],
]);

const FINAL_TOWER_SUB_BOSSES = {
  bottom: armosDefeat,
  middle: lanmolasDefeat,
  top: moldormDefeat,
} as const;

export { BOSS_RULES, FINAL_TOWER_SUB_BOSSES, ganonDefeat, lastFightTakesHammer };
