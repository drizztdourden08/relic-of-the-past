/* @layer bridge-wasm @kind logic */
const readU8 = (heap: Uint8Array, at: number): number => {
  const value = heap[at];
  if (value === undefined) throw new RangeError(`heap byte ${String(at)} is out of range`);
  return value;
};

export { readU8 };
