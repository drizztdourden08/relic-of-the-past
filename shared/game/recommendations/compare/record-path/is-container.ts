/* @layer shared-game @kind logic */
const isContainer = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export { isContainer };
