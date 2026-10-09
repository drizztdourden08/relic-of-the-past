/* @layer bridge-wasm @kind constants */
import type { GearTiers } from './gear-ownership.type';

const NO_GEAR: GearTiers = { sword: 0, shield: 0, mail: 0, bow: 0 };

const PINNED_SLOT_KEY = '0';

export { NO_GEAR, PINNED_SLOT_KEY };
