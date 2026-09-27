/* @layer shared-game @kind data */
/**
 * Boss defeat rules, ported from Archipelago worlds/alttp/Bosses.py
 * (each *DefeatRule, lines 36-157), specialized to the baseline: swordless
 * OFF (the swordless branches drop), glitches no_glitches (the final
 * fight's silverless branch drops). Boss placement is vanilla (boss shuffle
 * off), so the per-dungeon lookup reads the boss off the dungeon record
 * (`DungeonRecord.bossActorId`) and finds the rule by that actor, plus the fixed
 * final-tower sub-boss trio (Dungeons.py 169-171).
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasAnyItem, hasItem,
} from '../combinators';
import {
  canExtendMagic, canShootArrows, canUseBombs, hasBeamSword, hasFireSource,
  hasMeleeWeapon, hasSword,
} from '../../state-helpers';
import { canGetGoodBee } from '../../state-helpers-world';
import { getDungeon } from '@shared/game/data';
import { FINAL_FIGHT_SILVER_HITS } from '../../final-fight.data';
import { itemPowerOf } from '../../item-power/item-power-rule';
import type { ActorId, DungeonId } from '@shared/game/data/types/ids';
import type { Rule } from '../../world.type';

/** Bosses.py 36-46. */
const armosDefeat: Rule = anyOf(
  hasMeleeWeapon,
  (state) => canShootArrows(state),
  allOf(hasItem(ITEM.caneOfSomaria), (state) => canExtendMagic(state, 10)),
  allOf(hasItem(ITEM.caneOfByrna), (state) => canExtendMagic(state, 16)),
  allOf(hasItem(ITEM.iceRod), (state) => canExtendMagic(state, 32)),
  allOf(hasItem(ITEM.fireRod), (state) => canExtendMagic(state, 32)),
  hasItem(ITEM.blueBoomerang),
  hasItem(ITEM.redBoomerang),
);

/** Bosses.py 49-56. */
const lanmolasDefeat: Rule = anyOf(
  hasMeleeWeapon,
  hasItem(ITEM.fireRod),
  hasItem(ITEM.iceRod),
  hasItem(ITEM.caneOfSomaria),
  hasItem(ITEM.caneOfByrna),
  (state) => canShootArrows(state),
);

/** Bosses.py 59-60. */
const moldormDefeat: Rule = hasMeleeWeapon;

/** Bosses.py 63-66. */
const helmasaurDefeat: Rule = allOf(
  anyOf((state) => canUseBombs(state, 5), hasItem(ITEM.hammer)),
  anyOf(hasSword, (state) => canShootArrows(state)),
);

/** Bosses.py 69-80. */
const arrghusDefeat: Rule = allOf(
  hasItem(ITEM.hookshot),
  anyOf(
    hasMeleeWeapon,
    allOf(hasItem(ITEM.fireRod), anyOf((state) => canShootArrows(state), (state) => canExtendMagic(state, 12))),
    allOf(hasItem(ITEM.iceRod), anyOf((state) => canShootArrows(state), (state) => canExtendMagic(state, 16))),
  ),
);

/** Bosses.py 83-92. */
const mothulaDefeat: Rule = anyOf(
  hasMeleeWeapon,
  allOf(hasItem(ITEM.fireRod), (state) => canExtendMagic(state, 10)),
  allOf(hasItem(ITEM.caneOfSomaria), (state) => canExtendMagic(state, 16)),
  allOf(hasItem(ITEM.caneOfByrna), (state) => canExtendMagic(state, 16)),
  canGetGoodBee,
);

/** Bosses.py 95-96. */
const blindDefeat: Rule = anyOf(hasMeleeWeapon, hasItem(ITEM.caneOfSomaria), hasItem(ITEM.caneOfByrna));

/** Bosses.py 99-118: swordless off, so only the sworded branches remain. */
const kholdstareDefeat: Rule = allOf(
  anyOf(hasItem(ITEM.fireRod), allOf(hasItem(ITEM.bombos), hasSword)),
  anyOf(hasMeleeWeapon, allOf(hasItem(ITEM.fireRod), (state) => canExtendMagic(state, 20))),
);

/** Bosses.py 121-124. */
const vitreousDefeat: Rule = anyOf(
  allOf((state) => canShootArrows(state), (state) => canUseBombs(state, 10)),
  (state) => canShootArrows(state, 35),
  hasItem(ITEM.silverBow),
  hasMeleeWeapon,
);

/** Bosses.py 127-132. */
const trinexxDefeat: Rule = allOf(
  hasItem(ITEM.fireRod),
  hasItem(ITEM.iceRod),
  anyOf(
    hasItem(ITEM.hammer),
    hasItem(ITEM.temperedSword),
    hasItem(ITEM.goldenSword),
    allOf(hasItem(ITEM.masterSword), (state) => canExtendMagic(state, 16)),
    allOf(hasSword, (state) => canExtendMagic(state, 32)),
  ),
);

/** Bosses.py 135-136: both tower fights share it. */
const agahnimDefeat: Rule = anyOf(hasSword, hasItem(ITEM.hammer), hasItem(ITEM.bugCatchingNet));

/**
 * The last fight takes a hammer while that switch is on, which is the reference's own
 * swordless branch, see item-power/ and the core hook behind it.
 */
const lastFightTakesHammer: Rule = (state) =>
  itemPowerOf(state.world).hammerLastFight && state.has(ITEM.hammer);

/**
 * Bosses.py 139-156: no_glitches, the strict silvers path, with the swordless branch.
 * The reference asks for arrows and stops; the last phase takes the final fight's
 * silver shots back to back (final-fight.data.ts), so the arrow capacity has to hold that many
 * at once, and under retro the wallet has to (retro/retro-logic.ts reads the same count).
 */
const ganonDefeat: Rule = allOf(
  anyOf(hasBeamSword, lastFightTakesHammer),
  hasFireSource,
  hasItem(ITEM.silverBow),
  (state) => canShootArrows(state, FINAL_FIGHT_SILVER_HITS),
);

/**
 * A defeat rule per boss ACTOR, which is what a dungeon record names.
 *
 * The three-headed boss of the mountain dungeon is three actors and one fight, so all three
 * heads resolve to the one rule; the two tower fights are one actor and resolve to one rule
 * the same way.
 */
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

/** Rules.py 149-151: defer to the dungeon's (vanilla-placed) boss, read off its record. */
const dungeonBossDefeat = (dungeonId: DungeonId): Rule => {
  const boss = getDungeon(dungeonId).bossActorId;
  if (boss === undefined) throw new Error(`no boss for dungeon: ${dungeonId}`);
  const rule = BOSS_RULES.get(boss);
  if (rule === undefined) throw new Error(`no defeat rule for boss: ${boss}`);
  return rule;
};

/** Dungeons.py 169-171: the fixed sub-boss trio of the final tower. */
const FINAL_TOWER_SUB_BOSSES = {
  bottom: armosDefeat,
  middle: lanmolasDefeat,
  top: moldormDefeat,
} as const;

export { BOSS_RULES, dungeonBossDefeat, FINAL_TOWER_SUB_BOSSES, ganonDefeat, lastFightTakesHammer };
