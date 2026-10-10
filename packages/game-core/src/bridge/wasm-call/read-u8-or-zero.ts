/* @layer bridge-wasm @kind logic */
const readU8OrZero = (heap: Uint8Array, at: number): number => heap[at] ?? 0;

export { readU8OrZero };
