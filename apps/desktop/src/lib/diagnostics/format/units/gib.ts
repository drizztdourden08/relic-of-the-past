/* @layer renderer-lib @kind logic */
import { GIB } from './units.constants';

const gib = (bytes: number): string => `${(bytes / GIB).toFixed(1)} GiB`;

export { gib };
