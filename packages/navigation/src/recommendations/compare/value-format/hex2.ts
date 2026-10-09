/* @layer shared-game @kind logic */
import { paddedHex } from './padded-hex';

const hex2 = (value: unknown): string => paddedHex(value, 0xff, 2);

export { hex2 };
