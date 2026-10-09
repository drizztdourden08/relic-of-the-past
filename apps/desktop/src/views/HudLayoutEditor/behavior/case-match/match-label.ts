/* @layer renderer-components @kind logic */
const matchLabel = (wins: number, total: number): string | null => {
  if (wins === 0) return null;
  return total === 1 ? 'matches now' : `matches ${wins} of ${total}`;
};

export { matchLabel };
