/* @layer shared-game @kind logic */
const definedEntries = (v: Record<string, unknown>): [string, unknown][] =>
  Object.entries(v).filter(([, val]) => val !== undefined);

export { definedEntries };
