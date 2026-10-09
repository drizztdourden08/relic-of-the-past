/* @layer renderer-components @kind logic */
import { baselineValues } from '@rotp/randomizer';

const baselineSwitch = (key: string): boolean => baselineValues[key] === true;

export { baselineSwitch };
