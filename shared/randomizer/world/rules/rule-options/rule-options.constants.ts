/* @layer shared-game @kind constants */
import { itemPowerOf } from '../../item-power/item-power-rule';
import { isSwordless } from '../../progressive/progressive-reach';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../dungeon-items/dungeon-item-modes';
import { retroShotWalletNeed } from '../../retro/retro-shot-wallet-need';
import { retroWalletNeed } from '../../retro/retro-wallet-need';
import { retroQuiverInPool } from '../../retro/retro-shops';
import { storyGatesOf } from './story-gates-of';
import { darkRoomsOf } from './dark-rooms-of';
import { crystalsOf } from './crystals-of';
import { retroNeed } from './retro-need';
import type { RuleOptionKey } from '../rule-node.type';
import type { OptionReader } from '../rules.type';

const RULE_OPTIONS: Readonly<Record<RuleOptionKey, OptionReader>> = {
  'storyGates.pedestal': (world) => storyGatesOf(world).pedestal,
  'storyGates.sahasrahla': (world) => storyGatesOf(world).sahasrahla,
  'storyGates.barrier': (world) => storyGatesOf(world).barrier,
  'storyGates.bombShop': (world) => storyGatesOf(world).bombShop,
  'storyGates.pyramidHole': (world) => storyGatesOf(world).pyramidHole,
  'storyGates.tower.kind': (world) => storyGatesOf(world).tower.kind,
  'storyGates.tower.count': (world) => storyGatesOf(world).tower.count,
  'storyGates.tower.crystals': (world) => crystalsOf(storyGatesOf(world).tower),
  'storyGates.ganon.kind': (world) => storyGatesOf(world).ganon.kind,
  'storyGates.ganon.count': (world) => storyGatesOf(world).ganon.count,
  'storyGates.ganon.crystals': (world) => crystalsOf(storyGatesOf(world).ganon),
  'darkRooms.requireLight': (world) => darkRoomsOf(world).requireLight,
  'darkRooms.light.lamp': (world) => darkRoomsOf(world).lights.lamp,
  'darkRooms.light.fireRod': (world) => darkRoomsOf(world).lights.fireRod,
  'darkRooms.light.bombos': (world) => darkRoomsOf(world).lights.bombos,
  'darkRooms.light.redCane': (world) => darkRoomsOf(world).lights.redCane,
  'unlitEscapeExempt': (world) => world.options.unlitEscapeExempt === true,
  'events.recordAttached': (world) => world.options.actTokens !== undefined,
  'itemPower.hammerTablets': (world) => itemPowerOf(world).hammerTablets,
  'itemPower.swordlessMedallions': (world) => itemPowerOf(world).swordlessMedallions,
  'itemPower.pullableCurtains': (world) => itemPowerOf(world).pullableCurtains,
  'itemPower.hammerLastFight': (world) => itemPowerOf(world).hammerLastFight,
  'itemPower.hammerTowerSeal': (world) => itemPowerOf(world).hammerTowerSeal,
  'progressive.swordless': (world) => isSwordless(world),
  'dungeonItems.keyFamilyPinned': (world) => {
    const setting = world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING;
    return staysInOwnDungeon(setting.smallKey) || staysInOwnDungeon(setting.bigKey);
  },
  'retroBow.enabled': (world) => world.options.retroBow?.enabled === true,
  'retroBow.quiverInPool': (world) => retroQuiverInPool(world.options.shops, world.options.retroBow),
  'retroBow.shotWalletNeed': (world) => retroNeed(world, retroShotWalletNeed),
  'retroBow.walletNeed': (world) => retroNeed(world, retroWalletNeed),
  'medallions.mire': (world) => world.options.medallions.mire,
  'medallions.turtleRock': (world) => world.options.medallions.turtleRock,
};

const RULE_OPTION_KEYS = Object.keys(RULE_OPTIONS) as RuleOptionKey[];

export { RULE_OPTION_KEYS, RULE_OPTIONS };
