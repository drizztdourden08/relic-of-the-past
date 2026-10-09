/* @layer shared-storage @kind types */
type MsuFileMetadata = {
  name: string;
  size: number;
  ext: string;
  durationSeconds: number | null;
  sampleRate: number | null;
  channels: number | null;
  bitRate: number | null;
};

type MsuPackSummary = { name: string; fileCount: number; totalSize: number };

type MsuPackFile = { name: string; size: number };

type MsuTrackFile = { fileName: string; trackNum: number; ext: string };

type MsuTrackUpload = { name: string; bytes: Uint8Array };

export type { MsuFileMetadata, MsuPackFile, MsuPackSummary, MsuTrackFile, MsuTrackUpload };
