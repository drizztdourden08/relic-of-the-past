/* @layer shared-input @kind data */
/**
 * Device database barrel — concatenates per-vendor chunks back into the
 * single DEVICE_DATABASE array. Public symbol is unchanged.
 * Source: https://github.com/mdqinc/SDL_GameControllerDB (893 unique devices).
 */

import type { DeviceDatabaseEntry } from '../../types';
import { EIGHTBITDO } from './8bitdo.data';
import { SONY } from './sony.data';
import { MICROSOFT } from './microsoft.data';
import { NINTENDO } from './nintendo.data';
import { MISC } from './misc.data';

const DEVICE_DATABASE: DeviceDatabaseEntry[] = [
  ...EIGHTBITDO,
  ...SONY,
  ...MICROSOFT,
  ...NINTENDO,
  ...MISC,
];

export { DEVICE_DATABASE };
export type { DeviceDatabaseEntry };
