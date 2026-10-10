/* @layer shared-asset-extraction @kind logic */
const brrFilter = (filter: number, old: number, older: number): number => {
  if (filter === 0) return 0;
  if (filter === 1) return old + ((-old) >> 4);
  if (filter === 2) return old * 2 + ((-old * 3) >> 5) - older + ((older) >> 4);
  if (filter === 3) return old * 2 + ((-old * 13) >> 6) - older + ((older * 3) >> 4);
  throw new Error(`BRR filter ${filter} does not exist`);
};

export { brrFilter };
