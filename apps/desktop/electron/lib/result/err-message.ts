/* @layer electron-main @kind logic */
const errMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export { errMessage };
