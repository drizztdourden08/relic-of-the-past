/* @layer shared-types @kind types */
/**
 * What the renderer hands the main process to write an Archipelago host files: the slot
 * player file, rendered from the profile, and the bytes of the world package for the
 * Archipelago version in use, fetched from the app bundle.
 */
interface ArchipelagoSaveFilesRequest {
  slotName: string;
  yaml: string;
  apworld: ArrayBuffer;
}

/**
 * Outcome of writing a profile Archipelago files (player file and world package) to a folder.
 * `reason` of `cancelled` means the folder picker was dismissed and nothing was written.
 */
type ArchipelagoSaveFilesResult =
  | { ok: true; folder: string; files: string[] }
  | { ok: false; reason: string };

interface ArchipelagoInvokeContract {
  'archipelago:save-files': (request: ArchipelagoSaveFilesRequest) => Promise<ArchipelagoSaveFilesResult>;
}

export type { ArchipelagoInvokeContract, ArchipelagoSaveFilesRequest, ArchipelagoSaveFilesResult };
