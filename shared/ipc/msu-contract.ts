/* @layer shared-ipc @kind types */
/**
 * The MSU invoke channels: import, pack listing, pack editing (the `.msul` manifest
 * and per-file operations), and the per-save music-resume sidecars. Split out of
 * invoke-contract.ts's single `InvokeContract` (which extends this) purely to keep
 * that file under the line cap — this is still the one source of truth for these
 * signatures.
 */
import type { MsuPackManifest, MsuPackMeta, MsuResumeState } from '@shared/types/msu-manifest';
import type { OptimizeAnalysis, OptimizeRunResult } from '@shared/types/msu-optimize';
import type { SaveKind } from '@shared/storage/save-paths';

type MsuResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  /** Audio the archive kept below the pack's own level — alternates and extras, not tracks. */
  skippedNested?: number;
  /** Audio dropped because an earlier file already claimed its track number. */
  skippedDuplicate?: number;
};
/** One audio file in a pack. Also the shape of `msu:getPackFiles`. */
type MsuFileEntry = { name: string; size: number };


interface MsuInvokeContract {
  'msu:import': (packName: string, url: string) => Promise<MsuResult>;
  'msu:importFile': (packName: string, filePath: string) => Promise<MsuResult>;
  'msu:listPacks': () => Promise<Array<{ name: string; fileCount: number; totalSize: number }>>;
  'msu:getPackFiles': (packName: string) => Promise<MsuFileEntry[]>;
  'msu:deletePack': (packName: string) => Promise<void>;
  'msu:getTrackList': (packName: string) => Promise<Array<{ fileName: string; trackNum: number; ext: string }>>;
  'msu:readTrackFile': (packName: string, fileName: string) => Promise<ArrayBuffer>;
  /** Reads a `.msul` the app was opened with (file association). Rejects any other extension. */
  'msu:readMsulFile': (filePath: string) => Promise<ArrayBuffer>;

  // ── Pack editing ──
  /** Every audio file in the pack, whatever its name — a layered pack's files are
   *  arbitrary, so `msu:getTrackList` (numbered MSU tracks only) cannot see them. */
  'msu:listAudioFiles': (packName: string) => Promise<MsuFileEntry[]>;
  /** null for a classic pack (no manifest) and for a version this build cannot read. */
  'msu:readManifest': (packName: string) => Promise<MsuPackManifest | null>;
  'msu:writeManifest': (packName: string, manifest: MsuPackManifest) => Promise<void>;
  /** Rejects when the pack already exists, rather than merging into it. */
  'msu:createPack': (packName: string, meta?: Partial<MsuPackMeta>) => Promise<void>;
  'msu:renamePack': (from: string, to: string) => Promise<void>;
  'msu:renameTrackFile': (packName: string, from: string, to: string) => Promise<void>;
  'msu:deleteTrackFile': (packName: string, fileName: string) => Promise<void>;
  'msu:writeTrackFile': (packName: string, fileName: string, data: ArrayBuffer) => Promise<void>;

  // ── Normalising a pack to one audio format ──
  /** Measures every candidate by really encoding a slice of it, so nothing is written yet.
   *  One encoder run per file, reported on `msu:optimize:progress`. */
  'msu:optimize:analyze': (packName: string) => Promise<OptimizeAnalysis>;
  /** Moves repeat points into the manifest FIRST, then encodes and re-points it at the new
   *  names. Originals are kept — removing them is a separate action. */
  'msu:optimize:run': (packName: string, fileNames: string[]) => Promise<OptimizeRunResult>;

  // ── Per-save music-resume sidecars (`{save}.msu.json`, beside the save) ──
  'msu:readResume': (profileId: string, kind: SaveKind, id: string | number) => Promise<MsuResumeState | null>;
  'msu:writeResume': (profileId: string, kind: SaveKind, id: string | number,
    state: MsuResumeState) => Promise<void>;
  'msu:deleteResume': (profileId: string, kind: SaveKind, id: string | number) => Promise<void>;
}

export type { MsuInvokeContract, MsuResult, MsuFileEntry };
