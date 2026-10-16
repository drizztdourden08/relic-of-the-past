/* @layer shared-storage @kind types */
import type { RomKind } from '../kinds';

type RomImportResult = { success: boolean; romFile: string; error?: string; alreadyExists?: boolean };
type ImportPhase = (phase: 'extract' | 'copy', loaded?: number, total?: number) => void;
type RomEntry = { romFile: string; kind: RomKind };
type SupplementStatus = { romFile: string; kind: RomKind; attachedTo: string[]; bytes: number | null };
type RomInfo = { name: string; size: number; hash: string; created: string; modified: string };
type RomBytes = { fileName: string; bytes: Uint8Array };

export type {
  ImportPhase, RomBytes, RomEntry, RomImportResult, RomInfo, SupplementStatus,
};
