/* @layer shared-game @kind logic */
import type { LogicConfig } from '../../types';

const OPEN_CONFIG: LogicConfig = {
  mode: 'open',
  startingScreen: 'menu',
  startingItems: [],
  saveQuitDestinations: ['light-world', 'sanctuary', 'old-man-cave'],
  moonPearlRequired: true,
  medallionRequirements: { miseryMire: 'Ether', turtleRock: 'Quake' },
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
