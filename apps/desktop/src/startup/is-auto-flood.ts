/* @layer renderer-lib @kind logic */
import { startupFlag } from './startup-flag';

const isAutoFlood = (): boolean => startupFlag('auto-flood') === true;

export { isAutoFlood };
