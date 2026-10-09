/* @layer electron-main @kind types */
import type { DebugZipEntry } from '@drizztdourden08/brock-electron/main';
import type { ReportZip } from '@rotp/hub-contracts';

interface SaveInReport {
  kind: 'quick' | 'normal' | 'auto' | 'live';
  ref: string;
  savedAt: number;
}

interface QuickSlot {
  slot: number;
  savedAt: number;
  bytes: Uint8Array;
}

interface CollectedSaves {
  entries: DebugZipEntry[];
  saves: SaveInReport[];
}

interface CollectedCaptures {
  entries: DebugZipEntry[];
  sessionKeys: string[];
}

interface ReportEntries {
  entries: DebugZipEntry[];
  saves: SaveInReport[];
  sessionKeys: string[];
}

interface BuiltReportZip {
  path: string;
  zip: ReportZip;
  profileId: string;
  sessionKeys: string[];
}

interface PackagedAttachment {
  built: BuiltReportZip | null;
  error: string | null;
}

export type { SaveInReport, QuickSlot, CollectedSaves, CollectedCaptures, ReportEntries, BuiltReportZip, PackagedAttachment };
