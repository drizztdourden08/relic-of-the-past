/* @layer renderer-lib @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';

const ROM_FILE_PATTERN = /\.(sfc|smc)$/i;

const FAILED_PATCHED_IMPORT = msg('errors:language.patched.failed');

export { FAILED_PATCHED_IMPORT, ROM_FILE_PATTERN };
