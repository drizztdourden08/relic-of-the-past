import type { LogicConfig } from '../../types';

export const OPEN_CONFIG: LogicConfig = {
  mode: 'open',
  startingRegion: 'menu',
  startingItems: [],
  saveQuitDestinations: ['light-world', 'sanctuary', 'old-man-cave'],
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
