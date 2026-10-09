/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, either, hasItem, hasKeys, placedAt,
} from '../../combinators';
import {
  arrows, bombs, canActivateCrystalSwitch, hasFireSource, hasSword, hearts,
} from '../../helper-rules';
import { actGate } from '../../../events';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const BIG_KEY_LOCKS_WEST = anyOf(
  placedAt('check-213', ITEM.bigKeyMiseryMire),
  placedAt('check-214', ITEM.bigKeyMiseryMire),
);

const MIRE_RULES: readonly RuleEntry[] = [
  {
    kind: 'exit', target: 'Misery Mire', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), actGate('check-344')),
  },
  {
    kind: 'exit', target: 'Misery Mire Entrance Gap', mode: 'set',
    rule: allOf(
      anyOf(hasItem(ITEM.pegasusBoots), hasItem(ITEM.hookshot)),
      anyOf(
        hasSword, hasItem(ITEM.fireRod), hasItem(ITEM.iceRod), hasItem(ITEM.hammer),
        hasItem(ITEM.caneOfSomaria), arrows(),
      ),
    ),
  },
  {
    kind: 'location', target: 'check-218', mode: 'set',
    rule: anyOf(hasItem(ITEM.bigKeyMiseryMire), hasKeys(ITEM.smallKeyMiseryMire, 4)),
  },
  { kind: 'location', target: 'check-208', mode: 'set', rule: hasItem(ITEM.bigKeyMiseryMire) },
  {
    kind: 'location', target: 'check-212', mode: 'set',
    rule: anyOf(
      hearts(4),
      hasItem(ITEM.caneOfByrna),
      hasItem(ITEM.cape),
    ),
  },
  { kind: 'exit', target: 'Misery Mire Big Key Door', mode: 'set', rule: hasItem(ITEM.bigKeyMiseryMire) },
  {
    kind: 'location', target: 'check-209', mode: 'set',
    rule: anyOf(
      allOf(hasKeys(ITEM.smallKeyMiseryMire, 2), canActivateCrystalSwitch),
      hasKeys(ITEM.smallKeyMiseryMire, 4),
    ),
  },
  {
    kind: 'location', target: 'check-210', mode: 'set',
    rule: anyOf(
      allOf(hasKeys(ITEM.smallKeyMiseryMire, 3), canActivateCrystalSwitch),
      hasKeys(ITEM.smallKeyMiseryMire, 5),
    ),
  },
  {
    kind: 'location', target: 'check-219', mode: 'set',
    rule: either(
      anyOf(BIG_KEY_LOCKS_WEST, placedAt('check-219', ITEM.bigKeyMiseryMire)),
      hasKeys(ITEM.smallKeyMiseryMire, 4),
      hasKeys(ITEM.smallKeyMiseryMire, 5),
    ),
  },
  {
    kind: 'exit', target: 'Misery Mire (West)', mode: 'set',
    rule: either(
      BIG_KEY_LOCKS_WEST,
      hasKeys(ITEM.smallKeyMiseryMire, 5),
      hasKeys(ITEM.smallKeyMiseryMire, 6),
    ),
  },
  { kind: 'location', target: 'check-213', mode: 'set', rule: hasFireSource },
  { kind: 'location', target: 'check-214', mode: 'set', rule: hasFireSource },
  {
    kind: 'exit', target: 'Misery Mire (Vitreous)', mode: 'set',
    rule: allOf(hasItem(ITEM.caneOfSomaria), bombs()),
  },
  { kind: 'location', target: 'check-215', mode: 'add', rule: dungeonBossDefeat('dungeon-011') },
  { kind: 'location', target: 'check-216', mode: 'add', rule: dungeonBossDefeat('dungeon-011') },
];

export { MIRE_RULES };
