/* @layer renderer-lib @kind logic */
const itemAt = <T>(list: ArrayLike<T>, index: number): T => {
  const value = list[index];
  if (value === undefined) throw new RangeError(`No entry at index ${index} of a list of ${list.length}`);
  return value;
};

export { itemAt };
