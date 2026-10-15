/* @layer shared-game @kind constants */
import { MAX_NAME_GLYPHS } from '../../layout/layout-plan';
import type { Variable } from '../types';

const PLAYER_NAME_KEY = 'player-name';
const NUMBER_KEY = 'number';

const NUMBER_GLYPHS = 1;

const BUILTINS: readonly Variable[] = [
  {
    key: PLAYER_NAME_KEY,
    kind: 'engine',
    label: 'Player name',
    value: null,
    locked: true,
    maxGlyphs: MAX_NAME_GLYPHS,
    note: 'Read from the save file at draw time; up to six glyphs.',
  },
  {
    key: NUMBER_KEY,
    kind: 'engine',
    label: 'Number',
    value: null,
    locked: true,
    maxGlyphs: NUMBER_GLYPHS,
    note: 'One digit of a live counter, chosen by the game.',
  },
];

const ENGINE_SAMPLES: Record<string, string> = {
  [PLAYER_NAME_KEY]: 'PLAYER',
  [NUMBER_KEY]: '0',
};

export { BUILTINS, ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY };
