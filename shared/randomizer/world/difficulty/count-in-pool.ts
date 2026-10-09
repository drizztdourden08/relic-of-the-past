/* @layer shared-game @kind logic */
const countInPool = (pool: readonly string[], name: string): number =>
  pool.reduce((total, item) => (item === name ? total + 1 : total), 0);

export { countInPool };
