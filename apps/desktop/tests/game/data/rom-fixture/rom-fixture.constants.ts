/* @layer tests @kind constants */
import { join } from 'path';
import { REPO_ROOT } from '../../../repo-root';

const REPO = REPO_ROOT;
const CANDIDATE_DIRS = [join('.user-data', 'Data', 'roms'), 'assets', 'test-roms'];
const SMC_HEADER_SIZE = 0x200;

export { CANDIDATE_DIRS, REPO, SMC_HEADER_SIZE };
