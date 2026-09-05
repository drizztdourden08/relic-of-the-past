/* @layer shared-storage @kind logic */
/**
 * Presents a classic MSU-1 pack (bare `<n>.pcm` files, no manifest) as a manifest with one
 * layer per track, so the engine has a single shape to play and imported and authored packs
 * travel the same path.
 */
import type { MsuPackManifest, MsuTrackDef } from '@shared/types/msu-manifest';
import { trackRepeats } from '@shared/game/data/msu-track-repeat';

interface ClassicTrack {
  fileName: string;
  trackNum: number;
}

const classicTrackDef = (track: ClassicTrack): MsuTrackDef => ({
  trackNum: track.trackNum,
  layers: [{
    id: `track-${track.trackNum}`,
    name: `Track ${track.trackNum}`,
    files: [track.fileName],
    // The game's own table decides looping; a fanfare must not repeat. One file per slot repeating
    // at its own loop point is `single`; `sequential` would describe a pool of files that is not there.
    mode: trackRepeats(track.trackNum) ? { kind: 'loop', order: 'single' } : { kind: 'once' },
    volume: 100,
  }],
});

/**
 * One file per slot. Packs in the wild do contain two files claiming the same number (`3.pcm`
 * beside `themename-3.pcm`); MSU-1 only ever opens one. Resolved deterministically: the
 * canonical `<n>.<ext>` wins, otherwise the first name alphabetically.
 */
const dedupeByTrackNum = (tracks: ClassicTrack[]): ClassicTrack[] => {
  const best = new Map<number, ClassicTrack>();
  for (const track of [...tracks].sort((a, b) => a.fileName.localeCompare(b.fileName))) {
    const existing = best.get(track.trackNum);
    if (!existing) { best.set(track.trackNum, track); continue; }
    const canonical = new RegExp(`^${track.trackNum}\\.[a-z0-9]+$`, 'i');
    if (canonical.test(track.fileName)) best.set(track.trackNum, track);
  }
  return [...best.values()].sort((a, b) => a.trackNum - b.trackNum);
};

const synthesizeClassicManifest = (packName: string, tracks: ClassicTrack[]): MsuPackManifest => {
  const now = Date.now();
  return {
    version: 1,
    meta: { name: packName, createdAt: now, modifiedAt: now },
    tracks: dedupeByTrackNum(tracks).map(classicTrackDef),
  };
};

/**
 * A manifest describes only the authored slots; every other numbered file still has to play.
 * Authored tracks win and the remaining `<n>.pcm` files fill the gaps, otherwise adding layers
 * to one slot would silence the rest of the pack.
 */
const mergeClassicTracks = (manifest: MsuPackManifest, tracks: ClassicTrack[]): MsuPackManifest => {
  const authored = new Set(manifest.tracks.map((t) => t.trackNum));
  const filled = dedupeByTrackNum(tracks).filter((t) => !authored.has(t.trackNum)).map(classicTrackDef);
  if (filled.length === 0) return manifest;
  return { ...manifest, tracks: [...manifest.tracks, ...filled].sort((a, b) => a.trackNum - b.trackNum) };
};

/** The manifest to actually play or edit: the pack's own filled in, or the synthesized view. */
const effectivePackManifest = (
  packName: string, manifest: MsuPackManifest | null, tracks: ClassicTrack[],
): MsuPackManifest =>
  manifest ? mergeClassicTracks(manifest, tracks) : synthesizeClassicManifest(packName, tracks);

export { synthesizeClassicManifest, mergeClassicTracks, effectivePackManifest };
export type { ClassicTrack };
