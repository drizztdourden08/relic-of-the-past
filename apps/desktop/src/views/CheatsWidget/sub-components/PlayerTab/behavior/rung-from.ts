/* @layer renderer-widgets @kind logic */
const rungFrom = (ladder: readonly number[], value: number, dir: 1 | -1): number => {
  const at = ladder.findIndex((rung) => rung >= value);
  const index = at < 0 ? ladder.length - 1 : at;
  const next = index + (dir === 1 ? (ladder[index] === value ? 1 : 0) : -1);
  return ladder[Math.min(ladder.length - 1, Math.max(0, next))];
};

export { rungFrom };
