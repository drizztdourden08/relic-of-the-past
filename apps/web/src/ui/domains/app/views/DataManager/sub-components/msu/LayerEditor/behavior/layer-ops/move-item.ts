/* @layer renderer-components @kind logic */
const moveItem = <T,>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export { moveItem };
