/* @layer shared-game @kind logic */
const leadingPrizes = (count: number, throwCount: number): Map<number, number> => {
  const prizeAt = new Map<number, number>();
  for (let index = 0; index < Math.min(count, throwCount); index += 1) prizeAt.set(index, index);
  return prizeAt;
};

export { leadingPrizes };
