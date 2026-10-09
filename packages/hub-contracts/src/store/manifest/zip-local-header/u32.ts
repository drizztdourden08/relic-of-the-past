/* @layer shared-store @kind logic */
import { u16 } from './u16';

const u32 = (b: Uint8Array, at: number): number => (u16(b, at) | (u16(b, at + 2) << 16)) >>> 0;

export { u32 };
