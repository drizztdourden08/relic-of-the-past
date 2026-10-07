/* @layer shared-game @kind logic */
/**
 * The combat helpers as trees, same contract as helpers-derived-gear.ts: the body is the state
 * helper the rules always called, the expansion the same question in primitive ops.
 */
import { ITEM } from '../item-ids.data';
import { BOTTLE_ITEMS } from '../item-groups';
import { REGION } from '../region-ids.data';
import {
  canActivateCrystalSwitch, canGetGoodBee, canKillMostThings, canKillStandardStart,
} from '../state-helpers-world';
import {
  FALSE, all, any, countGroup, has, hasAny, helper, region,
} from './rule-node-build';
import type { World } from '../world.type';
import type { HelperDefinition } from './helper-definition.type';
import type { RuleNode } from './rule-node.type';

/** The cane of byrna holds a room of five on one meter; a bigger room needs the meter extended. */
const byrnaFor = (enemies: number): RuleNode =>
  (enemies < 6 ? has(ITEM.caneOfByrna) : all(has(ITEM.caneOfByrna), helper('canExtendMagic')));

const killMost = (enemies: number): RuleNode => any(
  helper('hasMeleeWeapon'),
  has(ITEM.caneOfSomaria),
  byrnaFor(enemies),
  helper('canShootArrows'),
  has(ITEM.fireRod),
  helper('canUseBombs', enemies * 4),
);

const killStandardStart = (enemies: number): RuleNode => any(
  helper('hasMeleeWeapon'),
  has(ITEM.caneOfSomaria),
  byrnaFor(enemies),
  hasAny([ITEM.bow, ITEM.progressiveBow]),
  has(ITEM.fireRod),
  helper('canUseBombs', enemies),
);

/** The bee cave is read off the world: a first-world cave never turns the player into a bunny. */
const goodBee = (world: World): RuleNode => {
  const cave = world.regions.get(REGION.coldBeeCave);
  if (cave === undefined) return FALSE;
  return all(
    countGroup(BOTTLE_ITEMS, 1),
    has(ITEM.bugCatchingNet),
    any(has(ITEM.pegasusBoots), all(helper('hasSword'), has(ITEM.quake))),
    region(cave.id),
    ...(cave.isLightWorld ? [] : [has(ITEM.moonPearl)]),
  );
};

const COMBAT_HELPERS: readonly HelperDefinition[] = [
  {
    name: 'canActivateCrystalSwitch', params: [], body: (state) => canActivateCrystalSwitch(state),
    expand: () => any(
      helper('hasMeleeWeapon'),
      helper('canUseBombs'),
      helper('canShootArrows'),
      hasAny([
        ITEM.hookshot, ITEM.caneOfSomaria, ITEM.caneOfByrna, ITEM.fireRod, ITEM.iceRod,
        ITEM.blueBoomerang, ITEM.redBoomerang,
      ]),
    ),
  },
  {
    name: 'canKillMostThings', params: ['enemies'],
    body: (state, ...args) => canKillMostThings(state, ...(args as [number?])),
    expand: (_world, enemies = 5) => killMost(Number(enemies)),
  },
  {
    name: 'canKillStandardStart', params: ['enemies'],
    body: (state, ...args) => canKillStandardStart(state, ...(args as [number?])),
    expand: (_world, enemies = 5) => killStandardStart(Number(enemies)),
  },
  {
    name: 'canGetGoodBee', params: [], body: (state) => canGetGoodBee(state),
    expand: (world) => goodBee(world),
  },
];

export { COMBAT_HELPERS };
