/* @layer shared-game @kind logic */
/**
 * The equipment helpers as trees. Each body is the state helper the rules always called; each
 * expansion is the same question in primitive ops (the rule-node parity guard asks both over
 * random states and holds them equal).
 */
import { ITEM } from '../item-ids.data';
import { CRYSTAL_ITEMS } from '../item-groups';
import {
  canBombOrBonk, canLiftHeavyRocks, canLiftRocks, canMeltThings, canShootArrows, canUseBombs,
  hasBeamSword, hasFireSource, hasMeleeWeapon, hasSword,
} from '../state-helpers';
import { canRetrieveTablet, canUseMedallion, hasCrystals, hasMireMedallion, hasTurtleRockMedallion } from '../state-helpers-world';
import { BOMBS_HELD_CHECK } from '../events/bombs-record';
import { RETRO_QUIVER_ITEM } from '../retro/retro-bow.data';
import { retroQuiverRegions } from '../retro/retro-shops';
import {
  all, any, countGroup, has, hasAny, helper, option, optionRef, region, when,
} from './rule-node-build';
import type { MedallionId } from '../item-groups';
import type { HelperDefinition } from './helper-definition.type';
import type { RuleNode, RuleOptionKey } from './rule-node.type';

const MEDALLIONS: readonly MedallionId[] = [ITEM.bombos, ITEM.ether, ITEM.quake];

/** The seed's medallion for one gate, read as a setting: held, whichever one it is. */
const medallionOf = (key: RuleOptionKey): RuleNode =>
  any(...MEDALLIONS.map((medallion) => all(option(key, medallion), has(medallion))));

/** The retro quiver in hand: a pool item where the shops are shuffled, bought off its shelf where not. */
const retroQuiver = (): RuleNode => when(
  option('retroBow.quiverInPool', true),
  all(has(RETRO_QUIVER_ITEM), helper('walletAtLeast', optionRef('retroBow.shotWalletNeed'))),
  all(any(...retroQuiverRegions().map(region)), helper('walletAtLeast', optionRef('retroBow.walletNeed'))),
);

/** An arrow capacity of zero fires nothing, so the capacity asked is never below one. */
const shootArrows = (count: number): RuleNode => all(
  any(has(ITEM.bow), has(ITEM.silverBow)),
  when(option('retroBow.enabled', true), retroQuiver(), helper('projectilesAtLeast', Math.max(1, count))),
);

/** Capped at the bag's own fifty; a world carrying the player's record also asks a bomb was held. */
const bombsHeld = (quantity: number): RuleNode => all(
  helper('explosivesAtLeast', Math.min(quantity, 50)),
  any(option('events.recordAttached', false), has(BOMBS_HELD_CHECK)),
);

const GEAR_HELPERS: readonly HelperDefinition[] = [
  {
    name: 'hasSword', params: [], body: (state) => hasSword(state),
    expand: () => hasAny([ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]),
  },
  {
    name: 'hasBeamSword', params: [], body: (state) => hasBeamSword(state),
    expand: () => hasAny([ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]),
  },
  {
    name: 'hasMeleeWeapon', params: [], body: (state) => hasMeleeWeapon(state),
    expand: () => any(helper('hasSword'), has(ITEM.hammer)),
  },
  {
    name: 'canLiftRocks', params: [], body: (state) => canLiftRocks(state),
    expand: () => any(has(ITEM.powerGlove), has(ITEM.titansMitts)),
  },
  {
    name: 'canLiftHeavyRocks', params: [], body: (state) => canLiftHeavyRocks(state),
    expand: () => has(ITEM.titansMitts),
  },
  {
    name: 'hasFireSource', params: [], body: (state) => hasFireSource(state),
    expand: () => any(has(ITEM.fireRod), has(ITEM.lamp)),
  },
  {
    name: 'canMeltThings', params: [], body: (state) => canMeltThings(state),
    expand: () => any(has(ITEM.fireRod), all(has(ITEM.bombos), helper('hasSword'))),
  },
  {
    name: 'canShootArrows', params: ['count'],
    body: (state, ...args) => canShootArrows(state, ...(args as [number?])),
    expand: (_world, count = 0) => shootArrows(Number(count)),
  },
  {
    name: 'canUseBombs', params: ['quantity'],
    body: (state, ...args) => canUseBombs(state, ...(args as [number?])),
    expand: (_world, quantity = 1) => bombsHeld(Number(quantity)),
  },
  {
    name: 'canBombOrBonk', params: [], body: (state) => canBombOrBonk(state),
    expand: () => any(has(ITEM.pegasusBoots), helper('canUseBombs')),
  },
  {
    name: 'hasCrystals', params: ['count'],
    body: (state, count) => hasCrystals(state, Number(count)),
    expand: (_world, count) => countGroup(CRYSTAL_ITEMS, Number(count)),
  },
  {
    name: 'canRetrieveTablet', params: [], body: (state) => canRetrieveTablet(state),
    expand: () => all(
      has(ITEM.bookOfMudora),
      any(helper('hasBeamSword'), all(option('itemPower.hammerTablets', true), has(ITEM.hammer))),
    ),
  },
  {
    name: 'canUseMedallion', params: [], body: (state) => canUseMedallion(state),
    expand: () => any(option('itemPower.swordlessMedallions', true), helper('hasSword')),
  },
  {
    name: 'hasMireMedallion', params: [], body: (state) => hasMireMedallion(state),
    expand: () => medallionOf('medallions.mire'),
  },
  {
    name: 'hasTurtleRockMedallion', params: [], body: (state) => hasTurtleRockMedallion(state),
    expand: () => medallionOf('medallions.turtleRock'),
  },
];

export { GEAR_HELPERS };
