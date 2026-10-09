/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../../combinators';
import { arrows, bombs, canBombOrBonk } from '../../helper-rules';
import { actGate } from '../../../events';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const BOMBS = bombs();

const ARROWS = arrows();

const DARK_PALACE_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Palace of Darkness', mode: 'set', rule: allOf(hasItem(ITEM.moonPearl), actGate('check-332')) },
  { kind: 'exit', target: 'Palace of Darkness Bonk Wall', mode: 'set', rule: allOf(canBombOrBonk, ARROWS) },
  { kind: 'exit', target: 'Palace of Darkness Hammer Peg Drop', mode: 'set', rule: hasItem(ITEM.hammer) },
  {
    kind: 'exit', target: 'Palace of Darkness Bridge Room', mode: 'set',
    rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 1),
  },
  {
    kind: 'exit', target: 'Palace of Darkness Big Key Door', mode: 'set',
    rule: allOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      hasItem(ITEM.bigKeyPalaceOfDarkness),
      ARROWS,
      hasItem(ITEM.hammer),
    ),
  },
  { kind: 'exit', target: 'Palace of Darkness (North)', mode: 'set', rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 4) },
  {
    kind: 'location', target: 'check-153', mode: 'set',
    rule: allOf(BOMBS, hasItem(ITEM.bigKeyPalaceOfDarkness)),
  },
  { kind: 'location', target: 'check-146', mode: 'set', rule: BOMBS },
  {
    kind: 'exit', target: 'Palace of Darkness Big Key Chest Staircase', mode: 'set',
    rule: allOf(BOMBS, anyOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      allOf(
        placedAt('check-145', ITEM.smallKeyPalaceOfDarkness),
        hasKeys(ITEM.smallKeyPalaceOfDarkness, 3),
      ),
    )),
  },
  {
    kind: 'exit', target: 'Palace of Darkness Spike Statue Room Door', mode: 'set',
    rule: anyOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      allOf(
        placedAt('check-154', ITEM.smallKeyPalaceOfDarkness),
        hasKeys(ITEM.smallKeyPalaceOfDarkness, 4),
      ),
    ),
  },
  { kind: 'exit', target: 'Palace of Darkness Maze Door', mode: 'set', rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 6) },
  { kind: 'location', target: 'check-155', mode: 'add', rule: dungeonBossDefeat('dungeon-006') },
  { kind: 'location', target: 'check-156', mode: 'add', rule: dungeonBossDefeat('dungeon-006') },
];

export { DARK_PALACE_RULES };
