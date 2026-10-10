/* @layer shared-storage @kind types */
import type { RomKind } from '../kinds';

type RomImportResult = { success: boolean; romFile: string; error?: string; alreadyExists?: boolean };
type ImportPhase = (phase: 'extract' | 'copy', loaded?: number, total?: number) => void;
type RomEntry = { romFile: string; kind: RomKind };
type RomStatus = { romFile: string; hasAssets: boolean; assetSize: number | null };
type SupplementStatus = { romFile: string; kind: RomKind; attachedTo: string[]; bytes: number | null };
type RomInfo = { name: string; size: number; hash: string; created: string; modified: string };
type RomBytes = { fileName: string; bytes: Uint8Array };
type RomCandidate = { ok: true; name: string; bytes: Uint8Array } | { ok: false; error: string };

export type {
  ImportPhase, RomBytes, RomCandidate, RomEntry, RomImportResult, RomInfo, RomStatus, SupplementStatus,
};
