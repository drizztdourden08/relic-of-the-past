/* @layer shared-asset-extraction @kind constants */
import { SHORT_ROM_LINE_COUNT } from '../../build-language-entry/build-language-entry.constants';
import { RANDOMIZER_MSG_BASE } from '../../data/randomizer-templates';

const STEP_MESSAGE = -1;

const STEP_SWITCH = -2;

const STEP_FINISH = -3;

const STEP_ERROR = -4;

const BANK_BYTES = 0x8000;

const EXPECTED_MESSAGE_COUNTS: readonly number[] = [SHORT_ROM_LINE_COUNT, RANDOMIZER_MSG_BASE];

const MIN_SEGMENT_MESSAGES = 32;

const MAX_SEGMENT_CANDIDATES = 4;

const SCAN_STEP_BUDGET = 200_000_000;

const MAX_DIFF_HINTS = 4096;

const PADDING_RUN = 4;

const PADDING_BYTES: readonly number[] = [0x00, 0xff];

const MOVED_FIRST = 'first dialogue bank';

const MOVED_SECOND = 'second dialogue bank';

export {
  BANK_BYTES, EXPECTED_MESSAGE_COUNTS, MAX_DIFF_HINTS, MAX_SEGMENT_CANDIDATES, MIN_SEGMENT_MESSAGES, MOVED_FIRST,
  MOVED_SECOND, PADDING_BYTES, PADDING_RUN, SCAN_STEP_BUDGET, STEP_ERROR, STEP_FINISH, STEP_MESSAGE, STEP_SWITCH,
};
