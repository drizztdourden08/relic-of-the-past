/* @layer shared-game @kind logic */
const recordBy = <T, K extends string, V>(
  items: readonly T[], keyOf: (item: T) => K, valueOf: (item: T) => V,
): Record<K, V> => Object.fromEntries(items.map((item) => [keyOf(item), valueOf(item)])) as Record<K, V>;

export { recordBy };
