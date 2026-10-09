/* @layer electron-main @kind logic */
const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export { errorText };
