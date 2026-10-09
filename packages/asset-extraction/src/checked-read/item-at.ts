/* @layer shared-asset-extraction @kind logic */
const itemAt = <T>(list: ArrayLike<T>, index: number, what: string): T => {
  const value = list[index];
  if (value === undefined) throw new Error(`${what}: no entry at index ${index}`);
  return value;
};

export { itemAt };
