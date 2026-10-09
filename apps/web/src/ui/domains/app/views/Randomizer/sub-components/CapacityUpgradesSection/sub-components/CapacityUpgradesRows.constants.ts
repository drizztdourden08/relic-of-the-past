/* @layer renderer-components @kind constants */
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY } from '@shared/randomizer/world/capacity';
import { optionByKey } from '@shared/randomizer/world/options.data';

const ENABLED_OPTION = optionByKey.get(CAPACITY_ENABLED_KEY);
const PROGRESSIVE_OPTION = optionByKey.get(CAPACITY_PROGRESSIVE_KEY);

export { ENABLED_OPTION, PROGRESSIVE_OPTION };
