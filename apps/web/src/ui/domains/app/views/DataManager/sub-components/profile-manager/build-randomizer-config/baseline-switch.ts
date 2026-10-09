/* @layer renderer-components @kind logic */
import { baselineValues } from '@shared/randomizer/world/options.data';

const baselineSwitch = (key: string): boolean => baselineValues[key] === true;

export { baselineSwitch };
