/* @layer shared-ipc @kind types */
import type { MsuPackManifest, MsuPackMeta, MsuResumeState } from '@shared/types/msu-manifest';
import type { OptimizeAnalysis, OptimizeRunResult } from '@shared/types/msu-optimize';
import type { SaveKind } from '@shared/storage/save-paths';

type MsuResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  skippedNested?: number;
  skippedDuplicate?: number;
};

type MsuFileEntry = { name: string; size: number };

interface MsuInvokeContract {
  'msu:import': (packName: string, url: string) => Promise<MsuResult>;
  'msu:importFile': (packName: string, filePath: string) => Promise<MsuResult>;
  'msu:listPacks': () => Promise<Array<{ name: string; fileCount: number; totalSize: number }>>;
  'msu:getPackFiles': (packName: string) => Promise<MsuFileEntry[]>;
  'msu:deletePack': (packName: string) => Promise<void>;
  'msu:getTrackList': (packName: string) => Promise<Array<{ fileName: string; trackNum: number; ext: string }>>;
  'msu:readTrackFile': (packName: string, fileName: string) => Promise<ArrayBuffer>;
  'msu:readMsulFile': (filePath: string) => Promise<ArrayBuffer>;

  'msu:listAudioFiles': (packName: string) => Promise<MsuFileEntry[]>;
  'msu:readManifest': (packName: string) => Promise<MsuPackManifest | null>;
  'msu:writeManifest': (packName: string, manifest: MsuPackManifest) => Promise<void>;
  'msu:createPack': (packName: string, meta?: Partial<MsuPackMeta>) => Promise<void>;
  'msu:renamePack': (from: string, to: string) => Promise<void>;
  'msu:renameTrackFile': (packName: string, from: string, to: string) => Promise<void>;
  'msu:deleteTrackFile': (packName: string, fileName: string) => Promise<void>;
  'msu:writeTrackFile': (packName: string, fileName: string, data: ArrayBuffer) => Promise<void>;

  'msu:optimize:analyze': (packName: string) => Promise<OptimizeAnalysis>;
  'msu:optimize:run': (packName: string, fileNames: string[]) => Promise<OptimizeRunResult>;

  'msu:readResume': (profileId: string, kind: SaveKind, id: string | number) => Promise<MsuResumeState | null>;
  'msu:writeResume': (profileId: string, kind: SaveKind, id: string | number,
    state: MsuResumeState) => Promise<void>;
  'msu:deleteResume': (profileId: string, kind: SaveKind, id: string | number) => Promise<void>;
}

export type { MsuInvokeContract, MsuResult, MsuFileEntry };
