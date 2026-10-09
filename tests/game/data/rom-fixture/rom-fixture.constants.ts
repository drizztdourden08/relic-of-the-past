/* @layer tests @kind constants */
import { join, resolve } from 'path';

const REPO = resolve(__dirname, '..', '..', '..', '..');
const CANDIDATE_DIRS = [join('.user-data', 'Data', 'roms'), 'assets', 'test-roms'];
const SMC_HEADER_SIZE = 0x200;

export { CANDIDATE_DIRS, REPO, SMC_HEADER_SIZE };
