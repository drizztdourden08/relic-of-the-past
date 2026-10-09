/* @layer renderer-lib @kind logic */
const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export { errorMessage };
