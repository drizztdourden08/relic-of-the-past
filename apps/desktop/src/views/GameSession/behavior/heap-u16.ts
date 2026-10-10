/* @layer renderer-appshell @kind logic */
const heapU16 = (heap: ArrayLike<number>, at: number): number => (heap[at] ?? 0) | ((heap[at + 1] ?? 0) << 8);

export { heapU16 };
