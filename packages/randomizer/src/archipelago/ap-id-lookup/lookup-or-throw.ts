/* @layer shared-game @kind logic */
const lookupOrThrow = <K, V>(table: ReadonlyMap<K, V>, key: K, what: string): V => {
  const value = table.get(key);
  if (value === undefined) throw new Error(`no Archipelago ${what}: ${String(key)}`);
  return value;
};

export { lookupOrThrow };
