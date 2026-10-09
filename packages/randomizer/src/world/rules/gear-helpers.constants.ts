/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids';
import { CRYSTAL_ITEMS } from '../item-groups';
import {
  canBombOrBonk, canLiftHeavyRocks, canLiftRocks, canMeltThings, canShootArrows, canUseBombs,
  hasBeamSword, hasFireSource, hasMeleeWeapon, hasSword,
} from '../state-helpers';
import { canRetrieveTablet, canUseMedallion, hasCrystals, hasMireMedallion, hasTurtleRockMedallion } from '../state-helpers-world';
import { all, any, countGroup, has, hasAny, helper, option } from './rule-node-build';
import { bombsHeldNode } from './derived-nodes/bombs-held-node';
import { medallionHeldNode } from './derived-nodes/medallion-held-node';
import { shootArrowsNode } from './derived-nodes/shoot-arrows-node';
import type { HelperDefinition } from './helper-definition.type';

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
    expand: (_world, count = 0) => shootArrowsNode(Number(count)),
  },
  {
    name: 'canUseBombs', params: ['quantity'],
    body: (state, ...args) => canUseBombs(state, ...(args as [number?])),
    expand: (_world, quantity = 1) => bombsHeldNode(Number(quantity)),
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
    expand: () => medallionHeldNode('medallions.mire'),
  },
  {
    name: 'hasTurtleRockMedallion', params: [], body: (state) => hasTurtleRockMedallion(state),
    expand: () => medallionHeldNode('medallions.turtleRock'),
  },
];

export { GEAR_HELPERS };
