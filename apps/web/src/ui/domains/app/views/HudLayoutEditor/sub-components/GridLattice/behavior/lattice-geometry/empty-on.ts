/* @layer renderer-components @kind logic */
const emptyOn = (sizes: readonly number[], index: number): boolean =>
  sizes.length > index && (sizes[index] ?? 0) <= 0;

export { emptyOn };
