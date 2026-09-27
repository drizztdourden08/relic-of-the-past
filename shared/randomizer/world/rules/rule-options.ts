/* @layer shared-game @kind logic */
/**
 * The setting readings a rule tree may test, each read off the world the rule is asked in.
 *
 * A reading is the value IN FORCE, defaults and masks applied: an absent setting reads as the
 * default the rules always fell back to, and the item-power switches read through their masks
 * (item-power/item-power-rule.ts). So an `option` leaf answers exactly what the old closure
 * computed at the same point, and an exporter can write every reading of a world out beside its
 * trees.
 */
import { DEFAULT_STORY_GATES } from '../story-gates/story-gates.data';
import { REFERENCE_DARK_ROOM_SETTING } from '../dark-rooms/dark-room-lights.data';
import { itemPowerOf } from '../item-power/item-power-rule';
import { isSwordless } from '../progressive/progressive-reach';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../dungeon-items/dungeon-item-modes';
import { retroShotWalletNeed, retroWalletNeed } from '../retro/retro-bow.data';
import { retroQuiverInPool } from '../retro/retro-shops';
import type { CountGate, StoryGateSetting } from '../story-gates/story-gate.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import type { World } from '../world.type';
import type { RuleOptionKey, RuleOptionValue } from './rule-node.type';

type OptionReader = (world: World) => RuleOptionValue;

const gates = (world: World): StoryGateSetting => world.options.storyGates ?? DEFAULT_STORY_GATES;
const dark = (world: World): DarkRoomSetting => world.options.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;

/** Zero with the crystal kind is the original number, seven. */
const crystalsOf = (gate: CountGate): number => (gate.count === 0 ? 7 : gate.count);

/** A retro reading only exists while retro is on; off, the tree never asks it. */
const retroNeed = (world: World, need: typeof retroWalletNeed): number => {
  const retro = world.options.retroBow;
  return retro === undefined ? 0 : need(retro);
};

const RULE_OPTIONS: Readonly<Record<RuleOptionKey, OptionReader>> = {
  'storyGates.pedestal': (world) => gates(world).pedestal,
  'storyGates.sahasrahla': (world) => gates(world).sahasrahla,
  'storyGates.barrier': (world) => gates(world).barrier,
  'storyGates.bombShop': (world) => gates(world).bombShop,
  'storyGates.pyramidHole': (world) => gates(world).pyramidHole,
  'storyGates.tower.kind': (world) => gates(world).tower.kind,
  'storyGates.tower.count': (world) => gates(world).tower.count,
  'storyGates.tower.crystals': (world) => crystalsOf(gates(world).tower),
  'storyGates.ganon.kind': (world) => gates(world).ganon.kind,
  'storyGates.ganon.count': (world) => gates(world).ganon.count,
  'storyGates.ganon.crystals': (world) => crystalsOf(gates(world).ganon),
  'darkRooms.requireLight': (world) => dark(world).requireLight,
  'darkRooms.light.lamp': (world) => dark(world).lights.lamp,
  'darkRooms.light.fireRod': (world) => dark(world).lights.fireRod,
  'darkRooms.light.bombos': (world) => dark(world).lights.bombos,
  'darkRooms.light.redCane': (world) => dark(world).lights.redCane,
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

const readRuleOption = (world: World, key: RuleOptionKey): RuleOptionValue => RULE_OPTIONS[key](world);

/** Every reading of one world, for an exporter to write beside the trees. */
const ruleOptionsOfWorld = (world: World): Record<RuleOptionKey, RuleOptionValue> =>
  Object.fromEntries(RULE_OPTION_KEYS.map((key) => [key, readRuleOption(world, key)])) as
    Record<RuleOptionKey, RuleOptionValue>;

export { RULE_OPTION_KEYS, readRuleOption, ruleOptionsOfWorld };
