/* @layer bridge-wasm @kind logic */
const readU16 = (heap: Uint8Array, o: number): number => (heap[o] ?? 0) | ((heap[o + 1] ?? 0) << 8);

export { readU16 };
