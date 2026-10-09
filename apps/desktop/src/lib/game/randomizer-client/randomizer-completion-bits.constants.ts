/* @layer bridge-wasm @kind constants */
import type { CompletionBit } from './randomizer-completion-bits.type';

const SUBSTITUTION_BYTE_0 = 21;
const SUBSTITUTION_BYTE_1 = 22;
const SUBSTITUTION_BYTE_2 = 25;

const COMPLETION_BIT_BY_CHECK: ReadonlyMap<string, CompletionBit> = new Map([
  ['check-019', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x01 }],
  ['check-033', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x02 }],
  ['check-041', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x04 }],
  ['check-060', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x08 }],
  ['check-077', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x10 }],
  ['check-006', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x20 }],
  ['check-055', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x40 }],
  ['check-008', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x80 }],
  ['check-080', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x01 }],
  ['check-070', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x02 }],
  ['check-039', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x04 }],
  ['check-021', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x08 }],
  ['check-022', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x10 }],
  ['check-266', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x20 }],
  ['check-267', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x40 }],
  ['check-273', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x01 }],
  ['check-274', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x02 }],
  ['check-040', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x04 }],
  ['check-078', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x08 }],
]);

export { COMPLETION_BIT_BY_CHECK, SUBSTITUTION_BYTE_0, SUBSTITUTION_BYTE_1, SUBSTITUTION_BYTE_2 };
