/* @layer shared-game @kind logic */
const entryOf = <V>(table: Readonly<Record<string, V>>, key: string): V => {
  const value = table[key];
  if (value === undefined) throw new RangeError(`No entry for key ${key}`);
  return value;
};

export { entryOf };
