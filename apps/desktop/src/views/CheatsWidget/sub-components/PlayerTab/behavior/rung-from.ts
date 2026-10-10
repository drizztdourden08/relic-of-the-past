/* @layer renderer-widgets @kind logic */
const rungShift = (onRung: boolean, dir: 1 | -1): number => {
  if (dir === -1) return -1;
  return onRung ? 1 : 0;
};

const rungFrom = (ladder: readonly number[], value: number, dir: 1 | -1): number => {
  const at = ladder.findIndex((rung) => rung >= value);
  const index = at < 0 ? ladder.length - 1 : at;
  const next = index + rungShift(ladder[index] === value, dir);
  const rung = ladder[Math.min(ladder.length - 1, Math.max(0, next))];
  if (rung === undefined) throw new Error('rung ladder is empty');
  return rung;
};

export { rungFrom };
