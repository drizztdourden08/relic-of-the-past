import type { Requirement } from '../../types';
import {
  hasSword,
  canLiftRocks, canLiftHeavyRocks,
  canUseBombs,
  hasMiseryMireMedallion, hasTurtleRockMedallion,
  hasCrystals,
} from '../helpers';

/** Screen connection rules for Dark World (keyed by from|to). */
const DARK_WORLD_SCREEN_RULES: Record<string, Requirement> = {
  // Dark World overworld connections
  'east-dark-world|dark-lake-hylia': {
    or: [{ and: ['Moon Pearl', 'Flippers'] }, 'Magic Mirror'],
  },
  'south-dark-world|dark-lake-hylia': { and: ['Moon Pearl', 'Flippers'] },
  'dark-lake-hylia-ledge|dark-lake-hylia-ledge-healer-fairy': { and: ['Moon Pearl', canUseBombs] },
  'dark-lake-hylia-ledge|dark-lake-hylia-ledge-spike-cave': canLiftRocks,
  'south-dark-world|east-dark-world': 'Hammer',
  'east-dark-world|west-dark-world': 'Hookshot',
  'south-dark-world|west-dark-world': canLiftHeavyRocks,
  'west-dark-world|hammer-peg-area': { and: ['Moon Pearl', 'Hammer'] },
  'west-dark-world|bumper-cave-entrance': canLiftRocks,
  'dark-death-mountain-top|hookshot-cave': canLiftRocks,
  'dw-34|hype-cave': canUseBombs,
  'dw-18|brewery': canUseBombs,
  'west-dark-world|east-dark-world': 'Flippers',
  'dark-lake-hylia|dark-lake-hylia-central-island': 'Flippers',
  'northeast-dark-world|catfish': canLiftRocks,
  'east-dark-world|northeast-dark-world': 'Hammer',
  'south-dark-world|dark-grassy-lawn': { and: ['Moon Pearl', 'Hammer'] },

  // Dungeon entrances from Dark World
  'dark-death-mountain-top|dw-07': { and: [hasSword, hasTurtleRockMedallion, 'Moon Pearl'] },

  // Mirror spots (DW → LW)
  'south-dark-world|maze-race-ledge': 'Magic Mirror',
  'south-dark-world|cave-45-ledge': 'Magic Mirror',
  'south-dark-world|bombos-tablet-ledge': 'Magic Mirror',
  'west-dark-world|kings-grave-area': { and: ['Moon Pearl', 'Magic Mirror'] },
  'west-dark-world|graveyard-ledge': { and: ['Moon Pearl', 'Magic Mirror'] },
  'hyrule-castle-ledge|lw-1b': 'Magic Mirror',
  'dark-death-mountain-top|east-death-mountain-top': 'Magic Mirror',
  'east-death-mountain-top|mimic-cave-ledge': 'Magic Mirror',
  'east-dark-world|lw-27': 'Magic Mirror',
  'south-dark-world|lw-2c': 'Magic Mirror',
  'west-dark-world|lw-20': 'Magic Mirror',
  'dark-lake-hylia|lw-37': 'Magic Mirror',
  'northeast-dark-world|lw-1c': 'Magic Mirror',
  'skull-woods-forest|lw-08': 'Magic Mirror',
  'skull-woods-forest|master-sword-meadow': 'Magic Mirror',
  'dark-desert|desert-ledge': 'Magic Mirror',
  'dark-desert|desert-northern-cliffs': 'Magic Mirror',
  'dark-desert|desert-palace-lone-stairs': 'Magic Mirror',
  'bumper-cave-ledge|death-mountain-return-ledge': 'Magic Mirror',
  'dark-death-mountain-west-bottom|death-mountain-entrance': 'Magic Mirror',
  'dark-death-mountain-east-bottom|east-death-mountain-bottom': 'Magic Mirror',
  'dark-death-mountain-ledge|death-mountain-top': 'Magic Mirror',
  'dark-death-mountain-isolated-ledge|fairy-ascension-ledge': 'Magic Mirror',
  'death-mountain-floating-island-dw|death-mountain-floating-island-lw': 'Magic Mirror',
  'dark-lake-hylia-central-island|lake-hylia-central-island': 'Magic Mirror',
};

export { DARK_WORLD_SCREEN_RULES };
