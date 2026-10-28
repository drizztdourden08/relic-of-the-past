/* @layer shared-types @kind types */
interface ArchipelagoSaveFilesRequest {
  slotName: string;
  yaml: string;
  apworld: ArrayBuffer;
}

type ArchipelagoSaveFilesResult =
  | { ok: true; folder: string; files: string[] }
  | { ok: false; reason: string };

interface ArchipelagoInvokeContract {
  'archipelago:save-files': (request: ArchipelagoSaveFilesRequest) => Promise<ArchipelagoSaveFilesResult>;
}

export type { ArchipelagoInvokeContract, ArchipelagoSaveFilesRequest, ArchipelagoSaveFilesResult };
