/* @layer shared-storage @kind logic */
import { datName } from './dat-name';

const basePath = (romFile: string): string => `assets/${datName(romFile)}`;

export { basePath };
