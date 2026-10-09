/* @layer renderer-lib @kind logic */
import { MIB } from './units.constants';

const mib = (bytes: number): string => `${Math.round(bytes / MIB)} MiB`;

export { mib };
