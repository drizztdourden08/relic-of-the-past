/* @layer shared-game @kind data */
import type { LogicConfig } from '../../types';

const OPEN_CONFIG: LogicConfig = {
  mode: 'open',
  startingScreen: 'menu',
  startingItems: [],
  // Fixed bug: this previously listed 'light-world', which never matched the
  // real save-and-quit spawn id ('links-house'/screen-204) and left it gated
  // behind the vanilla-only rescue event even in open mode. 'sanctuary' has no
  // menu-sourced connection to free (see resolver.ts), so it stays out.
  saveQuitDestinations: ['screen-204', 'screen-190'], // Link's House, Old Man Cave
  moonPearlRequired: true,
  medallionRequirements: { miseryMire: 'item-017', turtleRock: 'item-018' }, // Ether / Quake
  crystalsForGT: 7,
  crystalsForFinalBoss: 7,
  pendantsForPedestal: 3,
  swordMode: 'normal',
  goal: 'final-boss',
  overworldShuffle: false,
  dungeonShuffle: false,
  keysanity: false,
  bigKeyShuffle: false,
};

export { OPEN_CONFIG };
