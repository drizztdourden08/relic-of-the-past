/* @layer shared-asset-extraction @kind logic */
import {
  BASE_MAP16_COUNT, MAP8_FOREGROUND_PRIORITY_BIT, MAP8_WORDS_PER_MAP16_CELL, WALL_CELLS,
} from './second-cartridge-tiles.constants';

const appendWallPriorityTwins = (words: number[]): void => {
  const expected = BASE_MAP16_COUNT * MAP8_WORDS_PER_MAP16_CELL;
  if (words.length !== expected) {
    throw new Error(`Expected ${expected} map16 words, found ${words.length}`);
  }
  for (const cell of WALL_CELLS) {
    const at = cell * MAP8_WORDS_PER_MAP16_CELL;
    for (let i = 0; i < MAP8_WORDS_PER_MAP16_CELL; i++) words.push((words[at + i] ?? 0) | MAP8_FOREGROUND_PRIORITY_BIT);
  }
};

export { appendWallPriorityTwins };
