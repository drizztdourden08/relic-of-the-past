/* @layer electron-main @kind logic */
/** Shared `{ success, error }` envelope helpers for import-style IPC handlers. */

/** Extract a human-readable message from an unknown thrown value. */
const errMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** Build a failure envelope from a thrown value. */
const fail = (err: unknown): { success: false; error: string } => ({ success: false, error: errMessage(err) });

export { errMessage, fail };
