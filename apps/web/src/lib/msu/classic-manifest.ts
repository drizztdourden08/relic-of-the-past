/* @layer renderer-lib @kind logic */
/**
 * Presents a classic MSU-1 pack (bare `<n>.pcm` files, no manifest) as a manifest with one
 * layer per track. That way the engine has a single shape to play and nothing downstream
 * needs a "is this a layered pack?" branch — imported packs and authored ones travel the
 * same path.
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
    // The game's own table decides looping; a fanfare must not repeat.
    mode: trackRepeats(track.trackNum) ? { kind: 'loop', order: 'sequential' } : { kind: 'once' },
    volume: 100,
  }],
});

/**
 * One file per slot. Packs in the wild do contain two files claiming the same number (a
 * `3.pcm` beside a `themename-3.pcm`), which is ambiguous by construction — MSU-1 itself only
 * ever opens one. Resolve it deterministically instead of letting insertion order decide:
 * the canonically-named `<n>.<ext>` wins, otherwise the first name alphabetically.
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
 * A manifest describes only the slots someone actually authored; every other numbered file in
 * the pack still has to play. So authored tracks win, and the pack's remaining `<n>.pcm` files
 * fill the gaps — otherwise adding layers to one slot would silence the whole rest of the pack.
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
