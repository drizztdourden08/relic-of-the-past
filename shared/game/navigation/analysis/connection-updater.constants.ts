/* @layer shared-game @kind constants */
import type { ConnectionTransitType } from '../nav-data.types';

const TRANSIT_TAG_PREFIX = 'transit:';
const BARRIER_TAG_PREFIX = 'barrier:';

const TRANSIT_BY_TAG: Record<string, ConnectionTransitType> = {
  door: 'door',
  hole: 'hole',
  ledge: 'ledge',
  stairs: 'staircase',
  warp: 'warp_tile',
  mirror: 'mirror',
  walk: 'walk',
  swim: 'walk',
  waterfall: 'door',
  grave: 'door',
  bomb: 'door',
  bonk: 'door',
  rock: 'door',
  push: 'door',
  hookshot: 'walk',
};

const REQUIREMENT_BY_BARRIER: Record<string, string> = {
  'gloves': 'lift.1',
  'hammer': 'hammer',
  'bomb': 'bombs',
  'dash': 'boots',
  'hookshot': 'hookshot',
  'swim': 'flippers',
  'fire': 'firerod',
  'book': 'book',
  'dark': 'lamp',
};

export { BARRIER_TAG_PREFIX, REQUIREMENT_BY_BARRIER, TRANSIT_BY_TAG, TRANSIT_TAG_PREFIX };
