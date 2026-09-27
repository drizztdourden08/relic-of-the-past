/* @layer shared-game @kind data */
/**
 * Non-dungeon rows of Archipelago worlds/alttp/Rules.py global_rules
 * (lines 200-303, 620), baseline options: enemy shuffle off, enemy health
 * default, pot shuffle off, can_take_damage true. Constant sub-terms the
 * fixed options force true are collapsed with a citation.
 */
import { ITEM } from '../../item-ids.data';
import { REGION } from '../../region-ids.data';
import {
  allOf, anyOf, canCollect, canReach, hasItem,
} from '../combinators';
import {
  canBombOrBonk, canExtendMagic, canLiftRocks, canShootArrows, canUseBombs, hasBeamSword, hasHearts,
} from '../../state-helpers';
import { canKillMostThings, canRetrieveTablet } from '../../state-helpers-world';
import { pedestalRule, sahasrahlaRule } from '../story-gate-rules';
import { BOTTLE_ITEMS } from '../../item-groups';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (quantity = 1) => (state: CollectionState): boolean => canUseBombs(state, quantity);
const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

const GLOBAL_MISC_RULES: readonly RuleEntry[] = [
  // 216-221: the mountain S&Q spot opens once its cave dweller is reachable.
  { kind: 'exit', target: 'Old Man S&Q', mode: 'set', rule: canCollect('check-060') },
  // 223-226
  { kind: 'location', target: 'check-009', mode: 'set', rule: hasItem(ITEM.openFloodgate) },
  { kind: 'location', target: 'check-337', mode: 'set', rule: hasItem(ITEM.returnSmith) },
  { kind: 'location', target: 'check-010', mode: 'set', rule: hasItem(ITEM.pickUpPurpleChest) },
  // 227-228
  { kind: 'location', target: 'check-070', mode: 'set', rule: canRetrieveTablet },
  {
    kind: 'location', target: 'check-072', mode: 'set',
    rule: pedestalRule,
  },
  // 230-234
  {
    kind: 'location', target: 'check-336', mode: 'set',
    rule: allOf(hasItem(ITEM.getFrog), canReach(REGION.blacksmithsHut)),
  },
  { kind: 'location', target: 'check-039', mode: 'set', rule: hasItem(ITEM.returnSmith) },
  { kind: 'location', target: 'check-040', mode: 'set', rule: hasItem(ITEM.magicPowder) },
  { kind: 'location', target: 'check-041', mode: 'set', rule: (state) => state.hasGroup(BOTTLE_ITEMS) },
  { kind: 'location', target: 'check-055', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  // 239-244: enemy shuffle off, enemy health default → the bombs branch stays.
  {
    kind: 'location', target: 'check-074', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), anyOf(
      bombs(4), (state) => canShootArrows(state), hasItem(ITEM.caneOfSomaria), hasBeamSword,
    )),
  },
  // 246
  { kind: 'location', target: 'check-033', mode: 'set', rule: sahasrahlaRule },
  // 248-252
  { kind: 'location', target: 'check-029', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-012', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-028', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-034', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-046', mode: 'set', rule: bombs() },
  // 253-255
  { kind: 'location', target: 'check-030', mode: 'set', rule: canBombOrBonk },
  { kind: 'location', target: 'check-031', mode: 'set', rule: canBombOrBonk },
  { kind: 'location', target: 'check-032', mode: 'set', rule: canBombOrBonk },
  // 256-270
  ...['check-063', 'check-064', 'check-065',
    'check-066', 'check-062'].map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: anyOf(bombs(), hasBeamSword, (state) => canShootArrows(state),
      hasItem(ITEM.fireRod), hasItem(ITEM.caneOfSomaria)),
  })),
  // 271-272
  { kind: 'location', target: 'check-067', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-068', mode: 'set', rule: bombs() },
  // 273-277
  ...['check-048', 'check-049', 'check-051',
    'check-050', 'check-052'].map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set', rule: kill(4),
  })),
  // 278-281
  { kind: 'location', target: 'check-087', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-086', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-085', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-084', mode: 'set', rule: bombs() },
  // 282-285
  { kind: 'exit', target: 'Light World Death Mountain Shop', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Two Brothers House Exit (West)', mode: 'set', rule: canBombOrBonk },
  { kind: 'exit', target: 'Two Brothers House Exit (East)', mode: 'set', rule: canBombOrBonk },
  // 287-293: can_take_damage is true in the baseline (no OHKO timer).
  {
    kind: 'location', target: 'check-075', mode: 'set',
    rule: allOf(
      hasItem(ITEM.hammer),
      canLiftRocks,
      anyOf(
        allOf(hasItem(ITEM.cape), (state) => canExtendMagic(state, 16)),
        allOf(
          hasItem(ITEM.caneOfByrna),
          anyOf(
            (state) => canExtendMagic(state, 12),
            anyOf(hasItem(ITEM.pegasusBoots), (state) => hasHearts(state, 4)),
          ),
        ),
      ),
    ),
  },
  // 295-302
  { kind: 'exit', target: 'Hookshot Cave Bomb Wall (North)', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Hookshot Cave Bomb Wall (South)', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-093', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'location', target: 'check-094', mode: 'set', rule: hasItem(ITEM.hookshot) },
  {
    kind: 'location', target: 'check-095', mode: 'set',
    rule: anyOf(hasItem(ITEM.hookshot), hasItem(ITEM.pegasusBoots)),
  },
  { kind: 'location', target: 'check-096', mode: 'set', rule: hasItem(ITEM.hookshot) },
  // 620
  { kind: 'location', target: 'check-324', mode: 'set', rule: hasItem(ITEM.flute) },
];

export { GLOBAL_MISC_RULES };
