/* @layer renderer-lib @kind barrel */
export { parseOpuz } from './parse-opuz';
export { hasOpuzMagic } from './has-opuz-magic';
export { OPUZ_HEADER_BYTES, OPUZ_RANGE_BYTES, OPUZ_SAMPLE_RATE, OPUZ_CHANNELS } from './parse-opuz.constants';
export type { OpuzAudio, OpuzRange } from './parse-opuz.type';
