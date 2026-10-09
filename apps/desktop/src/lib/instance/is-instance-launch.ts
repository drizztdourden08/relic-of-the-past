/* @layer renderer-lib @kind logic */
import { instanceName } from './instance-name';

const isInstanceLaunch = (): boolean => instanceName() !== null;

export { isInstanceLaunch };
