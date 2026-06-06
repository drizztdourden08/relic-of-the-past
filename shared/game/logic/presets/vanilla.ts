/* @layer shared-game @kind logic */
import type { LogicConfig } from '../../types';

const VANILLA_CONFIG: LogicConfig = {
  mode: 'vanilla',
  startingScreen: 'menu',
  startingItems: [],
  saveQuitDestinations: [],
  moonPearlRequired: true,
  medallionRequirements: { miseryMire: 'Ether', turtleRock: 'Quake' },
  crystalsForGT: 7,
  crystalsForGanon: 7,
  pendantsForPedestal: 3,
  swordMode: 'normal',
  goal: 'ganon',
  overworldShuffle: false,
  dungeonShuffle: false,
  keysanity: false,
  bigKeyShuffle: false,
};

export { VANILLA_CONFIG };
