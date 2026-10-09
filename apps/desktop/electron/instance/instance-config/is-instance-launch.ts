/* @layer electron-main @kind logic */
import { parseInstanceConfig } from './parse-instance-config';

const isInstanceLaunch = (): boolean => parseInstanceConfig().name !== null;

export { isInstanceLaunch };
