/* @layer renderer-lib @kind logic */
import { startupFlag } from './startup-flag';

const isAutoStart = (): boolean => startupFlag('auto-start') === true;

export { isAutoStart };
