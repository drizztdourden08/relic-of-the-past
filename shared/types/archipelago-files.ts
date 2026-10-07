/* @layer shared-types @kind types */
/**
 * Outcome of writing a profile's Archipelago files (player file + world package) to a folder.
 * `notice` is a line the player should read even though the files were written.
 */
type ArchipelagoSaveFilesResult =
  | { ok: true; folder: string; files: string[]; notice?: string }
  | { ok: false; reason: string };

export type { ArchipelagoSaveFilesResult };
