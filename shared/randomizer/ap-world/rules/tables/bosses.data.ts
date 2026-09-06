/* @layer shared-game @kind data */
/**
 * Boss defeat rules, ported from tests/fixtures/ap-source/Bosses.py
 * (each *DefeatRule, lines 36-157), specialized to the baseline: swordless
 * OFF (the swordless branches drop), glitches no_glitches (the final
 * fight's silverless branch drops). Boss placement is vanilla (boss shuffle
 * off), so the per-dungeon lookup resolves through AP_DUNGEONS' boss column
 * plus the fixed final-tower sub-boss trio (Dungeons.py 169-171).
 */
import {
  allOf, anyOf, hasAnyItem, hasItem,
} from '../combinators';
import {
  canExtendMagic, canShootArrows, canUseBombs, hasBeamSword, hasFireSource,
  hasMeleeWeapon, hasSword,
} from '../../state-helpers';
import { canGetGoodBee } from '../../state-helpers-world';
import { AP_DUNGEONS } from '../../dungeons.data';
import { FINAL_FIGHT_SILVER_HITS } from '../../final-fight.data';
import { ITEM } from '../../item-names.data';
import { itemPowerOf } from '../../item-power/item-power-rule';
import type { Rule } from '../../world.type';

/** Bosses.py 36-46. */
const armosDefeat: Rule = anyOf(
  hasMeleeWeapon,
  (state) => canShootArrows(state),
  allOf(hasItem('Cane of Somaria'), (state) => canExtendMagic(state, 10)),
  allOf(hasItem('Cane of Byrna'), (state) => canExtendMagic(state, 16)),
  allOf(hasItem('Ice Rod'), (state) => canExtendMagic(state, 32)),
  allOf(hasItem('Fire Rod'), (state) => canExtendMagic(state, 32)),
  hasItem('Blue Boomerang'),
  hasItem('Red Boomerang'),
);

/** Bosses.py 49-56. */
const lanmolasDefeat: Rule = anyOf(
  hasMeleeWeapon,
  hasItem('Fire Rod'),
  hasItem('Ice Rod'),
  hasItem('Cane of Somaria'),
  hasItem('Cane of Byrna'),
  (state) => canShootArrows(state),
);

/** Bosses.py 59-60. */
const moldormDefeat: Rule = hasMeleeWeapon;

/** Bosses.py 63-66. */
const helmasaurDefeat: Rule = allOf(
  anyOf((state) => canUseBombs(state, 5), hasItem('Hammer')),
  anyOf(hasSword, (state) => canShootArrows(state)),
);

/** Bosses.py 69-80. */
const arrghusDefeat: Rule = allOf(
  hasItem('Hookshot'),
  anyOf(
    hasMeleeWeapon,
    allOf(hasItem('Fire Rod'), anyOf((state) => canShootArrows(state), (state) => canExtendMagic(state, 12))),
    allOf(hasItem('Ice Rod'), anyOf((state) => canShootArrows(state), (state) => canExtendMagic(state, 16))),
  ),
);

/** Bosses.py 83-92. */
const mothulaDefeat: Rule = anyOf(
  hasMeleeWeapon,
  allOf(hasItem('Fire Rod'), (state) => canExtendMagic(state, 10)),
  allOf(hasItem('Cane of Somaria'), (state) => canExtendMagic(state, 16)),
  allOf(hasItem('Cane of Byrna'), (state) => canExtendMagic(state, 16)),
  canGetGoodBee,
);

/** Bosses.py 95-96. */
const blindDefeat: Rule = anyOf(hasMeleeWeapon, hasItem('Cane of Somaria'), hasItem('Cane of Byrna'));

/** Bosses.py 99-118 — swordless off, so only the sworded branches remain. */
const kholdstareDefeat: Rule = allOf(
  anyOf(hasItem('Fire Rod'), allOf(hasItem('Bombos'), hasSword)),
  anyOf(hasMeleeWeapon, allOf(hasItem('Fire Rod'), (state) => canExtendMagic(state, 20))),
);

/** Bosses.py 121-124. */
const vitreousDefeat: Rule = anyOf(
  allOf((state) => canShootArrows(state), (state) => canUseBombs(state, 10)),
  (state) => canShootArrows(state, 35),
  hasItem('Silver Bow'),
  hasMeleeWeapon,
);

/** Bosses.py 127-132. */
const trinexxDefeat: Rule = allOf(
  hasItem('Fire Rod'),
  hasItem('Ice Rod'),
  anyOf(
    hasItem('Hammer'),
    hasItem('Tempered Sword'),
    hasItem('Golden Sword'),
    allOf(hasItem('Master Sword'), (state) => canExtendMagic(state, 16)),
    allOf(hasSword, (state) => canExtendMagic(state, 32)),
  ),
);

/** Bosses.py 135-136 — both tower fights share it. */
const agahnimDefeat: Rule = anyOf(hasSword, hasItem('Hammer'), hasItem('Bug Catching Net'));

/**
 * The last fight takes a hammer while that switch is on, which is the reference's own
 * swordless branch — see item-power/ and the core hook behind it.
 */
const lastFightTakesHammer: Rule = (state) =>
  itemPowerOf(state.world).hammerLastFight && state.has(ITEM.hammer);

/**
 * Bosses.py 139-156 — no_glitches: the strict silvers path, with the swordless branch.
 * The reference asks for arrows and stops; the last phase takes the final fight's
 * silver shots back to back (final-fight.data.ts), so the arrow capacity has to hold that many
 * at once, and under retro the wallet has to (retro/retro-logic.ts reads the same count).
 */
const ganonDefeat: Rule = allOf(
  anyOf(hasBeamSword, lastFightTakesHammer),
  hasFireSource,
  hasItem('Silver Bow'),
  (state) => canShootArrows(state, FINAL_FIGHT_SILVER_HITS),
);

const BOSS_RULES: ReadonlyMap<string, Rule> = new Map([
  ['Armos Knights', armosDefeat],
  ['Lanmolas', lanmolasDefeat],
  ['Moldorm', moldormDefeat],
  ['Helmasaur King', helmasaurDefeat],
  ['Arrghus', arrghusDefeat],
  ['Mothula', mothulaDefeat],
  ['Blind', blindDefeat],
  ['Kholdstare', kholdstareDefeat],
  ['Vitreous', vitreousDefeat],
  ['Trinexx', trinexxDefeat],
  ['Agahnim', agahnimDefeat],
  ['Agahnim2', agahnimDefeat],
]);

/** Rules.py 149-151: defer to the dungeon's (vanilla-placed) boss. */
const dungeonBossDefeat = (dungeonName: string): Rule => {
  const dungeon = AP_DUNGEONS.find((entry) => entry.name === dungeonName);
  if (dungeon === undefined || dungeon.boss === null) {
    throw new Error(`no boss for dungeon: ${dungeonName}`);
  }
  const rule = BOSS_RULES.get(dungeon.boss);
  if (rule === undefined) throw new Error(`no defeat rule for boss: ${dungeon.boss}`);
  return rule;
};

/** Dungeons.py 169-171 — the fixed sub-boss trio of the final tower. */
const FINAL_TOWER_SUB_BOSSES = {
  bottom: armosDefeat,
  middle: lanmolasDefeat,
  top: moldormDefeat,
} as const;

export { BOSS_RULES, dungeonBossDefeat, FINAL_TOWER_SUB_BOSSES, ganonDefeat, lastFightTakesHammer };
