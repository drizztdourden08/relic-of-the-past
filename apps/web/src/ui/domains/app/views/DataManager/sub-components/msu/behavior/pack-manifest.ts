/* @layer renderer-components @kind logic */
/**
 * The UI works against an *effective* manifest: the pack's own when it has one, otherwise a
 * synthesized single-layer view of its numbered files. Only an explicit save writes one out.
 */
import type { MsuLayer, MsuPackManifest, MsuTrackDef } from '@shared/types/msu-manifest';
import { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import type { TrackInfo } from '../msu.type';

const effectiveManifest = (
  pack: string, manifest: MsuPackManifest | null, trackInfos: TrackInfo[],
): MsuPackManifest =>
  effectivePackManifest(pack, manifest, trackInfos.map((t) => ({ fileName: t.fileName, trackNum: t.trackNum })));

/** What the preview engine is handed: the one track asked for and nothing else to decode. */
const singleTrackManifest = (manifest: MsuPackManifest, trackNum: number): MsuPackManifest => ({
  ...manifest,
  tracks: manifest.tracks.filter((t) => t.trackNum === trackNum),
});

const layersOfTrack = (manifest: MsuPackManifest, trackNum: number): MsuLayer[] =>
  manifest.tracks.find((t) => t.trackNum === trackNum)?.layers ?? [];

/** The manifest with one track's layers replaced, inserting the track when it is new. */
const withTrackLayers = (
  manifest: MsuPackManifest, trackNum: number, layers: MsuLayer[],
): MsuPackManifest => {
  const replaced: MsuTrackDef = { trackNum, layers };
  const tracks = manifest.tracks.some((t) => t.trackNum === trackNum)
    ? manifest.tracks.map((t) => (t.trackNum === trackNum ? replaced : t))
    : [...manifest.tracks, replaced].sort((a, b) => a.trackNum - b.trackNum);
  return { ...manifest, tracks };
};

// The default layer for a slot: `single` with one file (repeats at the file's loop point), sequential with several.
const bodyLayer = (trackNum: number, files: string[]): MsuLayer => ({
  id: `track-${trackNum}`,
  name: `Track ${trackNum}`,
  files,
  mode: files.length > 1 ? { kind: 'loop', order: 'sequential' } : { kind: 'loop', order: 'single' },
  volume: 100,
});

/** Replaces a track's first layer's files. This is the "assign this file to this slot" edit. */
const withTrackFiles = (
  manifest: MsuPackManifest, trackNum: number, files: string[],
): MsuPackManifest => {
  const layers = layersOfTrack(manifest, trackNum);
  if (layers.length === 0) {
    return files.length === 0 ? manifest : withTrackLayers(manifest, trackNum, [bodyLayer(trackNum, files)]);
  }
  return withTrackLayers(manifest, trackNum, layers.map((layer, i) => (i === 0 ? { ...layer, files } : layer)));
};

const withTrackFile = (
  manifest: MsuPackManifest, trackNum: number, fileName: string | null,
): MsuPackManifest => withTrackFiles(manifest, trackNum, fileName ? [fileName] : []);

/** Adds freshly uploaded files to a track's first layer, keeping whatever is already there. */
const withTrackFilesAdded = (
  manifest: MsuPackManifest, trackNum: number, fileNames: string[],
): MsuPackManifest => {
  if (fileNames.length === 0) return manifest;
  const existing = layersOfTrack(manifest, trackNum)[0]?.files ?? [];
  return withTrackFiles(manifest, trackNum, [...existing, ...fileNames.filter((f) => !existing.includes(f))]);
};

export {
  effectiveManifest, singleTrackManifest, layersOfTrack, withTrackLayers,
  bodyLayer, withTrackFiles, withTrackFile, withTrackFilesAdded,
};
