/* @layer shared-game @kind logic */
const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

export { isUnknownArray };
