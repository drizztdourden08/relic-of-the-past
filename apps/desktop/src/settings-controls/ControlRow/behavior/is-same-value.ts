/* @layer renderer-app @kind logic */
const isSameValue = (a: unknown, b: unknown): boolean => a === b || JSON.stringify(a) === JSON.stringify(b);

export { isSameValue };
