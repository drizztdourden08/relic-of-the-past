/* @layer bridge-wasm @kind logic */
const readU16 = (heap: Uint8Array, o: number): number => heap[o] | (heap[o + 1] << 8);

export { readU16 };
