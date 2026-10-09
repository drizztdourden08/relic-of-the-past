/* @layer renderer-lib @kind logic */
import { padHex } from '../profile-devices';
import { ANY_DEVICE } from './device-scoped-map.constants';

const deviceKeyFor = (sourceVid?: string | null, sourcePid?: string | null): string =>
  sourceVid && sourcePid ? `${padHex(sourceVid)}:${padHex(sourcePid)}` : ANY_DEVICE;

export { deviceKeyFor };
