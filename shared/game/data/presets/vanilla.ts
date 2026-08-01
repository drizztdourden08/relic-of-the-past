/* @layer shared-game @kind data */
import type { LogicConfig } from '../../types';

const VANILLA_CONFIG: LogicConfig = {
  mode: 'vanilla',
  startingScreen: 'menu',
  startingItems: [],
  saveQuitDestinations: [],
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

export { VANILLA_CONFIG };
