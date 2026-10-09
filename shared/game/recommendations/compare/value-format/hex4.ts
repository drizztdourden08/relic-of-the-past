/* @layer shared-game @kind logic */
import { paddedHex } from './padded-hex';

const hex4 = (value: unknown): string => paddedHex(value, 0xffff, 4);

export { hex4 };
