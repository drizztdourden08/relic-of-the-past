/* @layer renderer-hooks @kind constants */
import { POND_MODE_KEYS } from '@shared/randomizer/world/pond/pond-option-keys';

const FROZEN_POND_KEYS: ReadonlySet<string> = new Set([POND_MODE_KEYS.capacity]);

const NO_FROZEN_KEYS: ReadonlySet<string> = new Set();

export { FROZEN_POND_KEYS, NO_FROZEN_KEYS };
