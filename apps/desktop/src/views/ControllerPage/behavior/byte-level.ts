/* @layer renderer-components @kind logic */
import { BYTE_LEVELS, BYTE_MAX } from './byte-level.constants';

const byteLevel = (byte: number): number => Math.min(BYTE_LEVELS, Math.ceil((byte / BYTE_MAX) * BYTE_LEVELS));

export { byteLevel };
