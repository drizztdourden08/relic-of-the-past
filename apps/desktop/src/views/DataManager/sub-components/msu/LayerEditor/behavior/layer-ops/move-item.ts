/* @layer renderer-components @kind logic */
const moveItem = <T,>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  const moved = items[index];
  const displaced = items[target];
  if (target < 0 || moved === undefined || displaced === undefined) return items;
  const next = [...items];
  next[index] = displaced;
  next[target] = moved;
  return next;
};

export { moveItem };
