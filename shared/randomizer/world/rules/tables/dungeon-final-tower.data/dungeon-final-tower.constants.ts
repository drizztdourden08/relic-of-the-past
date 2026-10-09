/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import { allOf, anyOf, hasItem, placedAt } from '../../combinators';
import { arrows, bombs, hasFireSource, kill } from '../../helper-rules';
import { STORY_EVENT, actGate } from '../../../events';
import { dungeonBossDefeat, FINAL_TOWER_SUB_BOSSES } from '../bosses.data';
import {
  BACK_CHESTS, BOTTOM_FIGHT_CHESTS, COMPASS_ROOM_CHESTS, DMS_ROOM_CHESTS, RANDOMIZER_ROOM_CHESTS,
} from './final-tower-chests.data';
import { finalTowerKeys } from './final-tower-keys';
import { finalTowerBigKeyIn } from './final-tower-big-key-in';
import type { RuleEntry } from '../../rule-entry.type';

const BOMBS = bombs();

const ARROWS = arrows();

const FINAL_TOWER_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Ganons Tower', mode: 'set', rule: actGate('check-348') },
  { kind: 'location', target: 'check-235', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  { kind: 'exit', target: 'Ganons Tower (Tile Room)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  {
    kind: 'exit', target: 'Ganons Tower (Hookshot Room)', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), anyOf(hasItem(ITEM.hookshot), hasItem(ITEM.pegasusBoots))),
  },
  {
    kind: 'location', target: 'check-263', mode: 'set',
    rule: anyOf(hasItem(ITEM.caneOfSomaria), BOMBS),
  },
  { kind: 'exit', target: 'Ganons Tower (Double Switch Room)', mode: 'set', rule: finalTowerKeys(6) },
  { kind: 'exit', target: 'Ganons Tower (Double Switch Room)', mode: 'add', rule: hasItem(ITEM.hookshot) },
  {
    kind: 'exit', target: 'Ganons Tower (Map Room)', mode: 'set',
    rule: anyOf(
      finalTowerKeys(8),
      allOf(placedAt('check-247', ITEM.bigKeyGanonsTower), finalTowerKeys(6)),
    ),
  },
  {
    kind: 'exit', target: 'Ganons Tower (Firesnake Room)', mode: 'set',
    rule: anyOf(
      finalTowerKeys(7),
      allOf(finalTowerBigKeyIn([...RANDOMIZER_ROOM_CHESTS, ...BACK_CHESTS]), finalTowerKeys(5)),
    ),
  },
  {
    kind: 'location', target: 'check-248', mode: 'set',
    rule: anyOf(
      finalTowerKeys(7),
      allOf(
        anyOf(
          finalTowerBigKeyIn(RANDOMIZER_ROOM_CHESTS),
          placedAt('check-248', ITEM.smallKeyGanonsTower),
        ),
        finalTowerKeys(5),
      ),
    ),
  },
  ...RANDOMIZER_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: allOf(BOMBS, anyOf(finalTowerKeys(8), allOf(finalTowerBigKeyIn(RANDOMIZER_ROOM_CHESTS), finalTowerKeys(6)))),
  })),
  {
    kind: 'exit', target: 'Ganons Tower (Tile Room) Key Door', mode: 'set',
    rule: allOf(
      hasItem(ITEM.fireRod),
      anyOf(finalTowerKeys(7), allOf(finalTowerBigKeyIn(COMPASS_ROOM_CHESTS), finalTowerKeys(5))),
    ),
  },
  {
    kind: 'exit', target: 'Ganons Tower (Bottom) (East)', mode: 'set',
    rule: anyOf(finalTowerKeys(7), allOf(finalTowerBigKeyIn(BACK_CHESTS), finalTowerKeys(5))),
  },
  ...COMPASS_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: allOf(
      anyOf(BOMBS, hasItem(ITEM.caneOfSomaria)),
      hasItem(ITEM.fireRod),
      anyOf(finalTowerKeys(7), allOf(finalTowerBigKeyIn(COMPASS_ROOM_CHESTS), finalTowerKeys(5))),
    ),
  })),
  { kind: 'location', target: 'check-254', mode: 'set', rule: hasItem(ITEM.bigKeyGanonsTower) },
  ...BOTTOM_FIGHT_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set', rule: allOf(BOMBS, FINAL_TOWER_SUB_BOSSES.bottom),
  })),
  {
    kind: 'exit', target: 'Ganons Tower Big Key Door', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyGanonsTower), ARROWS),
  },
  {
    kind: 'exit', target: 'Ganons Tower Torch Rooms', mode: 'set',
    rule: allOf(kill(8), hasFireSource, FINAL_TOWER_SUB_BOSSES.middle),
  },
  { kind: 'location', target: 'check-265', mode: 'set', rule: kill(1) },
  {
    kind: 'location', target: 'check-260', mode: 'set',
    rule: allOf(finalTowerKeys(7), BOMBS),
  },
  { kind: 'exit', target: 'Ganons Tower Moldorm Door', mode: 'set', rule: allOf(finalTowerKeys(8), BOMBS) },
  {
    kind: 'exit', target: 'Ganons Tower Moldorm Gap', mode: 'set',
    rule: allOf(hasItem(ITEM.hookshot), FINAL_TOWER_SUB_BOSSES.top),
  },
  { kind: 'event', target: STORY_EVENT.agahnim2Beaten, mode: 'add', rule: dungeonBossDefeat('dungeon-013') },
  ...DMS_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'add', rule: hasItem(ITEM.hookshot),
  })),
];

export { FINAL_TOWER_RULES };
