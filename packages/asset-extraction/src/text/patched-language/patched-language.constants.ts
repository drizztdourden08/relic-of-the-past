/* @layer shared-asset-extraction @kind constants */
import { RANDOMIZER_MSG_BASE } from '../data/randomizer-templates';

const EXPECTED_LINE_COUNT = RANDOMIZER_MSG_BASE;

const FATAL_PARTS: readonly string[] = ['font-tiles', 'letters', 'dialogue'];

export { EXPECTED_LINE_COUNT, FATAL_PARTS };
