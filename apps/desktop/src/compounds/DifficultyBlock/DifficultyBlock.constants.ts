/* @layer renderer-components @kind constants */
import { COPY_MULTIPLIERS } from '@rotp/randomizer';

const FIRST_STEP = Math.min(...COPY_MULTIPLIERS);
const LAST_STEP = Math.max(...COPY_MULTIPLIERS);

export { FIRST_STEP, LAST_STEP };
