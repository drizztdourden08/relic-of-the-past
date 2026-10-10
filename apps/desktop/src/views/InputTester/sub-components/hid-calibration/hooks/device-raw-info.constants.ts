/* @layer renderer-components @kind constants */
import type { RawHidInfo } from './device-raw-info.type';

const EMPTY_RAW_INFO: RawHidInfo = { path: null, manufacturer: null, product: null, serialNumber: null, busType: null };

export { EMPTY_RAW_INFO };
