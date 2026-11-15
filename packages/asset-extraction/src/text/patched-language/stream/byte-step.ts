/* @layer shared-asset-extraction @kind logic */
import { END_MESSAGE, PT_IGNORED_BANK_BYTES } from '../../dialogue-decoder/dialogue-decoder.constants';
import { STEP_ERROR, STEP_FINISH, STEP_MESSAGE, STEP_SWITCH } from './stream.constants';
import type { StreamLayout } from './stream.type';

const byteStep = (layout: StreamLayout, c: number): number => {
  const { commandStart, switchBank, finish, dictBase, dictCount, commandLengths, escape, ignoresBankBytes } = layout;
  if (c === END_MESSAGE) return STEP_MESSAGE;
  if (c < commandStart) return c === escape ? 2 : 1;
  if (c < switchBank) return commandLengths[c - commandStart] ?? STEP_ERROR;
  if (c === finish) return STEP_FINISH;
  if (c === switchBank) return STEP_SWITCH;
  if (c < switchBank + PT_IGNORED_BANK_BYTES) return ignoresBankBytes ? 1 : STEP_ERROR;
  return c - dictBase < dictCount ? 1 : STEP_ERROR;
};

export { byteStep };
